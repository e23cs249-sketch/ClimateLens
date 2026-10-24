import React from 'react';
import {
  Compass,
  MapPin,
  Layers,
  ShieldCheck,
  History,
  ClipboardList,
  Info,
  Database,
  ExternalLink,
  Flame,
  CloudRain,
  HelpCircle,
  X,
  Cpu,
  Activity,
  Award,
  ListCheck,
  Users,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  language: 'en' | 'ta';
  evidenceCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  language,
  evidenceCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: language === 'ta' ? 'கண்ணோட்டம்' : 'Overview',
      icon: Compass,
      tag: null,
    },
    {
      id: 'myarea',
      label: language === 'ta' ? 'எனது பகுதி' : 'My Area',
      icon: MapPin,
      tag: 'Live',
    },
    {
      id: 'twin',
      label: language === 'ta' ? 'சான்று இரட்டை' : 'Evidence Twin',
      icon: Cpu,
      tag: 'Twin',
    },
    {
      id: 'tamper',
      label: language === 'ta' ? 'சேதப்படுத்தும் ஆய்வகம்' : 'Tampering Lab',
      icon: Activity,
      tag: 'Demo',
    },
    {
      id: 'actions',
      label: language === 'ta' ? 'செயல் தாக்க லெட்ஜர்' : 'Action Ledger',
      icon: ListCheck,
      tag: 'Unique',
    },
    {
      id: 'challenges',
      label: language === 'ta' ? 'சமூக சவால்கள்' : 'Challenges',
      icon: Users,
      tag: null,
    },
    {
      id: 'map',
      label: language === 'ta' ? 'அபாய வரைபடம்' : 'Climate Map',
      icon: Layers,
      tag: 'GIS',
    },
    {
      id: 'readyplan',
      label: language === 'ta' ? 'பாதுகாப்பு வழிகாட்டி' : 'Safety Guide',
      icon: ClipboardList,
      tag: null,
    },
    {
      id: 'verify',
      label: language === 'ta' ? 'நேர்மை சரிபார்த்தல்' : 'ClimateProof Verify',
      icon: ShieldCheck,
      tag: 'SHA-256',
    },
    {
      id: 'evidence',
      label: language === 'ta' ? 'ஆதார பதிவுகள்' : 'Evidence Vault',
      icon: Database,
      tag: evidenceCount.toString(),
    },
    {
      id: 'history',
      label: language === 'ta' ? 'மாற்ற வரலாறு' : 'What Changed?',
      icon: History,
      tag: null,
    },
    {
      id: 'about',
      label: language === 'ta' ? 'திட்டம் பற்றி' : 'About & Sources',
      icon: Info,
      tag: null,
    },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <aside className="w-64 liquid-glass border-r border-white/10 flex flex-col justify-between shrink-0 h-[calc(100vh-57px)] sticky top-[57px]">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Core Loop Badge */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0B2633] to-[#071722] border border-[#19B8A5]/30 shadow-sm space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#8CE6E0] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#19B8A5] animate-ping" />
            <span>Integrity Loop</span>
          </div>
          <p className="text-[11px] text-[#A7BAC4] leading-relaxed">
            Data → Provenance → Quality Check → AI Explainer → SHA-256 Proof → History
          </p>
        </div>

        {/* Navigation items */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono font-bold text-[#A7BAC4] uppercase tracking-wider">
            {language === 'ta' ? 'முதன்மை வழிசெலுத்தல்' : 'Primary Navigation'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-[#19B8A5] text-[#071722] shadow-[0_0_16px_rgba(25,184,165,0.3)] font-bold'
                    : 'text-[#A7BAC4] hover:bg-white/5 hover:text-[#F3F8FA]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#071722]' : 'text-[#8CE6E0]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.tag && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                      isActive ? 'bg-[#071722]/30 text-[#071722]' : 'bg-white/10 text-[#8CE6E0]'
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer notice */}
      <div className="p-4 border-t border-white/10 bg-black/20 space-y-2">
        <div className="text-[11px] text-[#A7BAC4] leading-tight">
          <span className="font-bold text-[#F3F8FA]">ClimateLens</span> complements official civil protection services. Always prioritize official warnings during emergencies.
        </div>
        <div className="text-[10px] text-[#A7BAC4] flex items-center justify-between font-mono pt-1">
          <span>IEEE Hackathon 2026</span>
          <span className="text-[#19B8A5]">Track 4</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        {sidebarContent}
      </div>

      {/* Mobile Off-Canvas Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 flex flex-col w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
