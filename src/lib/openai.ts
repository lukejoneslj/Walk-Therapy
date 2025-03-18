import OpenAI from 'openai';

// Initialize the OpenAI client with API key
export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Allowing client-side usage
});

// Define message types
export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Function to send messages to the OpenAI API
export async function sendMessageToTherapist(messages: Message[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: true,
    });
    
    return response;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
} 