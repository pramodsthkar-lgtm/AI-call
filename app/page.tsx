"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Power } from "lucide-react";
import Markdown from "react-markdown";
import Link from "next/link";

type Message = {
  role: "user" | "model";
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(Math.random().toString(36).substring(2, 9));
    setMessages([
      {
        role: "model",
        text: "नमस्ते! **Pramod Singh Website Management Services** में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूँ?",
      },
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newMessages = [...messages, { role: "user" as const, text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history,
          message: userMessage,
          isOffline,
          sessionId
        })
      });

      const data = await res.json();

      if (data.error) {
        setMessages([...newMessages, { role: "model", text: "माफ़ करें, कुछ तकनीकी समस्या आ गई है। कृपया फिर से प्रयास करें।" }]);
      } else {
        setMessages([...newMessages, { role: "model", text: data.text }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: "model", text: "माफ़ करें, नेटवर्क समस्या है। कृपया फिर से प्रयास करें।" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-full max-h-[900px]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex flex-col items-center justify-center relative shrink-0 shadow-sm z-10">
           <button 
             onClick={() => setIsOffline(!isOffline)}
             className={`absolute right-4 top-4 p-2 rounded-full transition-colors ${isOffline ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
             title={isOffline ? "Currently Offline" : "Currently Online"}
           >
             <Power size={18} />
           </button>
           <Link href="/admin" className="absolute left-4 top-4 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-full">
             Admin
           </Link>
           <h1 className="text-xl font-medium tracking-tight">Pramod Singh Website Management</h1>
           <p className="text-sm text-slate-400 mt-1 font-mono tracking-wide">AI SALES AGENT {isOffline && <span className="text-red-400">(OFFLINE)</span>}</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-indigo-600 ml-3' : 'bg-slate-900 mr-3'}`}>
                  {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                </div>
                <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none prose prose-slate prose-sm max-w-none'}`}>
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <div className="markdown-body">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start max-w-[85%] flex-row">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-slate-900 mr-3">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="p-4 rounded-2xl bg-white text-slate-800 border border-slate-200 rounded-tl-none flex items-center space-x-3 shadow-sm h-[52px]">
                  <Loader2 size={16} className="animate-spin text-indigo-500" />
                  <span className="text-slate-500 text-sm font-medium">Typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <form onSubmit={sendMessage} className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-[15px] shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            >
              <Send size={18} className={isLoading ? "opacity-50" : "opacity-100"} />
            </button>
          </form>
          <div className="text-center mt-3 text-xs text-slate-400 font-medium">
            AI can make mistakes. Please verify important information.
          </div>
        </div>
      </div>
    </div>
  );
}
