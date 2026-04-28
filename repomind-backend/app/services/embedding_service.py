import uuid
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_postgres.vectorstores import PGVector
from app.core.config import settings
import os

os.environ["HF_TOKEN"] = settings.HF_TOKEN

# Embedding model (using Inference API to save CPU)
embeddings = HuggingFaceEndpointEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2",
    task="feature-extraction",
    huggingfacehub_api_token=settings.HF_TOKEN
)

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
async def store_file(file_path: str, repo_url: str = ""):
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


async def store_files_batch(file_paths: list[str], repo_url: str):
    """Processes multiple files locally and stores their chunks in a single batch to the vector store."""
    all_chunks = []
    
    for file_path in file_paths:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read().replace("\x00", "")
            
            if not content.strip():
                continue

            documents = [Document(page_content=content, metadata={"source": file_path})]
            chunks = text_splitter.split_documents(documents)
            
            if chunks:
                for chunk in chunks:
                    chunk.metadata["repo_url"] = repo_url
                all_chunks.extend(chunks)
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
            
    if all_chunks:
        ids = [str(uuid.uuid4()) for _ in all_chunks]
        await vector_store.aadd_documents(all_chunks, ids=ids)


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