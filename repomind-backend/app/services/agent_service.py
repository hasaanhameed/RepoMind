from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from app.core.config import settings
from app.tools.repo_tools import clone_and_embed_repo

llm = ChatGroq(api_key=settings.GROQ_API_KEY, model="llama-3.3-70b-versatile")

tools = [clone_and_embed_repo]

agent = create_react_agent(
    llm,
    tools,
    prompt="You are a helpful assistant that ingests GitHub repositories for code review."
)

async def ingest_repo(github_url: str) -> str:
    result = await agent.ainvoke({
        "messages": [("human", f"Please clone and embed this repository: {github_url}")]
    })
    return result["messages"][-1].content