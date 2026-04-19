export interface ChatRequest {
  message: string;
  repo_url: string;
}

export interface ChatResponse {
  reply: string;
}
