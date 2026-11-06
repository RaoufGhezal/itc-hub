"use client";

import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/ChatContext";

export default function AskAiButton() {
  const { setOpen } = useChat();

  return (
    <Button
      variant="outline"
      onClick={() => setOpen(true)}
      className="cursor-pointer"
    >
      Ask AI assistant
    </Button>
  );
}
