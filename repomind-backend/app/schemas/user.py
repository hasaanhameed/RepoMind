from pydantic import BaseModel

class UserCreateRequest(BaseModel):
    name: str
    email: str
    password: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

