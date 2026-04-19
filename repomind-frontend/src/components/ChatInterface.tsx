import { useState, useRef, useEffect } from "react";
import { Github, Cpu, MessageSquare } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { ingestRepo, getIngestionStatus } from "@/api/agent";
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
  const [ingestionProgress, setIngestionProgress] = useState(0);
  const [ingestionStatusText, setIngestionStatusText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [ingestionError, setIngestionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ingestionInterval = useRef<ReturnType<typeof setInterval>>();
  const pollingInterval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (ingestionInterval.current) clearInterval(ingestionInterval.current);
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  const startPolling = (url: string) => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    
    pollingInterval.current = setInterval(async () => {
      try {
        const status = await getIngestionStatus(url);
        setIngestionStatusText(status.message);
        
        if (status.status === "embedding") {
          const percent = Math.round((status.current / status.total) * 100);
          setIngestionProgress(10 + Math.floor(percent * 0.9)); // Cloning is ~10%, embedding is 90%
        } else if (status.status === "cloning") {
          setIngestionProgress(5);
        } else if (status.status === "completed") {
          setIngestionProgress(100);
          setIsIngesting(false);
          setIsIngested(true);
          setShowIngestionSuccess(true);
          if (pollingInterval.current) clearInterval(pollingInterval.current);
          if (ingestionInterval.current) clearInterval(ingestionInterval.current);
        } else if (status.status === "error") {
          setIngestionError(status.message);
          setIsIngesting(false);
          if (pollingInterval.current) clearInterval(pollingInterval.current);
          if (ingestionInterval.current) clearInterval(ingestionInterval.current);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1500);
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setIsIngesting(true);
    setIngestionProgress(0);
    setIngestionStatusText("Initializing ingestion...");
    setIngestionError(null);

    // Keep the status messages cycling as a fallback
    ingestionInterval.current = setInterval(() => {
      setIngestionStep((prev) => (prev + 1) % INGESTION_MESSAGES.length);
    }, 3000);

    try {
      await ingestRepo(repoUrl);
      // Start polling Redis for the actual progress
      startPolling(repoUrl);
    } catch (err: any) {
      setIngestionError(err.response?.data?.detail || "Failed to start ingestion. Is the URL correct?");
      setIsIngesting(false);
      if (ingestionInterval.current) clearInterval(ingestionInterval.current);
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
    <div className="flex flex-col h-full font-sans text-foreground">
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
          <div className="mt-4 space-y-2 animate-message-in">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse-subtle" />
                <span className="font-medium text-foreground">{ingestionStatusText || INGESTION_MESSAGES[ingestionStep]}</span>
              </div>
              <span className="font-mono">{ingestionProgress}%</span>
            </div>
            <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-foreground transition-all duration-500 ease-out" 
                    style={{ width: `${ingestionProgress}%` }}
                />
            </div>
          </div>
        )}

        {showIngestionSuccess && (
          <div className="mt-4 bg-primary/5 border border-border rounded-md p-3 flex items-center gap-3 animate-message-in font-raleway">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <p className="text-sm font-medium text-foreground">
              Repository ingested successfully. You can now ask questions.
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth text-foreground">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center animate-message-in text-center px-4">
            {!isIngested ? (
              <>
                <div className="relative mb-8">
                  <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl" />
                  <Github className="w-20 h-20 text-muted-foreground/30 relative z-10" />
                </div>
                <h1 className="font-raleway text-5xl font-bold tracking-tight text-foreground mb-4">
                  Ingest a repository
                </h1>
                <p className="text-muted-foreground text-xl max-w-md leading-relaxed">
                  Paste a GitHub URL to begin your deep-code analysis and discovery.
                </p>
              </>
            ) : (
              <>
                <div className="relative mb-8">
                  <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl" />
                  <Cpu className="w-20 h-20 text-muted-foreground/30 relative z-10" />
                </div>
                <h1 className="font-raleway text-5xl font-bold tracking-tight text-foreground mb-4">
                  Ready to explore
                </h1>
                <p className="text-muted-foreground text-xl max-w-md leading-relaxed">
                  I've indexed the repository. What would you like to know about the architecture or logic?
                </p>
              </>
            )}
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} file={msg.file} />
        ))}
        {isSending && (
          <div className="flex justify-start mb-4">
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <span className="text-sm text-muted-foreground animate-pulse-subtle font-mono">
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
