from fastapi import FastAPI
from app.routes import chat
app = FastAPI()


app.include_router(chat.router)
