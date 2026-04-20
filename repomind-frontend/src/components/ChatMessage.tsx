import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessageProps {
  role: "user" | "ai";
  content: string;
  file?: string;
}

const ChatMessage = ({ role, content, file }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6 animate-message-in`}>
      <div
        className={`max-w-[85%] ${
          isUser
            ? "bg-secondary text-foreground rounded-2xl rounded-tr-sm"
            : "bg-card border border-border text-foreground rounded-2xl rounded-tl-sm shadow-sm"
        } px-5 py-4`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none text-foreground leading-relaxed">
            <ReactMarkdown
              components={{
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const isBlock = !!match;
                  
                  return isBlock ? (
                    <div className="my-4 rounded-lg overflow-hidden border border-border/50 shadow-lg">
                      <div className="bg-muted px-4 py-1.5 border-b border-border/50 flex justify-between items-center">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                          {match[1]}
                        </span>
                      </div>
                      <SyntaxHighlighter
                        language={match[1]}
                        style={oneDark as any}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          padding: "1rem",
                          fontSize: "0.8rem",
                          lineHeight: "1.5",
                          backgroundColor: "#282c34",
                          fontFamily: "'IBM Plex Mono', 'Courier New', monospace"
                        } as React.CSSProperties}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground border border-border/40" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-4 last:mb-0 text-sm">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-2 text-sm">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-sm">{children}</ol>,
                li: ({ children }) => <li className="marker:text-muted-foreground">{children}</li>,
                strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-4 mt-6 first:mt-0 text-foreground">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-3 mt-5 first:mt-0 text-foreground">{children}</h2>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
        {file && !isUser && (
          <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Source: {file}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
