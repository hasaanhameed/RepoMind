import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import { ingestRepo } from "@/api/agent";
import { sendMessage } from "@/api/chat";

interface Message {
  role: "user" | "ai";
  content: string;
  file?: string;
}

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
  const [showIngestionSuccess, setShowIngestionSuccess] = useState(false);
  const [ingestionStep, setIngestionStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [ingestionError, setIngestionError] = useState<string | null>(null);
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
    setIngestionError(null);

    // Keep the status messages cycling while we wait for the real API
    ingestionInterval.current = setInterval(() => {
      setIngestionStep((prev) => (prev + 1) % INGESTION_MESSAGES.length);
    }, 3000);

    try {
      const response = await ingestRepo(repoUrl);
      setIsIngesting(false);
      setIsIngested(true);
      setShowIngestionSuccess(true);
      console.log("Ingestion success:", response.message);
    } catch (err: any) {
      setIngestionError(err.response?.data?.detail || "Failed to ingest repository. Please check the URL and try again.");
      setIsIngesting(false);
    } finally {
      clearInterval(ingestionInterval.current);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isIngested) return;

    setShowIngestionSuccess(false);
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsSending(true);

    try {
      const data = await sendMessage(userMessage, repoUrl);
      const fullReply = data.reply || "No response received.";
      
      // Add an empty AI message to begin the typing effect
      setMessages((prev) => [...prev, { role: "ai", content: "" }]);
      
      let currentLength = 0;
      const typeSpeed = 10; // ms per chunk
      const charsPerTick = 3; // number of characters to add per tick for a smooth but fast feel

      const typeInterval = setInterval(() => {
        currentLength += charsPerTick;
        const displayedText = fullReply.slice(0, currentLength);
        
        setMessages((prev) => {
          const next = [...prev];
          const lastIndex = next.length - 1;
          if (lastIndex >= 0 && next[lastIndex].role === "ai") {
            next[lastIndex] = { ...next[lastIndex], content: displayedText };
          }
          return next;
        });
        
        if (currentLength >= fullReply.length) {
          clearInterval(typeInterval);
          setIsSending(false);
        }
      }, typeSpeed);

    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `**Error:** ${err.response?.data?.detail || "Could not reach the server."}`,
        },
      ]);
      setIsSending(false);
    }
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

        {!isIngesting && !isIngested && !ingestionError && (
          <p className="mt-2 text-xs text-muted-foreground">
            Ingestion typically takes 2–10 minutes depending on repository size.
          </p>
        )}

        {ingestionError && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-md p-3">
            {ingestionError}
          </div>
        )}

        {isIngesting && (
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-foreground animate-pulse-subtle" />
            <p className="text-xs text-muted-foreground">
              {INGESTION_MESSAGES[ingestionStep]}
            </p>
          </div>
        )}

        {showIngestionSuccess && (
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
