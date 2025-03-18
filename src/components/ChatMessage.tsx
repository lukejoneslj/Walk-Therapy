"use client";

import { Message } from "@/lib/openai";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  
  return (
    <div className={cn(
      "flex w-full mb-4", 
      isUser ? "justify-end" : "justify-start",
      "animate-in fade-in-0 slide-in-from-bottom-3 duration-300"
    )}>
      <div className={cn(
        "flex items-start gap-3 max-w-[85%] md:max-w-[80%]", 
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <Avatar className={cn(
          "h-9 w-9 md:h-10 md:w-10 rounded-full flex-shrink-0", 
          isUser ? "bg-blue-600" : "bg-emerald-600"
        )}>
          <div className="text-white flex items-center justify-center h-full">
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>
        </Avatar>
        
        <Card className={cn(
          "p-3 md:p-4 shadow-sm text-base md:text-base",
          isUser 
            ? "bg-blue-50 text-slate-800 rounded-2xl rounded-tr-none border-blue-100" 
            : "bg-emerald-50 text-slate-800 rounded-2xl rounded-tl-none border-emerald-100"
        )}>
          <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </Card>
      </div>
    </div>
  );
} 