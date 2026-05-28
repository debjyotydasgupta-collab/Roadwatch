import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockApi } from "@/lib/mock-api";
import { Send, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  image?: string;
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", content: "Hello! I'm the RoadWatch assistant. You can tell me about a road issue, or ask me to check spending on a road." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    const newMsg: Message = { id: Date.now().toString(), role: "user", content: userMsg };
    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const response = await mockApi.chatResponse(userMsg);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: response }]);
    } catch (e) {
      toast.error("Failed to get response");
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageUpload = async () => {
    // Mock image upload
    const mockImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const newMsg: Message = { id: Date.now().toString(), role: "user", content: "Uploaded a photo", image: mockImage };
    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const analysis = await mockApi.analyzeImage("mock-url");
      const content = `I analyzed the image. It looks like a **${analysis.issueType}** with **${analysis.severity}** severity. I have filed the report automatically. Thank you!`;
      
      // Auto create complaint
      await mockApi.createComplaint({
        title: `Reported ${analysis.issueType}`,
        description: analysis.description,
        type: analysis.issueType,
        severity: analysis.severity as any,
        location_lat: 12.9716, // mock location
        location_lon: 77.5946,
        image_url: "mock-image-url",
        user_id: "u1" // mock user
      });

      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content }]);
      toast.success("Complaint filed successfully via AI!");
    } catch (e) {
      toast.error("Failed to analyze image");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="bg-primary p-4 text-primary-foreground">
        <h3 className="font-semibold flex items-center gap-2">
          RoadWatch AI
        </h3>
        <p className="text-xs text-primary-foreground/80">Powered by Civic AI</p>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                m.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-br-none" 
                  : "bg-muted text-foreground rounded-bl-none"
              }`}>
                {m.image && <img src={m.image} alt="uploaded" className="mb-2 max-w-full rounded-lg h-32 object-cover bg-black/10" />}
                <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-2 text-sm flex gap-1 items-center h-9">
                <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 bg-background border-t">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleImageUpload} title="Upload photo" className="shrink-0">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Describe the issue..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping} className="shrink-0">
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
