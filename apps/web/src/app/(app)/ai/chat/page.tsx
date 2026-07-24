"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Sparkles, Bot, MessageSquare, Plus, Zap } from "lucide-react";

interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  model?: string;
  tokens?: number;
}

interface AIChatSession {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
  model: string;
}

export default function AIChatPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<AIChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("gpt-4");
  const [temperature, setTemperature] = useState(0.7);

  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <AppShell><div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppShell>;
  if (!isSignedIn) return null;

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: AIMessage = { role: "user", content: input.trim(), timestamp: new Date().toISOString() };
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...(currentSession?.messages || []), userMsg], model, temperature }),
      });
      const data = await response.json();
      const assistantMsg: AIMessage = { role: "assistant", content: data.content, timestamp: new Date().toISOString(), model: data.model, tokens: data.tokens };
      const newSession: AIChatSession = {
        id: currentSessionId || `chat-${Date.now()}`,
        title: currentSession?.title || input.slice(0, 50),
        messages: [...(currentSession?.messages || []), userMsg, assistantMsg],
        createdAt: currentSession?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        model,
      };
      setSessions(prev => prev.some(s => s.id === newSession.id) ? prev.map(s => s.id === newSession.id ? newSession : s) : [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setInput("");
    } catch {
      alert("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const newChat = () => { setCurrentSessionId(null); setInput(""); };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg"><Sparkles className="h-6 w-6 text-primary" /></div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
              <p className="text-muted-foreground">Chat with AI, analyze data, and automate tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Model" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={newChat} variant="outline"><Plus className="mr-2 h-4 w-4" />New Chat</Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr_320px]">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {(() => {
                if (sessions.length === 0) {
                  return (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No chats yet</p>
                      <p className="text-xs">Start a new conversation</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-1 p-2">
                    {sessions.slice().reverse().map((session) => (
                      <div
                        key={session.id}
                        className={`block p-2 rounded-lg transition-colors cursor-pointer ${currentSessionId === session.id ? "bg-primary/10" : "hover:bg-muted/50"}`}
                        onClick={() => setCurrentSessionId(session.id)}
                      >
                        <p className="font-medium truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.messages[0]?.content?.slice(0, 60)}...</p>
                        <p className="text-xs text-muted-foreground">{new Date(session.updatedAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 flex flex-col h-[calc(100vh-200px)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" />{currentSession?.title || "New Conversation"}</CardTitle>
                  <CardDescription>Powered by {model}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Model" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Temp: {temperature}</label>
                    <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="w-24" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4" id="messages">
                {(() => {
                  if (!currentSession || currentSession.messages.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Bot className="h-16 w-16 mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">Welcome to AI Assistant</h3>
                        <p className="text-sm">Ask questions, analyze data, or automate tasks</p>
                      </div>
                    );
                  }
                  return (
                    <>
                      {currentSession.messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`flex-1 max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}>
                            <div className={`inline-block px-4 py-2 rounded-2xl ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                              {msg.model && <span> - {msg.model}</span>}
                              {msg.tokens && <span> - {msg.tokens} tokens</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                          <div className="flex-1 space-y-2 max-w-[80%]">
                            <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                            <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                    placeholder="Type your message..."
                    className="flex-1 min-h-[50px] max-h-48 resize-none border rounded-md p-2"
                    disabled={isLoading}
                  />
                  <Button onClick={sendMessage} disabled={!input.trim() || isLoading} className="h-fit self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">Quick Actions</p>
                <div className="mt-2 grid gap-2">
                  <Button variant="outline" className="justify-start gap-2" onClick={() => setInput("Analyze current inventory and suggest optimizations")}>
                    <MessageSquare className="h-4 w-4" /> Analyze Inventory
                  </Button>
                  <Button variant="outline" className="justify-start gap-2" onClick={() => setInput("Create production schedule for next week")}>
                    <MessageSquare className="h-4 w-4" /> Create Schedule
                  </Button>
                  <Button variant="outline" className="justify-start gap-2" onClick={() => setInput("Summarize quality issues from last month")}>
                    <MessageSquare className="h-4 w-4" /> Quality Report
                  </Button>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">Model Settings</p>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="text-sm">Temperature</span>
                    <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="w-32" />
                    <span className="text-sm font-mono w-8">{temperature.toFixed(1)}</span>
                  </label>
                  <p className="text-sm text-muted-foreground">Lower = more focused, Higher = more creative</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}