import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ChatWindow } from "@/components/ChatWindow";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full flex flex-col justify-center">
        <div className="mb-6 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
            <p className="text-muted-foreground mt-2">Report issues naturally via text or photo.</p>
          </div>
          <a 
            href="https://t.me/roadwatch_ai_bot" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button className="bg-[#229ED9] hover:bg-[#1c88ba] text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 fill-white" />
              Open Telegram Bot
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>
        <ChatWindow />
      </div>
    </div>
  );
}
