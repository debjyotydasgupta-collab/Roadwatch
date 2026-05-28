import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ChatWindow } from "@/components/ChatWindow";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full flex flex-col justify-center">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground mt-2">Report issues naturally via text or photo.</p>
        </div>
        <ChatWindow />
      </div>
    </div>
  );
}
