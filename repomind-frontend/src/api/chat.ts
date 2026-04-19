import api from '../lib/axios';
import { ChatRequest, ChatResponse } from './types/chat_type';

export const sendMessage = async (message: string, repo_url: string) => {
  const response = await api.post<ChatResponse>('/chat/', { message, repo_url });
  return response.data;
};
