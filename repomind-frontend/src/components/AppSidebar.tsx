import { useState, useRef, useEffect } from "react";
import { ChatHistorySchema } from "@/api/types/chat_type";

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: ChatHistorySchema[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onUpdateChatTitle: (id: string, title: string) => void;
  onNewChat: () => void;
  userName: string;
}

const AppSidebar = ({
  isOpen,
  onToggle,
  chats,
  activeChatId,
  onSelectChat,
  onUpdateChatTitle,
  onNewChat,
  userName,
}: AppSidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth?mode=login";
  };

  const startEditing = (e: React.MouseEvent, chat: ChatHistorySchema) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditValue(chat.title);
  };

  const handleSaveEdit = async (id: string) => {
    if (editValue.trim()) {
      onUpdateChatTitle(id, editValue.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
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
        <div className="px-2 mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          History
        </div>
        <div className="space-y-0.5">
          {chats.map((chat) => (
              <div
                key={chat.id}
                className="group relative"
              >
                {editingId === chat.id ? (
                  <div className="px-2 py-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleSaveEdit(chat.id)}
                      onKeyDown={(e) => handleKeyDown(e, chat.id)}
                      className="w-full px-2 py-1 text-sm bg-background border border-primary/50 rounded-md outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectChat(chat.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between gap-2 ${
                      chat.id === activeChatId
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <span className="truncate flex-1">{chat.title}</span>
                    <button
                      onClick={(e) => startEditing(e, chat)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-sidebar-accent-foreground/10 rounded transition-all"
                      title="Rename"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>
                  </button>
                )}
              </div>
            ))}
            {chats.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground italic">No history yet</p>
            )}
        </div>
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


