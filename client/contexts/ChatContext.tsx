"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { ChatService } from "@/services/chat.service";
import type { ChatContextType, ChatMessage } from "@/types";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const history = await ChatService.history();
      setMessages(history);
    } catch {
      // keep session messages on failure
    } finally {
      setLoading(false);
      setHistoryLoaded(true);
    }
  }, []);

  const sendMessage = async (content: string) => {
    setError("");
    setMessages((current) => [...current, { role: "user", content }]);
    setStreaming(true);
    try {
      await ChatService.send(content, (token) => {
        setMessages((current) => {
          const last = current[current.length - 1];
          if (last?.role === "assistant") {
            return [
              ...current.slice(0, -1),
              { role: "assistant", content: last.content + token },
            ];
          }
          return [...current, { role: "assistant", content: token }];
        });
      });
      return true;
    } catch (error) {
      setMessages((current) => {
        const last = current[current.length - 1];
        return last?.role === "assistant" ? current.slice(0, -1) : current;
      });
      setError(
        error instanceof Error
          ? error.message
          : "The assistant is unavailable right now.",
      );
      return false;
    } finally {
      setStreaming(false);
    }
  };

  const clearChat = useCallback(() => {
    setMessages([]);
    setHistoryLoaded(false);
    setError("");
  }, []);

  return (
    <ChatContext.Provider
      value={{
        open,
        setOpen,
        messages,
        loading,
        streaming,
        error,
        historyLoaded,
        fetchHistory,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
