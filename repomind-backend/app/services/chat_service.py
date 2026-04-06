from groq import AsyncGroq
from app.core.config import settings
from app.database.connection import AsyncSessionLocal
from app.services.embedding_service import search_similar_chunks

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

conversation_history = []

async def chat(message: str) -> str:
    async with AsyncSessionLocal() as db:
        relevant_chunks = await search_similar_chunks(message, db)
    
    context = "\n\n".join([
        f"File: {chunk['file_path']}\n{chunk['content']}"
        for chunk in relevant_chunks
    ])
    
    system_prompt = f"""You are an AI code reviewer. 
Use the following code snippets to answer the user's question:

{context}
"""
    
    conversation_history.append({"role": "user", "content": message})
    
    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": system_prompt}] + conversation_history
    )
    
    reply = response.choices[0].message.content
    conversation_history.append({"role": "assistant", "content": reply})
    
    return reply