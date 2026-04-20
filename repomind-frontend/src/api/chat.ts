import api from '../lib/axios';
import { ChatRequest, ChatResponse, ChatHistorySchema, MessageSchema } from './types/chat_type';

export const sendMessage = async (message: string, repo_url: string, chat_id?: string) => {
  const response = await api.post<ChatResponse>('/chat/', { message, repo_url, chat_id });
  return response.data;
};

export const getHistory = async () => {
    const response = await api.get<ChatHistorySchema[]>('/chat/history');
    return response.data;
};

export const getMessages = async (chatId: string) => {
    const response = await api.get<MessageSchema[]>(`/chat/${chatId}/messages`);
    return response.data;
};
