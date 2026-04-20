from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List, Optional
from app.schemas.chat import MessageSchema, ChatHistorySchema

class ChatHistoryService:
    async def get_or_create_chat(
        self, db: AsyncSession, user_id: str, repo_url: str, chat_id: Optional[str] = None
    ) -> str:
        if chat_id:
            # Verify chat exists and belongs to user
            result = await db.execute(
                text("SELECT id FROM chats WHERE id = :chat_id AND user_id = :user_id"),
                {"chat_id": chat_id, "user_id": user_id}
            )
            chat = result.fetchone()
            if chat:
                return str(chat.id)

        # Create new chat if no valid chat_id provided
        result = await db.execute(
            text("""
                INSERT INTO chats (user_id, repo_url, title)
                VALUES (:user_id, :repo_url, 'New Chat')
                RETURNING id
            """),
            {"user_id": user_id, "repo_url": repo_url}
        )
        new_chat_id = result.fetchone()[0]
        await db.commit()
        return str(new_chat_id)

    async def save_message(self, db: AsyncSession, chat_id: str, role: str, content: str):
        await db.execute(
            text("""
                INSERT INTO messages (chat_id, role, content)
                VALUES (:chat_id, :role, :content)
            """),
            {"chat_id": chat_id, "role": role, "content": content}
        )
        await db.commit()

    async def get_user_chat_history(self, db: AsyncSession, user_id: str) -> List[ChatHistorySchema]:
        result = await db.execute(
            text("""
                SELECT id, title, repo_url, created_at 
                FROM chats 
                WHERE user_id = :user_id 
                ORDER BY updated_at DESC
            """),
            {"user_id": user_id}
        )
        rows = result.fetchall()
        return [
            ChatHistorySchema(
                id=str(row.id),
                title=row.title,
                repo_url=row.repo_url,
                created_at=row.created_at
            )
            for row in rows
        ]

    async def get_chat_messages(self, db: AsyncSession, chat_id: str) -> List[MessageSchema]:
        result = await db.execute(
            text("""
                SELECT role, content, created_at 
                FROM messages 
                WHERE chat_id = :chat_id 
                ORDER BY created_at ASC
            """),
            {"chat_id": chat_id}
        )
        rows = result.fetchall()
        return [
            MessageSchema(
                role=row.role,
                content=row.content,
                created_at=row.created_at
            )
            for row in rows
        ]

    async def update_chat_title(self, db: AsyncSession, chat_id: str, title: str):
        await db.execute(
            text("UPDATE chats SET title = :title, updated_at = NOW() WHERE id = :chat_id"),
            {"title": title, "chat_id": chat_id}
        )
        await db.commit()

    async def get_message_count(self, db: AsyncSession, chat_id: str) -> int:
        result = await db.execute(
            text("SELECT COUNT(*) FROM messages WHERE chat_id = :chat_id"),
            {"chat_id": chat_id}
        )
        return result.scalar() or 0

chat_history_service = ChatHistoryService()
