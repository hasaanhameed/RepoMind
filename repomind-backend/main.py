from fastapi import FastAPI
from app.routes import chat, embedding
app = FastAPI()


app.include_router(chat.router)
app.include_router(embedding.router)
