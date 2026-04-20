from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatRequest(BaseModel):
    message: str
    repo_url: str
    chat_id: Optional[str] = None # Optional for new chats

class ChatResponse(BaseModel):
    reply: str
    chat_id: str

class MessageSchema(BaseModel):
    role: str
    content: str
    created_at: datetime

class ChatHistorySchema(BaseModel):
    id: str
    title: str
    repo_url: Optional[str]
    created_at: datetime
