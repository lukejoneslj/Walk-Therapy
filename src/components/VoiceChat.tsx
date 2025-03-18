"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Phone, PhoneOff, Loader2 } from "lucide-react";

type VoiceChatProps = {
  onTextReceived: (text: string) => void;
};

export function VoiceChat({ onTextReceived }: VoiceChatProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Start a voice session to begin");
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Cleanup function for WebRTC connection
  const cleanupConnection = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setIsConnected(false);
    setIsListening(false);
    setStatusMessage("Session ended");
  };

  // Handle WebRTC connection
  const initializeVoiceChat = async () => {
    try {
      setIsConnecting(true);
      setStatusMessage("Connecting to AI therapist...");

      // Get ephemeral token from our API
      const tokenResponse = await fetch("/api/realtime-session");
      if (!tokenResponse.ok) {
        throw new Error("Failed to get session token");
      }
      const data = await tokenResponse.json();
      const ephemeralKey = data.client_secret.value;

      // Create peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Set up audio element
      const audioEl = new Audio();
      audioEl.autoplay = true;
      audioElementRef.current = audioEl;
      
      // Handle incoming audio from the model
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };

      // Get user microphone
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      mediaStreamRef.current = ms;
      
      // Add local audio track
      ms.getTracks().forEach(track => {
        pc.addTrack(track, ms);
      });

      // Set up data channel for events
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;
      
      dc.addEventListener("open", () => {
        setIsConnected(true);
        setIsConnecting(false);
        setStatusMessage("Connected! Ready to start your therapy session");
      });

      dc.addEventListener("close", () => {
        cleanupConnection();
      });

      dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log("Received event:", event);
          
          // Handle text from the model
          if (event.type === "text.stream" && event.text?.content) {
            onTextReceived(event.text.content);
          }
        } catch (error) {
          console.error("Error parsing event:", error);
        }
      });

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error("Failed to connect to OpenAI Realtime API");
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await pc.setRemoteDescription(answer);
      
    } catch (error) {
      console.error("Error initializing voice chat:", error);
      setStatusMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      cleanupConnection();
    } finally {
      setIsConnecting(false);
    }
  };

  // Start listening for user input
  const startListening = () => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
      setStatusMessage("Not connected. Try reconnecting.");
      return;
    }

    try {
      // Send event to start AI listening
      const startEvent = {
        type: "response.create",
        response: {
          modalities: ["text", "audio"],
          instructions: `You're a deeply insightful therapist who speaks naturally and conversationally, like a real person would. Your goal is to uncover the root causes beneath surface issues, not just address symptoms. For example, if someone mentions work stress, don't just suggest asking for help—explore how this connects to their self-worth, identity, or deeper patterns.

Guidelines:

1. Speak naturally with pauses, using contractions, and conversational phrasing—while maintaining professionalism. Sound like a real person talking, not an AI.

2. Look beyond the immediate issue to find underlying patterns. If someone says 'I'm stressed at work,' explore how this might connect to deeper themes in their life like perfectionism, fear of judgment, or childhood patterns.

3. Ask thoughtful, sometimes challenging questions that make people reflect: 'I'm curious... what does success actually look like to you?' or 'When you felt that way, what was the story you were telling yourself?'

4. Wait to gather sufficient context before offering specific, actionable advice. Understand their patterns first.

5. After understanding their situation, offer concrete practices they can try, explaining why you think it would help their specific situation.

6. Keep responses conversational but meaningful. Use natural language patterns—start sentences with 'Well,' 'You know,' 'I think,' or 'Actually' occasionally.

7. Balance validation with gentle challenging of limiting beliefs: 'That makes total sense why you'd feel that way AND I wonder if there's another perspective we could explore...'

8. Respond to their emotions first before problem-solving, and dig deeper than the obvious surface emotions.

The user is speaking to you while walking, so use a warm, natural tone with the pacing and rhythms of normal human speech, including natural pauses.`
        }
      };
      
      dataChannelRef.current.send(JSON.stringify(startEvent));
      setIsListening(true);
      setStatusMessage("I'm listening. Tell me what's on your mind...");
    } catch (error) {
      console.error("Error starting listening:", error);
      setStatusMessage("Error starting conversation");
    }
  };

  // Stop the conversation
  const stopVoiceChat = () => {
    cleanupConnection();
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      cleanupConnection();
    };
  }, []);

  return (
    <Card className="p-6 rounded-xl shadow-md bg-white/90 backdrop-blur-sm border border-slate-200">
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Voice Therapy Session</h2>
          <p className="text-slate-600">{statusMessage}</p>
        </div>
        
        {/* Status indicator */}
        <div className="w-full max-w-xs bg-slate-100 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              isListening 
                ? "bg-green-500 w-full" 
                : isConnected 
                  ? "bg-blue-500 w-2/3" 
                  : isConnecting 
                    ? "bg-yellow-500 w-1/3" 
                    : "bg-slate-300 w-0"
            }`}
          />
        </div>
        
        <div className="flex gap-4 justify-center">
          {!isConnected ? (
            <Button
              onClick={initializeVoiceChat}
              disabled={isConnecting}
              className="rounded-full py-6 px-8 bg-blue-600 hover:bg-blue-700 transition-all text-lg"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-5 w-5" />
                  Start Session
                </>
              )}
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={startListening}
                disabled={isListening}
                className={`rounded-full py-5 px-7 ${
                  isListening 
                    ? "bg-green-600" 
                    : "bg-green-600 hover:bg-green-700"
                } transition-all`}
                size="lg"
              >
                {isListening ? (
                  <><Mic className="mr-2 h-5 w-5" /> Listening...</>
                ) : (
                  <><Mic className="mr-2 h-5 w-5" /> Start Listening</>
                )}
              </Button>
              <Button
                onClick={stopVoiceChat}
                variant="destructive"
                className="rounded-full py-5 px-7"
                size="lg"
              >
                <PhoneOff className="mr-2 h-5 w-5" /> End Session
              </Button>
            </div>
          )}
        </div>
        
        {isListening && (
          <div className="mt-4 text-center text-sm text-slate-500">
            <p>Speaking to AI therapist...</p>
            <div className="flex justify-center mt-2 space-x-1">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 