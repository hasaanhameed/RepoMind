from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq
from app.core.config import settings
from app.tools.repo_tools import clone_and_embed_repo

llm = ChatGroq(api_key=settings.GROQ_API_KEY, model="llama-3.3-70b-versatile")

tools = [clone_and_embed_repo]

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant that can ingest GitHub repositories for code review."),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad")
])

agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

async def ingest_repo(github_url: str) -> str:
    result = await agent_executor.ainvoke({
        "input": f"Please clone and embed this repository: {github_url}"
    })
    return result["output"]