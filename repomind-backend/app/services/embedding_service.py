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


# Get similar chunks based on query 
async def search_similar_chunks(query: str, db: AsyncSession, limit: int = 5) -> list:
    query_embedding = get_embedding(query)
    
    result = await db.execute(
        text("""
            SELECT file_path, content
            FROM code_chunks
            ORDER BY embedding <-> :query_embedding
            LIMIT :limit
        """),
        {"query_embedding": str(query_embedding), "limit": limit}
    )
    
    rows = result.fetchall()
    return [{"file_path": row[0], "content": row[1]} for row in rows]