from pydantic import BaseModel

class IngestRequest(BaseModel):
    github_url: str

class IngestResponse(BaseModel):
    message: str