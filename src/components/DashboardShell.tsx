"use client";

import { useState, ReactNode } from "react";
import Header from "./Header";
import LiveTickerBar from "./LiveTickerBar";
import Footer from "./Footer";
import AiCopilotModal from "./AiCopilotModal";
import SearchModal from "./SearchModal";
import { Bot, MessageSquare } from "lucide-react";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState<string | undefined>(undefined);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleOpenAiModal = (query?: string) => {
    setAiInitialQuery(query);
    setAiModalOpen(true);
  };

  const handleTickerSelect = (symbol: string) => {
    handleOpenAiModal(`Institutional intelligence analysis for ticker ${symbol}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#07090C] text-[#B6BDC8] selection:bg-[#C76A16]/30 selection:text-white">
      {/* Institutional Top Navigation */}
      <Header
        onOpenAiModal={() => handleOpenAiModal()}
        onOpenSearchModal={() => setSearchModalOpen(true)}
      />

      {/* Dual Continuous Live Ticker Stream */}
      <LiveTickerBar onSelectTicker={handleTickerSelect} />

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Global Institutional Footer */}
      <Footer />

      {/* Persistent Floating 24/7 AI Sentinel Launcher Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => handleOpenAiModal()}
          className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#D97B22] to-[#C76A16] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_4px_24px_rgba(199,106,22,0.45)] hover:shadow-[0_4px_32px_rgba(199,106,22,0.65)] hover:scale-105 transition-all cursor-pointer border border-[#FF9A3C]/40"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">24/7 AI Sentinel</span>
          <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-mono-data text-[#FF9A3C]">
            ACTIVE
          </span>
        </button>
      </div>

      {/* AI Copilot Intelligence Modal */}
      <AiCopilotModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        initialQuery={aiInitialQuery}
      />

      {/* Spotlight Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectAiQuery={(query) => handleOpenAiModal(query)}
      />
    </div>
  );
}
