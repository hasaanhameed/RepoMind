from fastapi import APIRouter, Depends
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import chat
from app.services.get_current_user_service import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse, dependencies=[Depends(get_current_user)])
async def chat_endpoint(request: ChatRequest):
    reply = await chat(request.message, request.repo_url)
    return ChatResponse(reply=reply)