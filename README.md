# Walk Therapy

An AI-powered therapist companion for your walks. This application provides both voice and text-based conversation with an AI therapist designed to offer insightful guidance and support during your walks.

## Features

- **Voice Chat:** Talk naturally with your AI therapist using OpenAI's Realtime API
- **Text Chat:** Type conversations with streaming responses
- **Deep Therapeutic Approach:** The AI is designed to dig into root causes, not just surface issues
- **Mobile-Optimized:** Perfect for using while walking
- **Natural Conversations:** The AI uses natural, conversational language patterns

## Technologies Used

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** for UI components
- **OpenAI GPT-4o Mini** for text chat
- **OpenAI GPT-4o Realtime** for voice chat
- **WebRTC** for real-time audio communication

## Getting Started

### Prerequisites

- Node.js 18.x or later
- An OpenAI API key with access to GPT-4o Mini and GPT-4o Realtime

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lukejoneslj/Walk-Therapy.git
cd Walk-Therapy
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the project root and add your OpenAI API key:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

## Usage

1. Choose between "Voice Chat" or "Text Chat" using the tabs at the top
2. For voice chat:
   - Click "Start Session" to initialize the connection
   - Once connected, click "Start Listening" and begin speaking
   - The AI will respond via audio and transcript will be displayed
3. For text chat:
   - Type your message in the input field and press Enter or click Send
   - The AI will respond with a streaming text response

## License

[MIT License](LICENSE)

## Acknowledgments

- Built with OpenAI's GPT models
- UI components from shadcn/ui
- Icons from Lucide React
