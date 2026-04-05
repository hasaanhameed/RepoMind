from pydantic import BaseModel

class EmbedRequest(BaseModel):
    file_path: str
    content: str

class EmbedResponse(BaseModel):
    message: str