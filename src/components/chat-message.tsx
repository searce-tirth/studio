"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn(
      "flex items-start gap-4 animate-in fade-in duration-300",
      isUser ? "justify-end slide-in-from-right-4" : "justify-start slide-in-from-left-4"
    )}>
      {!isUser && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback className="bg-background">
            <Bot className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        "max-w-[75%] rounded-lg p-3 shadow-sm",
        isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
      )}>
        <Markdown content={content} />
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback className="bg-background">
            <User className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
