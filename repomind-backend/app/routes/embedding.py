from fastapi import APIRouter
from app.schemas.embedding import EmbedRequest, EmbedResponse, SearchRequest, SearchResponse
from app.services.embedding_service import store_file, search_similar_chunks

router = APIRouter(prefix="/embeddings", tags=["embeddings"])

@router.post("/", response_model=EmbedResponse)
async def embed_code(request: EmbedRequest):
    await store_file(request.file_path)
    return EmbedResponse(message="File embedded successfully")

@router.post("/search", response_model=SearchResponse)
async def search_code(request: SearchRequest):
    results = await search_similar_chunks(request.query)
    return SearchResponse(results=results)