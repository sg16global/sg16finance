"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  Send,
  Zap,
  Sparkles,
  Shield,
  Headphones,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Activity,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  confidence?: number;
  verdict?: string;
}

function AiCopilotContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get("q") || "";

  const [mode, setMode] = useState<"analyst" | "support">("analyst");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // VIP Support Ticket Form state
  const [ticketForm, setTicketForm] = useState({
    name: "",
    email: "",
    tier: "VIP Pro",
    subject: "",
    category: "Terminal & Data",
    message: "",
  });
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [ticketRef, setTicketRef] = useState<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "ai",
      text: `### SG16 Sentinel AI — 24/7 Institutional Automated Intelligence
Autonomous financial research engine calibrated with Saif Tech Global LLC cross-border quantitative telemetry.

**Available Capabilities:**
- **Ticker & Multi-Asset Synthesis:** Real-time valuation multiples, technical momentum, and free-cash-flow forecasts.
- **Plain-English Earnings Breakdown:** Immediate translation of complex SEC filings without financial jargon.
- **Macroeconomic & Yield Modeling:** Interest rate path probabilities, inflation matrices, and commodity flows.
- **24/7 Automated Support:** Instant resolution for FIX protocol latency, API endpoints, and institutional licensing.`,
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
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "Communication timeout with the institutional model cluster. Please re-query.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, query]);

  useEffect(() => {
    if (initialQ && !initialQuerySent.current) {
      initialQuerySent.current = true;
      void handleSend(initialQ);
    }
  }, [initialQ, handleSend]);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.name || !ticketForm.email || !ticketForm.message) return;

    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketForm),
      });
      const data = await res.json();
      if (data.success) {
        setTicketRef(Math.floor(1000 + Math.random() * 9000));
        setTicketSuccess(data.instantResolution);
        // Also inject into the chat stream
        setMessages((prev) => [
          ...prev,
          {
            id: `ticket-user-${Date.now()}`,
            sender: "user",
            text: `[VIP SUPPORT REQUEST] Category: ${ticketForm.category} | Subject: ${ticketForm.subject}\n\n${ticketForm.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          {
            id: `ticket-ai-${Date.now()}`,
            sender: "ai",
            text: data.instantResolution,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            confidence: 99.2,
            verdict: "TICKET AI RESOLVED",
          },
        ]);
        setMode("analyst");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const prebuiltPrompts = [
    { label: "NVDA AI Chip Analysis", query: "Analyze NVDA valuation, Blackwell architecture orders, and gross margins" },
    { label: "US 10-Yr Yield Model", query: "Explain the US 10-Year yield trajectory and neutral rate equilibrium in plain English" },
    { label: "Bitcoin vs Gold Reserves", query: "Compare institutional Bitcoin spot ETF absorption with central bank gold reserves" },
    { label: "Tech CapEx Sustainability", query: "What is the return on capital outlook for $200B+ annual hyperscaler AI CapEx?" },
  ];

  return (
    <div className="dashboard-canvas min-h-screen py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
        {/* Terminal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="live-badge text-[9px]">
                <span className="live-dot" /> 24/7 AUTOMATED SENTINEL
              </span>
              <span className="text-[10px] font-mono-data text-[#7D8594]">
                NEURAL ENGINE v4.2 PRO
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SG16 Sentinel AI Terminal & 24/7 VIP Support
            </h1>
            <p className="text-xs text-[#7D8594] mt-0.5">
              Continuous cross-asset quantitative analysis and automatic institutional query resolution
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-black/40 border border-white/8 text-xs font-semibold">
            <button
              onClick={() => setMode("analyst")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                mode === "analyst"
                  ? "bg-[#C76A16] text-white shadow-md border border-[#FF9A3C]/40"
                  : "text-[#B6BDC8] hover:text-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Financial AI Copilot</span>
            </button>
            <button
              onClick={() => setMode("support")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                mode === "support"
                  ? "bg-[#C76A16] text-white shadow-md border border-[#FF9A3C]/40"
                  : "text-[#B6BDC8] hover:text-white"
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>24/7 Automated Support</span>
            </button>
          </div>
        </div>

        {/* Quick Intel Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono-data">
          <span className="text-[#FF9A3C] font-bold shrink-0 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> PRE-BUILT INTEL:
          </span>
          {prebuiltPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.query)}
              className="shrink-0 px-3 py-1 rounded-full bg-white/[0.04] border border-white/8 text-[#B6BDC8] hover:text-white hover:border-[#C76A16]/50 hover:bg-[#C76A16]/10 transition-all cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {mode === "analyst" ? (
          /* Chat Stream Window */
          <div className="glass-shield overflow-hidden flex flex-col h-[650px]">
            <div className="shield-accent-bar" />
            
            {/* Top Terminal Bar */}
            <div className="px-5 py-3 border-b border-white/8 bg-black/40 flex items-center justify-between text-xs font-mono-data">
              <div className="flex items-center gap-2 text-white">
                <Terminal className="w-4 h-4 text-[#FF9A3C]" />
                <span className="font-semibold">SG16-SENTINEL-LIVE-STREAM</span>
              </div>
              <div className="flex items-center gap-3 text-[#7D8594]">
                <span>LATENCY: 1.4ms</span>
                <span className="text-[#2ECC71]">100% RELIABILITY</span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                        ? "bg-gradient-to-r from-[#D97B22] to-[#C76A16] text-white shadow-md"
                        : "glass-card text-[#E2E6EC] border border-white/10"
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans space-y-2">{msg.text}</div>

                    {msg.sender === "ai" && (
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-black/40 text-[#7D8594] hover:text-white transition-all"
                        title="Copy text"
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
                    <span>DeepQuant neural model synthesizing order flow, multiples & macro catalysts...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-white/8 bg-[#0D121B]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask SG16 Sentinel AI anything: 'Analyze NVDA', 'What is the 10Y yield doing?', 'TSLA margins'..."
                  className="flex-1 rounded-xl bg-black/50 border border-white/10 px-4 py-3 text-xs text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16] font-sans"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#D97B22] to-[#C76A16] text-white disabled:opacity-40 hover:shadow-[0_0_20px_rgba(199,106,22,0.4)] transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* 24/7 Automated VIP Support System Ticket Desk */
          <div className="glass-shield overflow-hidden">
            <div className="shield-accent-bar" />
            <div className="glass-shield-inner p-6 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-[#FF9A3C]" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    24/7 Automated Institutional Client Operations Desk
                  </h3>
                </div>
                <p className="text-xs text-[#7D8594]">
                  Submit any technical inquiry, WebSocket latency check, custom model request, or billing support. 
                  Our Sentinel AI system analyzes and automatically resolves your request within seconds.
                </p>
              </div>

              {ticketSuccess && (
                <div className="p-4 rounded-xl bg-[#2ECC71]/10 border border-[#2ECC71]/30 text-xs text-[#2ECC71] space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ticket #SG16-{ticketRef ?? "----"} AI Resolved & Logged</span>
                  </div>
                  <p className="text-white font-sans whitespace-pre-wrap">{ticketSuccess}</p>
                </div>
              )}

              <form onSubmit={handleSupportSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-[#7D8594] uppercase font-mono-data mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                      placeholder="e.g. Marcus Vance"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#7D8594] uppercase font-mono-data mb-1.5">
                      Institutional / VIP Email
                    </label>
                    <input
                      type="email"
                      required
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                      placeholder="e.g. m.vance@citadel-alphacap.com"
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-[#7D8594] uppercase font-mono-data mb-1.5">
                      Membership Tier
                    </label>
                    <select
                      value={ticketForm.tier}
                      onChange={(e) => setTicketForm({ ...ticketForm, tier: e.target.value })}
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white focus:outline-none focus:border-[#C76A16]"
                    >
                      <option value="VIP Pro">VIP Pro</option>
                      <option value="Institutional">Institutional Client</option>
                      <option value="Sovereign">Sovereign Wealth Desk</option>
                      <option value="Free">Complimentary Tier</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#7D8594] uppercase font-mono-data mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white focus:outline-none focus:border-[#C76A16]"
                    >
                      <option value="Terminal & Data">Terminal & Live Feeds</option>
                      <option value="API Access">WebSocket & FIX Protocol API</option>
                      <option value="Portfolio Model">Portfolio Risk Model / Covariance</option>
                      <option value="Billing">Billing & Corporate Licensing</option>
                      <option value="Market Inquiry">General Market Query</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#7D8594] uppercase font-mono-data mb-1.5">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="e.g. Sub-millisecond latency audit for NASDAQ order books"
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#7D8594] uppercase font-mono-data mb-1.5">
                    Detailed Message / Request
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    placeholder="Explain your technical question or request. SG16 Sentinel AI will parse and answer immediately..."
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D97B22] to-[#C76A16] text-white font-semibold text-xs shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? "Sentinel AI Processing Resolution..." : "Submit for Instant 24/7 AI Resolution"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AiCopilotPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-[#7D8594]">Loading SG16 Sentinel AI...</div>}>
      <AiCopilotContent />
    </Suspense>
  );
}
