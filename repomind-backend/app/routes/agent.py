from fastapi import APIRouter
from app.schemas.agent import IngestRequest, IngestResponse
from app.services.agent_service import ingest_repo

router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/ingest", response_model=IngestResponse)
async def ingest_repository(request: IngestRequest):
    message = await ingest_repo(request.github_url)
    return IngestResponse(message=message)