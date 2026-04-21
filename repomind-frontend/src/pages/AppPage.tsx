import { useState, useEffect } from "react";
import AppSidebar from "@/components/AppSidebar";
import ChatInterface from "@/components/ChatInterface";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";

const AppPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, fetchMe } = useAuth();
  const {
    chats,
    activeChatId,
    messages,
    repoUrl,
    loadHistory,
    handleSelectChat,
    handleUpdateChatTitle,
    handleDeleteChat,
    handleNewChat,
    handleChatCreated,
  } = useChat();

  useEffect(() => {
    fetchMe();
    loadHistory();
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onUpdateChatTitle={handleUpdateChatTitle}
        onDeleteChat={handleDeleteChat}
        onNewChat={handleNewChat}
        userName={user?.name || "User"}
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
          <span className="text-xl font-bold font-raleway tracking-tighter">
            <span className="text-foreground">Repo</span>
            <span className="text-muted-foreground/60">Mind</span>
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ChatInterface 
            activeChatId={activeChatId}
            initialMessages={messages}
            initialRepoUrl={repoUrl}
            onChatCreated={handleChatCreated}
          />
        </div>
      </div>
    </div>
  );
};

export default AppPage;


