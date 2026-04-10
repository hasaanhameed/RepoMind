from pydantic import BaseModel

class EmbedRequest(BaseModel):
    file_path: str

class EmbedResponse(BaseModel):
    message: str

class SearchRequest(BaseModel):
    query: str

class SearchResponse(BaseModel):
    results: list