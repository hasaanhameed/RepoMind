from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.services.embedding_service import search_similar_chunks
from app.services.ingestion_status_service import ingestion_status_service
from app.services.chat_history_service import chat_history_service

# Initialize LLM
llm = ChatGroq(api_key=settings.GROQ_API_KEY, model="llama-3.3-70b-versatile")

async def chat(db: AsyncSession, message: str, repo_url: str, chat_id: str) -> str:
    """
    Handles a chat request by combining similarity search results with a global Project Map.
    Persistence is handled via the chat_history_service.
    """
    # 1. Save User Message to DB
    await chat_history_service.save_message(db, chat_id, "user", message)

    # 2. Retrieval: Get the most relevant code chunks
    relevant_chunks = await search_similar_chunks(message, repo_url, limit=10)
    context_snippets = "\n\n".join([
        f"File: {chunk['file_path']}\n{chunk['content']}"
        for chunk in relevant_chunks
    ])

    # 3. Project Awareness: Fetch the full file tree
    repo_tree = await ingestion_status_service.get_repo_tree(repo_url)
    tree_context = f"\n\nPROJECT STRUCTURE (Global Overview):\n{repo_tree}" if repo_tree else ""

    # 4. Identity & Mission: The RepoMind System Prompt
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

    # 5. Fetch History from DB
    db_messages = await chat_history_service.get_chat_messages(db, chat_id)
    # Convert DB messages to LangChain format (excluding the very last one which we just saved)
    history = []
    for msg in db_messages[:-1]:
        if msg.role == "user":
            history.append(HumanMessage(content=msg.content))
        else:
            history.append(AIMessage(content=msg.content))

    # 6. Generate Response
    response = await chain.ainvoke({
        "repo_url": repo_url,
        "tree_context": repo_tree or "Not available.",
        "context_snippets": context_snippets or "No relevant code snippets found.",
        "history": history,
        "question": message
    })

    reply = response.content

    # 7. Save Assistant Reply to DB
    await chat_history_service.save_message(db, chat_id, "assistant", reply)

    return reply