import { useState } from "react";

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: string[];
  activeChatIndex: number;
  onSelectChat: (index: number) => void;
  onNewChat: () => void;
}

const AppSidebar = ({
  isOpen,
  onToggle,
  chats,
  activeChatIndex,
  onSelectChat,
  onNewChat,
}: AppSidebarProps) => {
  const [historyOpen, setHistoryOpen] = useState(true);

  return (
    <aside
      className={`shrink-0 border-r border-border bg-sidebar flex flex-col h-screen transition-all duration-300 ${
        isOpen ? "w-64" : "w-0 overflow-hidden border-r-0"
      }`}
    >
      <div className="px-5 py-5 flex items-center justify-between">
        <span className="text-sm text-sidebar-foreground whitespace-nowrap">
          Welcome, User
        </span>
        <button
          onClick={onToggle}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
            {chats.map((chat, i) => (
              <button
                key={i}
                onClick={() => onSelectChat(i)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  i === activeChatIndex
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                {chat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border">
        <button
          onClick={onNewChat}
          className="w-full text-left px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          + New Chat
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
