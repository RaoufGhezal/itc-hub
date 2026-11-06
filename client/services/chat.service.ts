import { api } from "@/lib/api";
import type { ChatMessage } from "@/types";

export const ChatService = {
  history: async (): Promise<ChatMessage[]> => {
    const response = await api.get<ChatMessage[]>("/chat/history");
    const data = response.data;
    return Array.isArray(data)
      ? data
      : (data as { messages: ChatMessage[] }).messages;
  },

  send: async (
    message: string,
    onToken: (token: string) => void,
  ): Promise<void> => {
    const response = await fetch(`${api.defaults.baseURL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        message?: string | string[];
      } | null;
      const message = Array.isArray(data?.message)
        ? data.message.join(", ")
        : data?.message;
      throw new Error(message || `Chat request failed (${response.status})`);
    }
    if (!response.body) throw new Error("Chat response stream is unavailable");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let eventName = "message";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
          continue;
        }
        if (!line.startsWith("data:")) {
          if (!line) eventName = "message";
          continue;
        }
        const data = line.slice(5).trim();
        if (data === "[DONE]") return;
        let parsed: { token?: string; content?: string; error?: string };
        try {
          parsed = JSON.parse(data);
        } catch {
          onToken(data);
          continue;
        }
        if (eventName === "error" || parsed.error)
          throw new Error(parsed.error ?? "Chat stream failed");
        const token = parsed.token ?? parsed.content;
        if (token) onToken(token);
      }
    }
  },
};
