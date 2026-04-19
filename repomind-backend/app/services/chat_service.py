from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from app.core.config import settings
from app.services.embedding_service import search_similar_chunks
from app.services.ingestion_status_service import ingestion_status_service

# Initialize LLM
llm = ChatGroq(api_key=settings.GROQ_API_KEY, model="llama-3.3-70b-versatile")

# In-memory history for now (reset on server restart)
conversation_history = []

async def chat(message: str, repo_url: str) -> str:
    """
    Handles a chat request by combining similarity search results with a global Project Map.
    """
    # 1. Retrieval: Get the most relevant code chunks
    relevant_chunks = await search_similar_chunks(message, repo_url, limit=10)
    context_snippets = "\n\n".join([
        f"File: {chunk['file_path']}\n{chunk['content']}"
        for chunk in relevant_chunks
    ])

    # 2. Project Awareness: Fetch the full file tree
    repo_tree = await ingestion_status_service.get_repo_tree(repo_url)
    tree_context = f"\n\nPROJECT STRUCTURE (Global Overview):\n{repo_tree}" if repo_tree else ""

    # 3. Identity & Mission: The RepoMind System Prompt
    system_message = (
        "You are RepoMind, a state-of-the-art AI code analyzer. You are currently analyzing: {repo_url}.\n\n"
        "Your mission is to provide deep, accurate, and proactive technical analysis of the codebase. "
        "You have been provided with specific code snippets relevant to the user's question AND a global map of the project structure.\n\n"
        "PROJECT STRUCTURE (Global Overview):\n{tree_context}\n\n"
        "RELEVANT CODE SNIPPETS:\n"
        "{context_snippets}\n\n"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}")
    ])

    chain = prompt | llm

    # Maintain local history
    conversation_history.append(HumanMessage(content=message))

    response = await chain.ainvoke({
        "repo_url": repo_url,
        "tree_context": repo_tree or "Not available.",
        "context_snippets": context_snippets or "No relevant code snippets found.",
        "history": conversation_history[:-1],
        "question": message
    })

    reply = response.content
    conversation_history.append(AIMessage(content=reply))

    return reply