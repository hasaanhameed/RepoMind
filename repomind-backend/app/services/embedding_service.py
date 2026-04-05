from sentence_transformers import SentenceTransformer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database.connection import get_db

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

#1. Convert code chunk to 384 dimensional vector
def get_embedding(text_input: str) -> list:  
    return embedding_model.encode(text_input).tolist()

#2. Store vector in database
async def store_embedding(file_path: str, content: str, db: AsyncSession):
    embedding = get_embedding(content)
    await db.execute(
        text("""
            INSERT INTO code_chunks (file_path, content, embedding)
            VALUES (:file_path, :content, :embedding)
        """),
        {"file_path": file_path, "content": content, "embedding": str(embedding)}
    )
    await db.commit()