import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "ai";
  content: string;
  file?: string;
}

const ChatMessage = ({ role, content, file }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[75%] ${
          isUser
            ? "bg-secondary text-foreground"
            : "bg-card border border-border text-foreground"
        } rounded-lg px-4 py-3`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose-invert text-sm leading-relaxed">
            <ReactMarkdown
              components={{
                code: ({ className, children, ...props }) => {
                  const isBlock = className?.includes("language-");
                  if (isBlock) {
                    return (
                      <pre className="bg-background border border-border rounded-md p-3 overflow-x-auto my-2">
                        <code className="text-xs font-mono text-foreground">
                          {children}
                        </code>
                      </pre>
                    );
                  }
                  return (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
        {file && !isUser && (
          <p className="mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground">
            {file}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
