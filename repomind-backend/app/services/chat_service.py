from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from app.core.config import settings
from app.services.embedding_service import search_similar_chunks

llm = ChatGroq(api_key=settings.GROQ_API_KEY, model="llama-3.3-70b-versatile")

conversation_history = []

async def chat(message: str) -> str:
    relevant_chunks = search_similar_chunks(message)

    context = "\n\n".join([
        f"File: {chunk['file_path']}\n{chunk['content']}"
        for chunk in relevant_chunks
    ])

# System message with context, then conversation history, then the current user question. 
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI code reviewer. Use the following code snippets to answer the user's question:\n\n{context}"),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}")
    ])

    chain = prompt | llm

    conversation_history.append(HumanMessage(content=message))

    response = await chain.ainvoke({
        "context": context,
        "history": conversation_history[:-1],
        "question": message
    })

    reply = response.content
    conversation_history.append(AIMessage(content=reply))

    return reply