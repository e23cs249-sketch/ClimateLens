import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  RotateCcw,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Activity,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  MapPin,
  Brain,
  ListCheck,
  Layers,
} from 'lucide-react';
import { resetDemoDataApi } from '../services/api.ts';

interface JudgeDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  language: 'en' | 'ta';
}

interface DemoStep {
  step: number;
  time: string;
  title: { en: string; ta: string };
  targetTab: string;
  summary: { en: string; ta: string };
  actionLabel: { en: string; ta: string };
  badge: { en: string; ta: string };
  keyHighlights: { en: string[]; ta: string[] };
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    time: '0:00 – 0:30',
    title: {
      en: '1. Climate Evidence (Telemetry & Provenance)',
      ta: '1. காலநிலை சான்று (நேரடி அளவீடுகள் & மூலம்)',
    },
    targetTab: 'myarea',
    badge: { en: 'DATA AUDIT TRAIL', ta: 'தரவு தணிக்கை' },
    summary: {
      en: 'Inspect live environmental telemetry for Chennai or other climate-vulnerable zones. Data is ingested from Open-Meteo and Copernicus ERA5 suites with full source attribution, provider timestamps, completeness checks, and no fabricated data.',
      ta: 'சென்னை அல்லது பிற இடங்களின் நேரடி காலநிலை தரவுகளை பார்வையிடுங்கள். Open-Meteo & Copernicus ERA5 மூலம் முழுமையான மூல விவரங்கள் மற்றும் உண்மைத்தன்மை சோதனை செய்யப்படுகிறது.',
    },
    actionLabel: { en: 'Inspect Live Telemetry', ta: 'நேரடி அளவீடுகளைப் பார்க்கவும்' },
    keyHighlights: {
      en: [
        'Live temperature, apparent temp, rain rate, wind & humidity',
        'Transparent provider metadata (Open-Meteo CC BY 4.0)',
        'Rules-based data freshness and completeness auditing',
      ],
      ta: [
        'வெப்பநிலை, மழை அளவு, ஈரப்பதம் மற்றும் காற்றின் வேகம்',
        'வெளிப்படையான மூல உரிமை (Open-Meteo CC BY 4.0)',
        'தரவு புத்துணர்ச்சி மற்றும் முழுமைத்தன்மை தணிக்கை',
      ],
    },
  },
  {
    step: 2,
    time: '0:30 – 1:00',
    title: {
      en: '2. Evidence Creation (RFC 8785 Snapshot & SHA-256)',
      ta: '2. சான்று உருவாக்கம் (RFC 8785 & SHA-256)',
    },
    targetTab: 'twin',
    badge: { en: 'CRYPTOGRAPHIC EVIDENCE TWIN', ta: 'கிரிப்டோகிராபிக் சான்று இரட்டை' },
    summary: {
      en: 'Generate the signature Climate Evidence Twin. Inspect derived NOAA Steadman heat stress regression, Thom’s discomfort index, and the strictly canonicalized RFC 8785 JSON payload sealed with a deterministic SHA-256 digest.',
      ta: 'காலநிலை சான்று இரட்டையை உருவாக்கவும். NOAA ஸ்டெட்மேன் வெப்ப அழுத்த குறியீடு, தாம் அசௌகரிய குறியீடு மற்றும் RFC 8785 அடிப்படையில் வரிசைப்படுத்தப்பட்ட SHA-256 ஹேஷ் குறியீட்டைப் பார்க்கவும்.',
    },
    actionLabel: { en: 'Inspect Evidence Twin', ta: 'சான்று இரட்டையைப் பார்க்கவும்' },
    keyHighlights: {
      en: [
        'RFC 8785 JSON Canonicalization Scheme (JCS) deterministic output',
        'Preserved original creation timestamp (no re-render shifts)',
        'NOAA Steadman & Thom thermal stress indicators derived locally',
      ],
      ta: [
        'RFC 8785 தரநிலையின்படி நிர்ணயிக்கப்பட்ட JSON வடிவம்',
        'மாறாத அசல் நேர முத்திரை பாதுகாப்பு',
        'உள்ளூரில் கணக்கிடப்பட்ட வெப்ப அழுத்தக் குறியீடுகள்',
      ],
    },
  },
  {
    step: 3,
    time: '1:00 – 1:30',
    title: {
      en: '3. Verification (Independent RFC 8785 Integrity Check)',
      ta: '3. சரிபார்த்தல் (RFC 8785 ஒருமைப்பாடு ஆய்வு)',
    },
    targetTab: 'verify',
    badge: { en: 'INDEPENDENT RE-COMPUTATION', ta: 'சுயாதீன மறு கணக்கீடு' },
    summary: {
      en: 'Execute independent client/server verification. The engine parses the canonical JSON payload, re-runs UTF-16 lexicographical sorting and IEEE 754 serialization, re-computes SHA-256, and proves 100% bitwise cryptographic match.',
      ta: 'சுயாதீன சரிபார்ப்பை இயக்கவும். எஞ்சின் JSON உள்ளடக்கத்தை மீண்டும் வரிசைப்படுத்தி, SHA-256 மறு கணக்கீடு செய்து, 100% பிட்வைஸ் பொருத்தத்தை நிரூபிக்கிறது.',
    },
    actionLabel: { en: 'Run Evidence Verification', ta: 'சரிபார்ப்பை இயக்கவும்' },
    keyHighlights: {
      en: [
        'Bit-for-bit SHA-256 re-computation against stored baseline',
        'Support for raw JSON file upload and off-line payload testing',
        'Zero false positives with comprehensive integrity checks',
      ],
      ta: [
        'சேமிக்கப்பட்ட பதிவிற்கு எதிரான நேரடி SHA-256 மறு கணக்கீடு',
        'மூல JSON கோப்பு பதிவேற்ற சரிபார்ப்பு ஆதரவு',
        'பூஜ்ஜிய தவறு சாத்தியக்கூறுடன் முழுமை சரிபார்ப்பு',
      ],
    },
  },
  {
    step: 4,
    time: '1:30 – 2:05',
    title: {
      en: '4. Tampering Lab (Avalanche Effect Sandbox)',
      ta: '4. சேத ஆய்வகம் (அவலான்ச் விளைவு மணல்தொட்டி)',
    },
    targetTab: 'tamper',
    badge: { en: 'TAMPER DETECTION TESTBED', ta: 'சேத கண்டறிதல் தளம்' },
    summary: {
      en: 'Perturb the temperature slider by just +0.1°C in the isolated sandbox. The SHA-256 digest flips completely via the Avalanche Effect, triggering an instant MISMATCH verdict while preserving the original stored record 100% untouched.',
      ta: 'மணல்தொட்டியில் வெப்பநிலையை 0.1°C மட்டும் மாற்றிப் பாருங்கள். அவலான்ச் விளைவு காரணமாக ஹேஷ் முழுமையாக மாறி, உடனடியாக முரண்பாட்டை வெளிப்படுத்தும்; ஆனால் அசல் பதிவு மாறாமல் இருக்கும்.',
    },
    actionLabel: { en: 'Open Tampering Lab', ta: 'சேத ஆய்வகத்தைத் திறக்கவும்' },
    keyHighlights: {
      en: [
        'Interactive telemetry sliders & raw JSON editor in sandbox',
        'Side-by-side original vs recalculated SHA-256 hash comparison',
        'Database baseline immutability: original snapshot remains pristine',
      ],
      ta: [
        'மணல்தொட்டியில் ஊடாடும் அளவீட்டு மாற்றிகள் மற்றும் JSON எடிட்டர்',
        'அசல் மற்றும் மாற்றப்பட்ட ஹேஷ் ஒப்பீடு',
        'தரவுத்தள அசல் பதிவு முழுமையாக பாதுகாக்கப்படும் உறுதி',
      ],
    },
  },
  {
    step: 5,
    time: '2:05 – 2:30',
    title: {
      en: '5. Climate Context & Grounded AI Copilot (Bilingual)',
      ta: '5. காலநிலை விளக்கம் & ஏஐ வழிகாட்டி (இருமொழி)',
    },
    targetTab: 'myarea',
    badge: { en: 'BILINGUAL SCIENTIFIC EXPLAINER', ta: 'இருமொழி அறிவியல் விளக்கம்' },
    summary: {
      en: 'Review the Grounded AI Climate Explainer in English or Tamil. Every statement directly cites structured meteorological facts with clear bounds on uncertainty, avoiding hallucinations and distinguishing facts from advice.',
      ta: 'ஆங்கிலம் அல்லது தமிழில் அறிவியல் ஏஐ விளக்கவுரையைப் பார்வையிடவும். ஒவ்வொரு அறிக்கையும் உண்மையான வானிலை அளவீடுகளின் அடிப்படையில் மட்டுமே உருவாக்கப்படுகிறது.',
    },
    actionLabel: { en: 'View AI Copilot Insights', ta: 'ஏஐ வழிகாட்டியைப் பார்க்கவும்' },
    keyHighlights: {
      en: [
        'Clean sectioning: Meaning, Significance, Space/Time, Actions, Uncertainties',
        'Authentic Tamil (தமிழ்) translation tuned for local climate terminology',
        'Deterministic rule-based fallback if API is unavailable',
      ],
      ta: [
        'பொருள், முக்கியத்துவம், இடம்/நேரம், நடைமுறை பாதுகாப்பு, வரம்புகள்',
        'உள்ளூர் காலநிலை சொற்களுடன் கூடிய தூய தமிழ் வடிவம்',
        'நெட்வொர்க் இல்லாவிட்டாலும் இயங்கும் விதி அடிப்படையிலான மாற்று',
      ],
    },
  },
  {
    step: 6,
    time: '2:30 – 2:45',
    title: {
      en: '6. Blockchain Transparency & Solidity Contract',
      ta: '6. பிளாக்செயின் நேர்மை & ஸ்மார்ட் ஒப்பந்தம்',
    },
    targetTab: 'verify',
    badge: { en: 'ZERO FAKE ON-CHAIN CLAIMS', ta: 'போலி பிளாக்செயின் இல்லை' },
    summary: {
      en: 'Inspect our transparent blockchain architecture. When Polygon Amoy RPC is unconfigured, we display an honest "Simulated Demonstration" label with zero fake 0x hashes or invented block numbers, and provide the fully auditable Solidity smart contract source.',
      ta: 'எங்கள் வெளிப்படையான பிளாக்செயின் கட்டமைப்பைப் பார்வையிடவும். உண்மையான RPC இல்லாதபோது போலி ஹேஷ்கள் இல்லாமல் வெளிப்படையான மாதிரி நிலையைக் காட்டும், மேலும் தணிக்கை செய்யக்கூடிய Solidity குறியீட்டையும் வழங்குகிறது.',
    },
    actionLabel: { en: 'View Blockchain Proofs & Contract', ta: 'ஒப்பந்தம் & ஆதாரங்களைப் பார்க்கவும்' },
    keyHighlights: {
      en: [
        'Honest unconfigured mode: "unsubmitted_simulated" status badge',
        'Production Polygon Amoy EVM integration with live event emission',
        'Complete OpenZeppelin-compatible ClimateEvidenceAnchor.sol code',
      ],
      ta: [
        'நேர்மையான மாதிரி நிலை: போலி 0x பரிவர்த்தனைகள் எதுவும் உருவாக்கப்படாது',
        'பயன்பாட்டுக்குத் தயாரான Polygon Amoy ஸ்மார்ட் ஒப்பந்தம்',
        'முழுமையான ClimateEvidenceAnchor.sol மூலக் குறியீடு',
      ],
    },
  },
  {
    step: 7,
    time: '2:45 – 3:00',
    title: {
      en: '7. Action Ledger & Cryptographic Impact Receipts',
      ta: '7. செயல் தாக்க லெட்ஜர் & கிரிப்டோகிராபிக் ரசீதுகள்',
    },
    targetTab: 'actions',
    badge: { en: 'SEALED ACTION RECEIPTS', ta: 'முத்திரையிடப்பட்ட செயல் ரசீதுகள்' },
    summary: {
      en: 'Record an evidence-grounded community climate action (e.g. hydration kiosk or tree shade initiative). Seal a deterministic Cryptographic Action Receipt that transparently distinguishes user-reported completion from physical sensor impact.',
      ta: 'சமூக காலநிலை பாதுகாப்பு நடவடிக்கைகளை பதிவு செய்யுங்கள். பயனர் சுயாதீன அறிக்கைக்கும் உண்மையான சென்சார் அளவீட்டிற்கும் உள்ள வித்தியாசத்தை வெளிப்படையாகக் கூறும் கிரிப்டோகிராபிக் ரசீதை உருவாக்கவும்.',
    },
    actionLabel: { en: 'Open Action Impact Ledger', ta: 'செயல் லெட்ஜரைத் திறக்கவும்' },
    keyHighlights: {
      en: [
        'State persistence in database with audit history',
        'Cryptographic receipt with SHA-256 seal & verification metadata',
        'Clear "User-Reported Completion" badge preventing greenwashing',
      ],
      ta: [
        'தரவுத்தளத்தில் சேமிக்கப்படும் தொடர் தணிக்கை வரலாறு',
        'SHA-256 முத்திரையுடன் கூடிய கிரிப்டோகிராபிக் செயல் ரசீது',
        'சுய அறிக்கைக்கான தெளிவான பேட்ஜ் மூலம் வெளிப்படைத்தன்மை',
      ],
    },
  },
];

export const JudgeDemoModal: React.FC<JudgeDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  language,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIdx];

  const handleJumpToStep = () => {
    onNavigate(currentStep.targetTab);
    onClose();
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetDemoDataApi();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    } catch (err) {
      console.warn('Failed to reset demo dataset:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl liquid-glass rounded-2xl p-6 sm:p-8 border border-[#19B8A5]/40 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#19B8A5] to-[#0B2633] border border-[#8CE6E0]/40 flex items-center justify-center text-[#071722] font-bold shadow-[0_0_16px_rgba(25,184,165,0.4)]">
              <Award className="w-5 h-5 text-[#071722]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>{language === 'ta' ? '3-நிமிட நடுவர் செயல்முறை வழிகாட்டி' : '3-Minute Hackathon Presentation Guide'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#19B8A5]/20 text-[#8CE6E0] border border-[#19B8A5]/40 uppercase">
                  7-Step Flow
                </span>
              </h3>
              <span className="text-[11px] font-mono text-[#A7BAC4]">
                IEEE ClimateChain Global Hackathon 2026 · Track 4 Judging Tour
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A7BAC4] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline progress tabs (7 steps) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A7BAC4]">
            <span className="text-[#19B8A5] font-bold">
              STEP {currentStep.step} OF 7
            </span>
            <span>{currentStep.time}</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStepIdx(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentStepIdx
                    ? 'bg-[#19B8A5] shadow-[0_0_10px_rgba(25,184,165,0.7)] scale-y-110'
                    : idx < currentStepIdx
                    ? 'bg-[#8CE6E0]/60'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                title={`Step ${s.step}: ${s.title[language]}`}
              />
            ))}
          </div>
        </div>

        {/* Step Card Content */}
        <div className="p-5 sm:p-6 bg-black/50 rounded-xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#19B8A5]/20 text-[#8CE6E0] border border-[#19B8A5]/30">
              {currentStep.badge[language]}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#A7BAC4]">
              TARGET: {currentStep.targetTab.toUpperCase()}
            </span>
          </div>

          <h4 className="text-base sm:text-lg font-bold text-white">
            {currentStep.title[language]}
          </h4>

          <p className="text-xs sm:text-sm text-[#A7BAC4] leading-relaxed">
            {currentStep.summary[language]}
          </p>

          {/* Key verification highlights */}
          <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8CE6E0] font-bold block">
              {language === 'ta' ? 'தொழில்நுட்ப சிறப்பம்சங்கள்:' : 'Key Engineering Proof Points:'}
            </span>
            <ul className="space-y-1.5 text-xs text-[#F3F8FA]">
              {currentStep.keyHighlights[language].map((hl, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#19B8A5] shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <button
              onClick={handleJumpToStep}
              className="px-5 py-2.5 bg-[#19B8A5] text-[#071722] font-extrabold text-xs rounded-xl hover:bg-[#159a8a] transition-all flex items-center gap-2 shadow-[0_0_16px_rgba(25,184,165,0.4)] hover:scale-105"
            >
              <span>{currentStep.actionLabel[language]}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Navigation Controls & Reset State */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs font-mono">
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="flex items-center gap-1.5 text-[#A7BAC4] hover:text-white transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-[#19B8A5]' : ''}`} />
            <span>{resetSuccess ? (language === 'ta' ? 'நிலை மீட்டமைக்கப்பட்டது!' : 'Demo State Reset!') : (language === 'ta' ? 'மாதிரி நிலையை மீட்டமைக்க' : 'Reset Demo State')}</span>
          </button>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentStepIdx === 0}
              className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A7BAC4] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {language === 'ta' ? 'முந்தையது' : 'Previous'}
            </button>
            <button
              onClick={() => setCurrentStepIdx((prev) => Math.min(DEMO_STEPS.length - 1, prev + 1))}
              disabled={currentStepIdx === DEMO_STEPS.length - 1}
              className="px-4 py-1.5 rounded-lg bg-[#19B8A5]/20 hover:bg-[#19B8A5]/30 text-[#8CE6E0] border border-[#19B8A5]/40 font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {language === 'ta' ? 'அடுத்த படி' : 'Next Step'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
