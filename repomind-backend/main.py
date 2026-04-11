from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat, embedding

app = FastAPI(title="RepoMind backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(embedding.router)