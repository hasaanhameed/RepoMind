from fastapi import FastAPI, CORSMiddleware
from app.routes import chat, embedding

app = FastAPI(title="RepoMind Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(embedding.router)
