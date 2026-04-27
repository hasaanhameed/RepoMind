from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat, embedding, agent, user

app = FastAPI(title="RepoMind backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://repomind-lab.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(embedding.router)
app.include_router(agent.router)
app.include_router(user.router)
