from fastapi import APIRouter, Depends
from app.schemas.agent import IngestRequest, IngestResponse
from app.services.agent_service import ingest_repo
from app.services.get_current_user_service import get_current_user

router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/ingest", response_model=IngestResponse, dependencies=[Depends(get_current_user)])
async def ingest_repository(request: IngestRequest):
    message = await ingest_repo(request.github_url)
    return IngestResponse(message=message)