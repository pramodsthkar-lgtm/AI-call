"use client";

import { useState, useEffect } from "react";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";

type ChatSession = {
  id: string;
  messages: { role: string; text: string }[];
  timestamp: number;
};

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [outboundTarget, setOutboundTarget] = useState("");
  const [outboundLoading, setOutboundLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      setSessions(data.sessions);
    } catch (e) {
      console.error("Failed to fetch sessions:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOutbound = async () => {
    if (!outboundTarget.trim()) return;
    setOutboundLoading(true);
    try {
      await fetch("/api/outbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: outboundTarget }),
      });
      setOutboundTarget("");
      fetchSessions(); // Refresh list to show the new outbound session
    } catch (e) {
      console.error("Outbound error:", e);
    } finally {
      setOutboundLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <Link href="/" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
                <ArrowLeft size={18} />
              </Link>
              <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
            </div>
            <p className="text-slate-500 ml-11">View live client messages and leads here.</p>
          </div>
          <button 
            onClick={fetchSessions} 
            className="flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors font-medium ml-11 sm:ml-0"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Outbound Outreach Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Start Outbound Campaign</h2>
          <p className="text-sm text-slate-500 mb-4">Enter a client's website URL or phone number. The AI will generate a tailored outreach script or simulate a contact attempt.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={outboundTarget}
              onChange={(e) => setOutboundTarget(e.target.value)}
              placeholder="e.g. 9876543210 or www.clientwebsite.com"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              disabled={outboundLoading}
            />
            <button
              onClick={handleOutbound}
              disabled={outboundLoading || !outboundTarget.trim()}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {outboundLoading ? "Simulating..." : "Initiate Contact"}
            </button>
          </div>
        </div>

        {sessions.length === 0 && !loading && (
          <div className="bg-white p-12 text-center rounded-2xl shadow-sm text-slate-500">
            No client chats yet. Once someone sends a message, it will appear here.
          </div>
        )}

        {/* Chats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sessions.map(session => (
            <div key={session.id} className="bg-white p-6 rounded-2xl shadow-sm flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4 shrink-0">
                <div>
                  <h2 className="font-semibold text-slate-700">Session ID: {session.id.toUpperCase()}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{session.messages.length} messages</p>
                </div>
                <span className="text-xs font-medium bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {session.messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[90%] text-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-900 rounded-tr-none' : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                      <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-50">
                        {msg.role === 'user' ? 'Client' : 'AI Agent'}
                      </div>
                      <div className="whitespace-pre-wrap prose prose-sm max-w-none">
                         {msg.role === 'user' ? (
                            msg.text
                         ) : (
                            <Markdown>{msg.text}</Markdown>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
