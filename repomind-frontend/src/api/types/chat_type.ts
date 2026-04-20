export interface MessageSchema {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatHistorySchema {
  id: string;
  title: string;
  repo_url: string | null;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  repo_url: string;
  chat_id?: string;
}

export interface ChatResponse {
  reply: string;
  chat_id: string;
}
