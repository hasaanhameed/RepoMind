import { useState, useEffect } from "react";
import { getHistory, getMessages } from "@/api/chat";
import { ChatHistorySchema, MessageSchema } from "@/api/types/chat_type";

export const useChat = () => {
  const [chats, setChats] = useState<ChatHistorySchema[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageSchema[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = async () => {
    try {
      const history = await getHistory();
      setChats(history);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    setIsLoading(true);
    try {
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        setActiveChatId(chatId);
        setRepoUrl(chat.repo_url || "");
        const msgs = await getMessages(chatId);
        setMessages(msgs);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setRepoUrl("");
  };

  const handleChatCreated = (chatId: string, newRepoUrl: string) => {
    setActiveChatId(chatId);
    setRepoUrl(newRepoUrl);
    loadHistory(); 
  };

  return {
    chats,
    activeChatId,
    messages,
    repoUrl,
    isLoading,
    loadHistory,
    handleSelectChat,
    handleNewChat,
    handleChatCreated,
  };
};
