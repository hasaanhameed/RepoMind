from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database.connection import get_db
from app.schemas.chat import (
    ChatRequest, 
    ChatResponse, 
    MessageSchema, 
    ChatHistorySchema,
    UpdateChatTitleSchema
)
from app.services.chat_service import chat
from app.services.chat_history_service import chat_history_service
from app.services.get_current_user_service import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest, 
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    # 1. Get or Create Chat Session
    chat_id = await chat_history_service.get_or_create_chat(
        db, user.id, request.repo_url, request.chat_id
    )

    # 2. Process Chat with LLM and Persistence
    reply = await chat(db, request.message, request.repo_url, chat_id)
    
    return ChatResponse(reply=reply, chat_id=chat_id)

@router.get("/history", response_model=List[ChatHistorySchema])
async def get_history(
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    return await chat_history_service.get_user_chat_history(db, user.id)

@router.patch("/{chat_id}")
async def rename_chat(
    chat_id: str,
    request: UpdateChatTitleSchema,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    # Verify ownership
    history = await chat_history_service.get_user_chat_history(db, user.id)
    if not any(str(c.id) == chat_id for c in history):
        raise HTTPException(status_code=403, detail="Not authorized to edit this chat")
        
    await chat_history_service.update_chat_title(db, chat_id, request.title)
    return {"message": "Title updated successfully"}

@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    # Verify ownership
    history = await chat_history_service.get_user_chat_history(db, user.id)
    if not any(str(c.id) == chat_id for c in history):
        raise HTTPException(status_code=403, detail="Not authorized to delete this chat")
        
    await chat_history_service.delete_chat(db, chat_id)
    return {"message": "Chat deleted successfully"}

@router.get("/{chat_id}/messages", response_model=List[MessageSchema])
async def get_messages(
    chat_id: str,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    # Verify ownership
    history = await chat_history_service.get_user_chat_history(db, user.id)
    if not any(str(c.id) == chat_id for c in history):
        raise HTTPException(status_code=403, detail="Not authorized to access this chat")
        
    return await chat_history_service.get_chat_messages(db, chat_id)