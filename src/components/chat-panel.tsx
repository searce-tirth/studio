"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bot, Send, Loader2 } from "lucide-react";
import { ragChat, RagChatInput } from "@/ai/flows/rag-chat";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "./chat-message";
import TypingIndicator from "./typing-indicator";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ThemeCustomizer } from "./theme-customizer";
import InteractiveBackground from "./interactive-background";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("gemini-2.5-flash-lite-preview-06-17");
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [voice, setVoice] = useState("Algenib");
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    toast({
      title: "Model Changed",
      description: `Switched to ${newModel}.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const chatInput: RagChatInput = {
        message: currentInput,
        history: messages.map(m => ({ role: m.role, content: m.content })),
        model: model,
        isTtsEnabled: isTtsEnabled,
        voice: voice,
      };
      
      const result = await ragChat(chatInput);

      const assistantMessage: Message = {
        role: "assistant",
        content: result.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (result.audioDataUri) {
        if (audioRef.current) {
          audioRef.current.src = result.audioDataUri;
          audioRef.current.play().catch(err => {
            console.error("Audio playback failed:", err);
            toast({
              variant: "destructive",
              title: "Playback Error",
              description: "Could not play audio. Check browser permissions.",
            });
          });
        }
      }

    } catch (error) {
      console.error("Error calling ragChat:", error);
      const assistantMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response from the AI.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative flex flex-col w-full h-full shadow-2xl rounded-xl border-2 overflow-hidden">
      <InteractiveBackground className="absolute inset-0 z-0 opacity-100" />
      <div className="relative z-10 flex flex-col h-full w-full bg-card/50 backdrop-blur-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-transparent">
          <div className="flex items-center gap-2">
              <Bot className="w-8 h-8 text-primary" />
              <CardTitle className="font-headline text-2xl">ContextualChat</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <Select value={model} onValueChange={handleModelChange} disabled={isLoading}>
              <SelectTrigger className="w-[250px] font-sans">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Preview</SelectLabel>
                  <SelectItem value="gemini-2.5-flash-lite-preview-06-17">Gemini 2.5 Flash Lite Preview</SelectItem>
                  <SelectItem value="gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Latest</SelectLabel>
                  <SelectItem value="gemini-1.5-pro-latest">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-1.5-flash-latest">Gemini 1.5 Flash</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Stable</SelectLabel>
                  <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro</SelectItem>
                  <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                </SelectGroup>
                 <SelectGroup>
                  <SelectLabel>Other</SelectLabel>
                  <SelectItem value="aqa">AQA</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Switch
                id="tts-switch"
                checked={isTtsEnabled}
                onCheckedChange={setIsTtsEnabled}
                disabled={isLoading}
              />
              <Label htmlFor="tts-switch" className="text-sm font-medium text-foreground">
                TTS
              </Label>
            </div>
            {isTtsEnabled && (
              <Select value={voice} onValueChange={setVoice} disabled={isLoading}>
                <SelectTrigger className="w-[160px] font-sans">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Algenib">Algenib (Female)</SelectItem>
                  <SelectItem value="Achernar">Achernar (Male)</SelectItem>
                  <SelectItem value="Gacrux">Gacrux (Female)</SelectItem>
                  <SelectItem value="Rasalgethi">Rasalgethi (Male)</SelectItem>
                  <SelectItem value="Schedar">Schedar (Female)</SelectItem>
                  <SelectItem value="Umbriel">Umbriel (Female)</SelectItem>
                  <SelectItem value="Zubenelgenubi">Zubenelgenubi (Male)</SelectItem>
                  <SelectItem value="Puck">Puck (Male)</SelectItem>
                </SelectContent>
              </Select>
            )}
            <ThemeCustomizer />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
              {messages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-20">
                      <Bot size={48} className="mb-4" />
                      <h2 className="text-2xl font-semibold">Welcome to ContextualChat</h2>
                      <p className="mt-2">Start a conversation by typing a message below.</p>
                  </div>
              )}
              {messages.map((message, index) => (
                  <ChatMessage key={index} role={message.role} content={message.content} />
              ))}
              {isLoading && (
                <div className="flex items-start gap-4">
                  <Avatar className="h-8 w-8 border">
                      <AvatarFallback className="bg-background"><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                  </Avatar>
                  <div className="max-w-[75%] rounded-lg p-3 bg-card shadow-sm flex items-center h-10">
                      <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
              </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-6 bg-transparent">
          <form onSubmit={handleSubmit} className="flex w-full items-start space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 resize-none bg-card focus-within:ring-accent"
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                  }
              }}
              rows={1}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-10 w-10 bg-accent hover:bg-accent/90">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </div>
      <audio ref={audioRef} className="hidden" />
    </Card>
  );
}
