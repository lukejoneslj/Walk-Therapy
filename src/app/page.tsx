"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { VoiceChat } from "@/components/VoiceChat";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");

  // This function will be called when voice text is received
  const handleVoiceText = (text: string) => {
    setVoiceTranscript(prev => prev + text);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-50 to-slate-100 p-4 md:p-12">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 text-slate-800 tracking-tight">
            AI Therapist
          </h1>
          <p className="text-slate-600 text-lg">
            Your personal companion for walks and reflections
          </p>
        </div>
        
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8 rounded-xl bg-slate-200/70 p-1">
            <TabsTrigger 
              value="voice" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Voice Chat
            </TabsTrigger>
            <TabsTrigger 
              value="text" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Text Chat
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="w-full">
            <ChatInterface />
          </TabsContent>
          
          <TabsContent value="voice" className="w-full space-y-6">
            <VoiceChat onTextReceived={handleVoiceText} />
            
            {voiceTranscript && (
              <Card className="p-5 mt-4 shadow-md rounded-xl bg-white/90 backdrop-blur-sm">
                <h3 className="text-lg font-medium mb-3 text-slate-700">Conversation</h3>
                <div className="max-h-[60vh] overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="whitespace-pre-wrap text-slate-700">{voiceTranscript}</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} AI Therapist • Your Mental Wellness Companion</p>
      </footer>
    </main>
  );
}
