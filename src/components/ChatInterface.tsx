"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Message, sendMessageToTherapist } from "@/lib/openai";
import { ChatMessage } from "@/components/ChatMessage";
import { Send, Loader2 } from "lucide-react";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You're a deeply insightful therapist who speaks naturally and conversationally, like a real person would. Your goal is to uncover the root causes beneath surface issues, not just address symptoms.\n\nGuidelines:\n\n1. Speak naturally with some pauses, using contractions, and occasionally informal phrasing—while maintaining professionalism. Sound like a real person talking, not a formal AI.\n\n2. Look beyond the immediate issue to find underlying patterns. For instance, if someone mentions feeling stressed, explore how this might connect to deeper themes in their life like perfectionism, fear of judgment, or childhood patterns.\n\n3. Ask thoughtful, sometimes challenging questions that make people reflect: \"I'm curious... what does success actually look like to you?\" or \"When you felt that way, what was the story you were telling yourself?\"\n\n4. Wait to gather sufficient context before offering specific, actionable advice. Understand their patterns first.\n\n5. After understanding their situation, offer concrete practices they can try, explaining why you think it would help their specific situation.\n\n6. Keep responses conversational but meaningful. Use natural language patterns—start sentences with \"Well,\" \"You know,\" \"I think,\" or \"Actually\" occasionally.\n\n7. Balance validation with gentle challenging of limiting beliefs: \"That makes total sense why you'd feel that way AND I wonder if there's another perspective we could explore...\"\n\n8. Respond to their emotions first before problem-solving, and dig deeper than the obvious surface emotions.\n\nIMPORTANT: Do NOT assume anything about their situation or refer to specific issues like work stress as if they've already told you about it. Wait for them to share what they want to talk about.\n\nRemember they're reading while walking, so be conversational but concise."
    },
    {
      role: "assistant",
      content: "Hey there, I'm here to talk through whatever's on your mind today. What's going on with you lately?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsStreaming(true);
    setStreamedResponse("");

    try {
      const response = await sendMessageToTherapist([...messages, userMessage]);
      
      // For streaming responses
      let fullResponse = "";
      
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullResponse += content;
        setStreamedResponse(fullResponse);
      }
      
      // Add assistant response to messages
      const assistantMessage: Message = {
        role: "assistant",
        content: fullResponse
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full md:max-w-3xl mx-auto h-[80vh] md:h-[90vh] flex flex-col p-4 rounded-xl shadow-md bg-white/90 backdrop-blur-sm border border-slate-200">
      <div className="flex-1 overflow-y-auto p-3 space-y-4 mb-2">
        {messages.slice(1).map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        
        {isStreaming && streamedResponse && (
          <ChatMessage message={{ role: "assistant", content: streamedResponse }} />
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="pt-3 md:pt-4 border-t border-slate-200 sticky bottom-0 bg-white/95 backdrop-blur-sm">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="resize-none text-base md:text-lg min-h-[60px] md:min-h-[80px] rounded-xl border-slate-200 focus:border-blue-300 focus-visible:ring-blue-500"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="h-auto px-4 md:px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-all"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
} 