"use client";

import { useState } from "react";
import {
  Headphones,
  Mail,
  MapPin,
  Clock,
  Shield,
  Bot,
  CheckCircle2,
  Send,
  Building2,
  Radio,
} from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    tier: "VIP Pro",
    subject: "",
    category: "Terminal & Data",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [instantResolution, setInstantResolution] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { success?: boolean; instantResolution?: string };
      if (data.success) {
        setInstantResolution(data.instantResolution ?? null);
        setForm({
          name: "",
          email: "",
          tier: "VIP Pro",
          subject: "",
          category: "Terminal & Data",
          message: "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-canvas min-h-screen py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="live-badge text-[9px]">
                <span className="live-dot" /> REQUESTS ANSWERED BY OUR TEAM
              </span>
              <span className="text-[10px] font-mono-data text-[#7D8594]">
                VIP OPERATIONS DESK
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              VIP Client Services & Operations
            </h1>
            <p className="text-xs text-[#7D8594] mt-0.5">
              Send us a question. Our team at Saif Tech Global LLC reads every request and replies by email
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono-data text-xs text-[#2ECC71]">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>AVG AI RESOLUTION TIME: 1.8 SECONDS</span>
          </div>
        </div>

        {/* Corporate Contact info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-[#FF9A3C]">
              <Building2 className="w-4 h-4" />
              <h3 className="text-xs font-bold text-white uppercase font-mono-data">Corporate Operator</h3>
            </div>
            <p className="text-xs text-[#B6BDC8]">Saif Tech Global LLC</p>
            <p className="text-[11px] text-[#7D8594]">1209 Orange Street, Wilmington, DE 19801, USA</p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-[#FF9A3C]">
              <Mail className="w-4 h-4" />
              <h3 className="text-xs font-bold text-white uppercase font-mono-data">Direct Desks</h3>
            </div>
            <p className="text-xs text-[#B6BDC8]">contact@sg16finance.com</p>
            <p className="text-[11px] text-[#7D8594]">operations@saiftechglobal.com</p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-[#FF9A3C]">
              <Clock className="w-4 h-4" />
              <h3 className="text-xs font-bold text-white uppercase font-mono-data">Operating Hours</h3>
            </div>
            <p className="text-xs text-[#2ECC71] font-semibold">24 Hours / 7 Days a Week</p>
            <p className="text-[11px] text-[#7D8594]">Continuous automated neural response</p>
          </div>
        </div>

        {/* Instant AI Resolution Notification Banner */}
        {instantResolution && (
          <div className="glass-shield overflow-hidden border-[#2ECC71]/40 bg-[#2ECC71]/5 animate-in fade-in">
            <div className="shield-accent-bar" />
            <div className="glass-shield-inner p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#2ECC71] font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>SG16 Sentinel AI — Instant Ticket Resolution</span>
                </div>
                <span className="live-badge text-[9px]">
                  <span className="live-dot" /> RESOLVED & SAVED TO DB
                </span>
              </div>
              <p className="text-xs text-white leading-relaxed font-sans whitespace-pre-wrap">
                {instantResolution}
              </p>
              <button
                onClick={() => setInstantResolution(null)}
                className="text-xs text-[#FF9A3C] hover:underline"
              >
                Close notice
              </button>
            </div>
          </div>
        )}

        {/* Interactive VIP Support Form */}
        <div className="glass-shield overflow-hidden">
          <div className="shield-accent-bar" />
          <div className="glass-shield-inner p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-[#FF9A3C]" />
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Submit VIP Service or Technical Inquiry
                </h3>
                <p className="text-xs text-[#7D8594]">
                  Every inquiry is logged and sent to our team. We reply to the email address you provide.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#7D8594] uppercase font-mono-data mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Elena Rostova"
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#7D8594] uppercase font-mono-data mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. elena@geneva-wealth.ch"
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#7D8594] uppercase font-mono-data mb-1.5">
                    Institutional Tier
                  </label>
                  <select
                    value={form.tier}
                    onChange={(e) => setForm({ ...form, tier: e.target.value })}
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white focus:outline-none focus:border-[#C76A16]"
                  >
                    <option value="VIP Pro">VIP Pro</option>
                    <option value="Institutional">Institutional Client</option>
                    <option value="Sovereign">Sovereign Wealth Desk</option>
                    <option value="Free">Free Research User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#7D8594] uppercase font-mono-data mb-1.5">
                    Topic / Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white focus:outline-none focus:border-[#C76A16]"
                  >
                    <option value="Terminal & Data">Live Pricing Telemetry & Feed</option>
                    <option value="API Access">WebSocket & FIX Protocol API Keys</option>
                    <option value="Portfolio Model">Portfolio Covariance & Beta Model</option>
                    <option value="Billing">Billing & Corporate Licensing</option>
                    <option value="Market Inquiry">Earnings / Sector Inquiries</option>
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
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Request verification of FIX protocol quote timestamps"
                  className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#7D8594] uppercase font-mono-data mb-1.5">
                  Message / Inquiries
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your inquiry. Our team will reply by email..."
                  className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D97B22] to-[#C76A16] text-white font-semibold text-xs shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? "Sentinel AI Processing Ticket..." : "Submit Support Request"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
