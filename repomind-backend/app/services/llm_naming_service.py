from langchain_groq import ChatGroq
from app.core.config import settings

llm = ChatGroq(api_key=settings.GROQ_API_KEY, model="llama-3.1-8b-instant") # Using a smaller model for naming

async def generate_chat_title(user_message: str, assistant_reply: str) -> str:
    """
    Generates a concise 3-5 word title for a chat based on the first exchange.
    """
    prompt = (
        "Summarize the following exchange into a concise, professional 3-5 word chat title. "
        "Return ONLY the title text, with no quotes or prefixes.\n\n"
        f"User: {user_message}\n"
        f"Assistant: {assistant_reply}\n\n"
        "Title:"
    )
    
    response = await llm.ainvoke(prompt)
    title = response.content.strip().strip('"').strip("'")
    
    # Emotional safety check/fallback
    if not title:
        return "New Chat"
        
    return title[:50] # Sanity limit
