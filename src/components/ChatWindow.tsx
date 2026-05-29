import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockApi } from "@/lib/mock-api";
import { submitReport } from "@/lib/report-service";
import { chatWithAI, analyzeImage } from "@/lib/ai.functions";
import { useAuth } from "@/hooks/use-auth";
import { Send, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  image?: string;
}

const QUICK_PROMPTS = [
  "There's a pothole on my street",
  "How do I check road spending?",
  "What traffic fines apply to two-wheelers?",
];

export function ChatWindow() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content:
        "Hello! I'm RoadWatch AI. Describe a road issue, upload a photo, or ask about spending and traffic fines.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (userMsg: string) => {
    const newMsg: Message = { id: Date.now().toString(), role: "user", content: userMsg };
    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const messageHistory = [...messages, newMsg].map((m) => ({
        role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
        content: m.content,
      }));

      let reply: string;
      try {
        const response = await chatWithAI({ data: { messages: messageHistory } });
        reply = response.reply;
      } catch {
        reply = await mockApi.chatResponse(userMsg);
      }
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "ai", content: reply }]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to get response";
      toast.error(message);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    await sendMessage(userMsg);
  };

  const processImage = async (imageUrl: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: "Uploaded a photo",
      image: imageUrl,
    };
    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    try {
      let analysis: { issueType: string; severity: string; description: string };
      try {
        analysis = await analyzeImage({ data: { imageUrl } });
      } catch {
        analysis = await mockApi.analyzeImage(imageUrl);
      }
      const severity = (["low", "medium", "high"].includes(analysis.severity)
        ? analysis.severity
        : "medium") as "low" | "medium" | "high";

      await submitReport({
        title: `Reported ${analysis.issueType}`,
        description: analysis.description,
        type: analysis.issueType,
        severity,
        location_lat: 23.3321 + (Math.random() * 0.01 - 0.005),
        location_lon: 86.3652 + (Math.random() * 0.01 - 0.005),
        image_url: imageUrl,
        user_id: user?.id ?? "guest",
      });

      const content = `I analyzed your photo: **${analysis.issueType}** (${analysis.severity} severity). The report is filed — [view on map](/map).`;
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "ai", content }]);
      toast.success("Complaint filed via AI!");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to analyze image";
      toast.error(message);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileChange = (file: File | undefined) => {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => processImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="bg-primary p-4 text-primary-foreground flex justify-between items-start">
        <div>
          <h3 className="font-semibold">RoadWatch AI</h3>
          <p className="text-xs text-primary-foreground/80">Report · spending · traffic laws</p>
        </div>
        <Link to="/report">
          <Button size="sm" variant="secondary" className="h-8 text-xs">
            Full report form
          </Button>
        </Link>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none"
                }`}
              >
                {m.image && (
                  <img
                    src={m.image}
                    alt="uploaded"
                    className="mb-2 max-w-full rounded-lg h-32 object-cover"
                  />
                )}
                <div
                  dangerouslySetInnerHTML={{
                    __html: m.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                  }}
                />
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

      <div className="px-3 pt-2 flex flex-wrap gap-2 border-t bg-muted/30">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => sendMessage(p)}
            disabled={isTyping}
            className="text-xs px-2.5 py-1 rounded-full border bg-background hover:bg-muted transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="p-3 bg-background border-t">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileRef.current?.click()}
            title="Upload photo"
            className="shrink-0"
            disabled={isTyping}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
