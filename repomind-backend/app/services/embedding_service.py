import uuid
from langchain_community.document_loaders import TextLoader
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
    collection_name="code_chunks"
)

# 1. Load, split and store a file
def store_file(file_path: str):
    loader = TextLoader(file_path)
    documents = loader.load()
    chunks = text_splitter.split_documents(documents)
    ids = [str(uuid.uuid4()) for _ in chunks]
    vector_store.add_documents(chunks, ids=ids)

# 2. Search similar chunks
def search_similar_chunks(query: str, limit: int = 5) -> list:
    results = vector_store.similarity_search(query, k=limit)
    return [{"file_path": doc.metadata["source"], "content": doc.page_content} for doc in results]