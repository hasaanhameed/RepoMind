from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.embedding import EmbedRequest, EmbedResponse, SearchRequest, SearchResponse
from app.services.embedding_service import store_embedding, search_similar_chunks
from app.database.connection import get_db

router = APIRouter(prefix="/embeddings", tags=["embeddings"])

@router.post("/", response_model=EmbedResponse)
async def embed_code(request: EmbedRequest, db: AsyncSession = Depends(get_db)):
    await store_embedding(request.file_path, request.content, db)
    return EmbedResponse(message="Embedding stored successfully")

@router.post("/search", response_model=SearchResponse)
async def search_code(request: SearchRequest, db: AsyncSession = Depends(get_db)):
    results = await search_similar_chunks(request.query, db)
    return SearchResponse(results=results)