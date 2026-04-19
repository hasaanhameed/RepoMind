from fastapi import APIRouter, Depends, BackgroundTasks
from app.schemas.agent import IngestRequest, IngestResponse
from app.services.agent_service import ingest_repo
from app.services.get_current_user_service import get_current_user
from app.services.ingestion_status_service import ingestion_status_service

router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/ingest", response_model=IngestResponse, dependencies=[Depends(get_current_user)])
async def ingest_repository(request: IngestRequest, background_tasks: BackgroundTasks):
    # Start the ingestion in the background to prevent timeouts
    background_tasks.add_task(ingest_repo, request.github_url)
    return IngestResponse(message="Ingestion started in the background. You can track progress in the UI.")

@router.get("/status", dependencies=[Depends(get_current_user)])
async def get_ingestion_status(github_url: str):
    """
    Returns the real-time status of a repository ingestion from Redis.
    """
    return await ingestion_status_service.get_status(github_url)