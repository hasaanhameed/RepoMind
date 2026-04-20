import { useState } from "react";
import { ChatHistorySchema } from "@/api/types/chat_type";

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: ChatHistorySchema[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  userName: string;
}

const AppSidebar = ({
  isOpen,
  onToggle,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  userName,
}: AppSidebarProps) => {
  const [historyOpen, setHistoryOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth?mode=login";
  };

  return (
    <aside
      className={`shrink-0 border-r border-border bg-sidebar flex flex-col h-screen transition-all duration-300 ${
        isOpen ? "w-auto min-w-[256px] max-w-[320px]" : "w-0 overflow-hidden border-r-0"
      }`}
    >
      <div className="px-5 py-5 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-sidebar-foreground truncate whitespace-nowrap">
          Welcome, {userName}
        </span>
        <button
          onClick={onToggle}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          ←
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="w-full flex items-center justify-between px-2 mb-2 text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>History</span>
          <span className="text-[10px]">{historyOpen ? "−" : "+"}</span>
        </button>
        {historyOpen && (
          <div className="space-y-0.5">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  chat.id === activeChatId
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <span className="truncate block">{chat.title}</span>
              </button>
            ))}
            {chats.length === 0 && (
                <p className="px-3 py-2 text-xs text-muted-foreground italic">No history yet</p>
            )}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border flex flex-col gap-2">
        <button
          onClick={onNewChat}
          className="w-full text-left px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98] whitespace-nowrap"
        >
          + New Chat
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-all flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;

