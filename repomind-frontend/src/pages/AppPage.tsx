import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import ChatInterface from "@/components/ChatInterface";

const INITIAL_CHATS = ["Chat 1", "Chat 2", "Chat 3"];

const AppPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatIndex, setActiveChatIndex] = useState(0);

  const handleNewChat = () => {
    const newName = `Chat ${chats.length + 1}`;
    setChats((prev) => [...prev, newName]);
    setActiveChatIndex(chats.length);
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chats={chats}
        activeChatIndex={activeChatIndex}
        onSelectChat={setActiveChatIndex}
        onNewChat={handleNewChat}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-11 flex items-center border-b border-border px-4 gap-3">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              →
            </button>
          )}
          <span className="text-sm font-semibold text-foreground tracking-tight">
            RepoMind
          </span>
        </div>

        <div className="flex-1 min-h-0">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default AppPage;
