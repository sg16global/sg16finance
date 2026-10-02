"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  TrendingUp,
  Shield,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  RefreshCw,
  Zap,
} from "lucide-react";

interface AiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  confidence?: number;
  verdict?: string;
}

export default function AiCopilotModal({ isOpen, onClose, initialQuery }: AiCopilotModalProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: `### SG16 Sentinel AI — 24/7 Institutional Financial Copilot
Welcome to the SG16 automated financial intelligence engine. I am powered by Saif Tech Global's real-time cross-asset neural telemetry.

**You can ask me to:**
- Analyze any global ticker, index, or commodity (e.g., NVDA, SPX, GOLD, BTC, TSLA)
- Provide plain-English breakdowns of SEC 10-Q/8-K earnings reports
- Explain macroeconomic yield curve inversions and central bank policy rates
- Stress-test sector sensitivity and portfolio risk parity models`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      confidence: 99.4,
      verdict: "SYSTEM READY",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialQuerySent = useRef(false);

  const handleSend = useCallback(async (customText?: string) => {
    const textToSend = customText || query;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSend }),
      });
      const data = await res.json();

      if (data.success) {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          confidence: data.confidence,
          verdict: data.verdict,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || "Failed to generate AI intelligence");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "SG16 Sentinel AI encountered a connection delay to the live pricing cluster. Please retry in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, query]);

  useEffect(() => {
    if (initialQuery && isOpen && !initialQuerySent.current) {
      initialQuerySent.current = true;
      void handleSend(initialQuery);
    }
    if (!isOpen) {
      initialQuerySent.current = false;
    }
  }, [initialQuery, isOpen, handleSend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    "Analyze NVDA Blackwell demand & margins",
    "Explain US 10-Year yield outlook in plain English",
    "Compare Bitcoin ETF inflows vs Spot Gold reserves",
    "Review Tech sector AI CapEx sustainability",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-3xl h-[88vh] max-h-[780px] rounded-2xl border border-white/12 bg-[#0A0E15] shadow-[0_16px_60px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Amber top glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF9A3C] to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 bg-[#0D121B]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF9A3C] to-[#C76A16] text-[#07090C] shadow-[0_0_15px_rgba(199,106,22,0.5)]">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  SG16 Sentinel AI Terminal
                </h3>
                <span className="live-badge text-[9px]">
                  <span className="live-dot" /> 24/7 ONLINE
                </span>
              </div>
              <p className="text-[10px] font-mono-data text-[#7D8594]">
                Neural Multi-Asset Financial Intelligence · Saif Tech Global LLC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setMessages([
                  {
                    id: "reset",
                    sender: "ai",
                    text: "Terminal session refreshed. Ask any asset, sector, macro question or support query.",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  },
                ])
              }
              title="Reset conversation"
              className="p-1.5 text-[#7D8594] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#7D8594] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-black/25 overflow-x-auto text-[11px] font-mono-data">
          <span className="text-[#FF9A3C] flex items-center gap-1 font-bold shrink-0">
            <Zap className="w-3 h-3" /> INTEL CHIPS:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/8 text-[#B6BDC8] hover:border-[#C76A16]/50 hover:text-white hover:bg-[#C76A16]/10 transition-all cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Stream Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1 text-[10px] font-mono-data text-[#7D8594]">
                <span>{msg.sender === "user" ? "INSTITUTIONAL USER" : "SG16 SENTINEL AI"}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.verdict && (
                  <>
                    <span>•</span>
                    <span className="text-[#FF9A3C] font-bold">{msg.verdict}</span>
                  </>
                )}
                {msg.confidence && (
                  <span className="text-[#2ECC71]">CONFIDENCE: {msg.confidence}%</span>
                )}
              </div>

              <div
                className={`group relative max-w-[90%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-[#D97B22] to-[#C76A16] text-white shadow-[0_2px_12px_rgba(199,106,22,0.3)]"
                    : "glass-card text-[#E2E6EC] border border-white/10"
                }`}
              >
                {/* Content formatting */}
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.text}
                </div>

                {msg.sender === "ai" && (
                  <button
                    onClick={() => copyToClipboard(msg.id, msg.text)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-black/40 text-[#7D8594] hover:text-white transition-all"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-[#2ECC71]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C76A16]/20 text-[#FF9A3C]">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="glass-card rounded-xl px-4 py-3 text-xs text-[#B6BDC8] border border-white/10 flex items-center gap-2">
                <span className="live-dot" />
                <span>SG16 DeepQuant Neural Engine parsing order books & macroeconomic catalysts...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-white/8 bg-[#0D121B]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask SG16 Sentinel AI anything: 'Analyze NVDA', 'Explain 10Y Yield', 'TSLA Q3 margins'..."
                className="w-full rounded-xl bg-black/50 border border-white/10 px-4 py-3 text-xs text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16] focus:ring-1 focus:ring-[#C76A16] transition-all font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#D97B22] to-[#C76A16] text-white disabled:opacity-40 hover:shadow-[0_0_20px_rgba(199,106,22,0.4)] transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono-data text-[#7D8594] px-1">
            <span>PRESS ENTER TO QUERY · 24/7 AUTOMATIC RESOLUTION</span>
            <span className="text-[#C76A16]">SG16 DEEPQUANT ENGINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
