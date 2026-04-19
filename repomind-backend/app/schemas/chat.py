from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    repo_url: str

class ChatResponse(BaseModel):
    reply: str