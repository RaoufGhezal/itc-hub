"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, MessageCircle, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import AuthDialog, { type AuthMode } from "@/components/AuthDialog";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const SUGGESTIONS = [
  "What's the next event?",
  "What departments exist in the club?",
  "How can I join the ITC?",
];

export default function ChatWidget() {
  const {
    open,
    setOpen,
    messages,
    loading: historyLoading,
    streaming,
    error,
    historyLoaded,
    fetchHistory,
    sendMessage,
    clearChat,
  } = useChat();
  const { user, loading: authLoading } = useAuth();

  const [input, setInput] = useState("");
  const [failed, setFailed] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading || user) return;
    clearChat();
  }, [user, authLoading, clearChat]);

  useEffect(() => {
    if (!open || !user || historyLoaded || messages.length > 0) return;
    fetchHistory();
  }, [open, user, historyLoaded, messages.length, fetchHistory]);

  useEffect(() => {
    if (open && user) inputRef.current?.focus();
  }, [open, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming, open, historyLoading, error]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;
    setFailed("");
    setInput("");
    const ok = await sendMessage(content);
    if (!ok) setFailed(content);
  };

  const onComposerKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const showTyping =
    streaming &&
    (messages.length === 0 || messages[messages.length - 1].role === "user");

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed right-4 bottom-6 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 sm:right-6"
      >
        {open ? (
          <X className="size-4" />
        ) : (
          <MessageCircle className="size-[18px]" />
        )}
      </button>

      {open && (
        <Card className="fixed right-4 bottom-20 z-50 flex h-[min(520px,75dvh)] w-[min(360px,calc(100vw-2rem))] flex-col gap-0 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-0 text-white shadow-xl sm:right-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-neutral-800 px-4 py-3">
            <span className="font-heading text-sm font-semibold text-white">
              ITC Assistant
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close chat"
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
              className="h-8 w-8 cursor-pointer rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </Button>
          </CardHeader>

          <CardContent
            ref={scrollRef}
            aria-live="polite"
            className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
          >
            {!authLoading && !user ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <p className="text-sm text-neutral-400">
                  Log in to chat with the ITC Assistant.
                </p>
                <Button
                  className="cursor-pointer"
                  onClick={() => setAuthOpen(true)}
                >
                  Log in
                </Button>
              </div>
            ) : historyLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                  >
                    <Skeleton className="h-9 w-2/3 bg-neutral-900" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="space-y-4">
                <MessageBubble
                  role="assistant"
                  content="Hi! I'm the ITC Assistant. Ask me anything about the club — events, departments, and how to join."
                />
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => send(suggestion)}
                      className="cursor-pointer"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    role={message.role}
                    content={message.content}
                  />
                ))}
                {showTyping && <TypingIndicator />}
                {error && (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
                    <p className="text-xs text-red-400">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => send(failed)}
                      className="h-7 cursor-pointer text-xs"
                    >
                      Try again
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>

          {user && (
            <CardFooter className="gap-2 rounded-b-2xl border-t border-neutral-800 bg-neutral-950 p-3">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onComposerKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className="h-10 min-h-10 max-h-28 min-w-0 flex-1 resize-none rounded-lg px-3 py-2 text-sm leading-5"
              />
              <Button
                size="icon"
                onClick={() => send(input)}
                disabled={!input.trim() || streaming}
                aria-label="Send message"
                className="h-9 w-9 shrink-0 cursor-pointer rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                <ArrowUp className="size-4" />
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
}
