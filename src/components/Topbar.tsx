import React, { useState } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  MapPin,
  Sparkles,
  X,
  Menu,
  ChevronRight,
  Database,
  Layers,
  ClipboardList,
  Compass,
  Cpu,
  Activity,
  Award,
  ListCheck,
  Users,
} from 'lucide-react';
import { JudgeDemoModal } from './JudgeDemoModal.tsx';

interface TopbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  language: 'en' | 'ta';
  onToggleLanguage: (lang: 'en' | 'ta') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onSealEvidence: () => void;
  isSealing: boolean;
  currentLocationLabel?: string;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

const TAB_TITLES: Record<string, { en: string; ta: string; icon: any }> = {
  overview: { en: 'Overview', ta: 'கண்ணோட்டம்', icon: Compass },
  myarea: { en: 'My Area Dashboard', ta: 'எனது பகுதி', icon: MapPin },
  twin: { en: 'Climate Evidence Twin', ta: 'சான்று இரட்டை', icon: Cpu },
  tamper: { en: 'Interactive Tampering Lab', ta: 'சேதப்படுத்தும் ஆய்வகம்', icon: Activity },
  actions: { en: 'Climate Action Impact Ledger', ta: 'செயல் தாக்க லெட்ஜர்', icon: ListCheck },
  challenges: { en: 'Community Challenges', ta: 'சமூக சவால்கள்', icon: Users },
  map: { en: 'Climate & Hazard Map', ta: 'அபாய வரைபடம்', icon: Layers },
  readyplan: { en: 'Safety Guide', ta: 'பாதுகாப்பு வழிகாட்டி', icon: ClipboardList },
  verify: { en: 'ClimateProof Verify', ta: 'நேர்மை சரிபார்த்தல்', icon: ShieldCheck },
  evidence: { en: 'Evidence Records Vault', ta: 'ஆதார பதிவுகள்', icon: Database },
  history: { en: 'What Changed?', ta: 'மாற்ற வரலாறு', icon: RefreshCw },
  about: { en: 'About & Sources', ta: 'திட்டம் பற்றி', icon: HelpCircle },
};

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onNavigate,
  language,
  onToggleLanguage,
  onRefresh,
  isRefreshing,
  onSealEvidence,
  isSealing,
  currentLocationLabel,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showJudgeTour, setShowJudgeTour] = useState(false);
  const currentTabInfo = TAB_TITLES[currentTab] || TAB_TITLES['overview'];
  const TabIcon = currentTabInfo.icon;

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-[#071722]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_24px_rgba(7,23,34,0.6)]">
        {/* Zone 1: Mobile toggle & Brand */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-[#A7BAC4] hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <a
            href="#/overview"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('overview');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-[#F3F8FA] whitespace-nowrap shrink-0 flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#19B8A5] to-[#0B2633] border border-[#8CE6E0]/40 flex items-center justify-center text-[#071722] font-mono text-sm font-bold shadow-[0_0_16px_rgba(25,184,165,0.4)] group-hover:scale-105 transition-transform">
              CL
            </div>
            <div className="flex flex-col">
              <span className="leading-tight font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3F8FA] to-[#8CE6E0]">
                ClimateLens
              </span>
              <span className="text-[9px] font-mono text-[#19B8A5] tracking-wider leading-none hidden sm:inline">
                VERIFIABLE CLIMATE INTELLIGENCE
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Contextual Breadcrumb (Replaces redundant top links) */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#A7BAC4] font-medium truncate">
          <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <div className="flex items-center gap-1.5 text-[#F3F8FA] font-semibold truncate bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            <TabIcon className="w-3.5 h-3.5 text-[#19B8A5] shrink-0" />
            <span className="truncate">{currentTabInfo[language]}</span>
          </div>

          {currentLocationLabel && (
            <>
              <span className="text-white/20">·</span>
              <div className="flex items-center gap-1 text-[#8CE6E0] font-mono text-[11px] truncate">
                <MapPin className="w-3 h-3 text-[#19B8A5] shrink-0" />
                <span className="truncate">{currentLocationLabel.split(',')[0]}</span>
              </div>
            </>
          )}
        </div>

        {/* Zone 3: Actions & Global Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* 3-Minute Judge Tour Button */}
          <button
            onClick={() => setShowJudgeTour(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#071722] bg-gradient-to-r from-[#FFBF69] via-[#8CE6E0] to-[#19B8A5] hover:brightness-110 font-extrabold rounded-xl transition-all shadow-[0_0_16px_rgba(255,191,105,0.4)] hover:scale-105"
            title="Interactive 3-minute hackathon presentation tour"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3-Min Judge Demo</span>
            <span className="sm:hidden font-mono text-[10px]">Demo</span>
          </button>

          {/* How it Works dialog button */}
          <button
            onClick={() => setShowHowItWorks(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#A7BAC4] hover:text-[#F3F8FA] rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            title="How Climate Lens works in ordinary language"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#19B8A5]" />
            <span className="hidden sm:inline">How It Works</span>
          </button>

          {/* Language selector toggle */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => onToggleLanguage('en')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'en' ? 'bg-[#19B8A5] text-[#071722] font-bold' : 'text-[#A7BAC4] hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onToggleLanguage('ta')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'ta' ? 'bg-[#19B8A5] text-[#071722] font-bold' : 'text-[#A7BAC4] hover:text-white'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Refresh live feed */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh current meteorological reading"
            className="p-2 text-[#A7BAC4] hover:text-[#8CE6E0] rounded-xl hover:bg-white/5 border border-white/5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#19B8A5]' : ''}`} />
          </button>

          {/* Primary Action Button */}
          {currentTab === 'myarea' ? (
            <button
              onClick={onSealEvidence}
              disabled={isSealing}
              className="px-3.5 py-1.5 text-xs font-bold text-[#071722] bg-[#19B8A5] hover:bg-[#159a8a] rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-[0_0_16px_rgba(25,184,165,0.3)] hover:scale-[1.02]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isSealing ? 'Sealing...' : 'Seal Snapshot'}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('myarea')}
              className="px-3.5 py-1.5 text-xs font-bold text-[#071722] bg-[#19B8A5] hover:bg-[#159a8a] rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-[0_0_16px_rgba(25,184,165,0.3)] hover:scale-[1.02]"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>My Area</span>
            </button>
          )}
        </div>
      </header>

      {/* "How Climate Lens Works" Modal Dialog */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-xl liquid-glass rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#19B8A5]" />
                <h3 className="text-lg font-bold text-[#F3F8FA]">
                  How Climate Lens Works
                </h3>
              </div>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="p-1.5 rounded-lg text-[#A7BAC4] hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#A7BAC4] leading-relaxed">
              Most weather apps only show raw temperatures or generic icons. Climate Lens is designed around <strong>three simple questions</strong> you can act on:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-[#8CE6E0] block">1. What is happening in my area?</span>
                <p className="text-[#A7BAC4] leading-relaxed">
                  Real environmental data from open scientific providers (Open-Meteo, ECMWF, DWD ICON) showing temperatures, rain rates, humidity, and air quality.
                </p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-[#8CE6E0] block">2. What could happen next, and how reliable is it?</span>
                <p className="text-[#A7BAC4] leading-relaxed">
                  Rules-based quality checks audit data age and field completeness, while grounded AI explains uncertainties without exaggerating danger.
                </p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-[#8CE6E0] block">3. What should I do now to stay safe?</span>
                <p className="text-[#A7BAC4] leading-relaxed">
                  Clear, practical checklists for extreme heat, heavy rainfall, and household preparation, paired with official emergency hotlines.
                </p>
              </div>

              <div className="p-3.5 bg-[#19B8A5]/10 rounded-xl border border-[#19B8A5]/20 space-y-1">
                <span className="font-bold text-[#19B8A5] block">The ClimateChain Hackathon Connection:</span>
                <p className="text-[#A7BAC4] leading-relaxed">
                  Every reading can be canonicalized (RFC 8785) and hashed (SHA-256) into a verifiable ledger and anchored on the Polygon Amoy testnet.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHowItWorks(false)}
              className="w-full py-2.5 bg-[#19B8A5] text-[#071722] font-bold text-xs rounded-xl hover:bg-[#159a8a] transition-all"
            >
              Got It — Let&rsquo;s Explore
            </button>
          </div>
        </div>
      )}

      {/* 3-Minute Judge Experience Tour Modal */}
      <JudgeDemoModal
        isOpen={showJudgeTour}
        onClose={() => setShowJudgeTour(false)}
        onNavigate={onNavigate}
        language={language}
      />
    </>
  );
};
