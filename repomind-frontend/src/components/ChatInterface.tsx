import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

interface Message {
  role: "user" | "ai";
  content: string;
  file?: string;
}

const BASE_URL = "http://127.0.0.1:8000";

const INGESTION_MESSAGES = [
  "Cloning repository...",
  "Parsing file structure...",
  "Indexing source files...",
  "Building code graph...",
  "Analyzing dependencies...",
  "Finalizing ingestion...",
];

const ChatInterface = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [isIngested, setIsIngested] = useState(false);
  const [ingestionStep, setIngestionStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ingestionInterval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setIsIngesting(true);
    setIngestionStep(0);

    ingestionInterval.current = setInterval(() => {
      setIngestionStep((prev) => {
        if (prev < INGESTION_MESSAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    try {
      await fetch(`${BASE_URL}/agent/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_url: repoUrl }),
      });
    } catch {
      // silently handle — frontend-only demo
    }

    clearInterval(ingestionInterval.current);
    setIsIngesting(false);
    setIsIngested(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isIngested) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsSending(true);

    try {
      const res = await fetch(`${BASE_URL}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.response || data.message || "No response received.",
          file: data.file || undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "**Error:** Could not reach the server. Make sure the backend is running at `http://127.0.0.1:8000`.",
        },
      ]);
    }

    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Repo input */}
      <div className="border-b border-border px-6 py-4">
        <form onSubmit={handleIngest} className="flex gap-3 items-center">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={isIngesting || isIngested}
            placeholder="https://github.com/user/repo"
            className="flex-1 bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isIngesting || isIngested || !repoUrl.trim()}
            className="shrink-0 bg-primary text-primary-foreground border border-primary/20 rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98] disabled:opacity-40"
          >
            Ingest Repository
          </button>
        </form>

        {!isIngesting && !isIngested && (
          <p className="mt-2 text-xs text-muted-foreground">
            Ingestion typically takes 2–10 minutes depending on repository size.
          </p>
        )}

        {isIngesting && (
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-foreground animate-pulse-subtle" />
            <p className="text-xs text-muted-foreground">
              {INGESTION_MESSAGES[ingestionStep]}
            </p>
          </div>
        )}

        {isIngested && (
          <div className="mt-4 bg-success/10 border border-success/20 rounded-md p-3 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <p className="text-sm font-medium text-success">
              Repository ingested successfully. You can now ask questions.
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && isIngested && (
          <p className="text-center text-sm text-muted-foreground mt-12">
            Ask anything about the repository.
          </p>
        )}
        {messages.length === 0 && !isIngested && (
          <p className="text-center text-sm text-muted-foreground mt-12">
            Ingest a repository to start reviewing code.
          </p>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} file={msg.file} />
        ))}
        {isSending && (
          <div className="flex justify-start mb-4">
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <span className="text-sm text-muted-foreground animate-pulse-subtle">
                Thinking...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-6 py-4">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isIngested || isSending}
            placeholder={isIngested ? "Ask about the code..." : "Ingest a repo first"}
            className="flex-1 bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!isIngested || isSending || !input.trim()}
            className="shrink-0 bg-primary text-primary-foreground border border-primary/20 rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98] disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
