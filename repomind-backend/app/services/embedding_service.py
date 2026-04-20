import uuid
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_postgres.vectorstores import PGVector
from app.core.config import settings
import os

os.environ["HF_TOKEN"] = settings.HF_TOKEN

# Embedding model
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Text splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

# PGVector store
vector_store = PGVector(
    connection=settings.DATABASE_URL,
    embeddings=embeddings,
    collection_name="code_chunks",
    async_mode=True
)

# Monkeypatch to bypass "multiple commands" error with asyncpg
async def _no_op_create_extension():
    return

vector_store.acreate_vector_extension = _no_op_create_extension

# 1. Load, split and store a file
async def store_file(file_path: str, repo_url: str):
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read().replace("\x00", "")
        
        if not content.strip():
            return

        documents = [Document(page_content=content, metadata={"source": file_path})]
        chunks = text_splitter.split_documents(documents)
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return
    
    # Incase a file does not generate any chunks (No content)
    if not chunks:
        return
        
    # Tag chunks with repository URL
    for chunk in chunks:
        chunk.metadata["repo_url"] = repo_url

    ids = [str(uuid.uuid4()) for _ in chunks]
    await vector_store.aadd_documents(chunks, ids=ids)


# 2. Delete existing repository data
async def delete_repo_data(repo_url: str):
    """Deletes all chunks associated with a specific repository URL."""
    try:
        await vector_store.adelete(filter={"repo_url": repo_url})
    except Exception as e:
        print(f"Error deleting old repo data: {e}")


# 3. Search similar chunks
async def search_similar_chunks(query: str, repo_url: str, limit: int = 10) -> list:
    results = await vector_store.asimilarity_search(
        query, 
        k=limit, 
        filter={"repo_url": repo_url}
    )
    return [{"file_path": doc.metadata["source"], "content": doc.page_content} for doc in results]