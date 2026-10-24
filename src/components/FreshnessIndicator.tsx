import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, HelpCircle } from 'lucide-react';

interface FreshnessIndicatorProps {
  freshness: {
    status: 'fresh' | 'stale' | 'unknown' | 'expired';
    ageMinutes: number | null;
    thresholdMinutes: number;
    reason: string;
  };
  sourceTime: string | null;
  retrievedAt: string;
  language: 'en' | 'ta';
}

export const FreshnessIndicator: React.FC<FreshnessIndicatorProps> = ({
  freshness,
  sourceTime,
  retrievedAt,
  language,
}) => {
  const getBadgeConfig = () => {
    switch (freshness.status) {
      case 'fresh':
        return {
          icon: CheckCircle2,
          bg: 'bg-[#E4F4E9]',
          border: 'border-[#B2DEC1]',
          text: 'text-[#24724E]',
          label: language === 'ta' ? 'புதிய தரவு (Fresh)' : 'Verified Fresh',
        };
      case 'stale':
        return {
          icon: Clock,
          bg: 'bg-[#FFF3D9]',
          border: 'border-[#F0D59D]',
          text: 'text-[#A96612]',
          label: language === 'ta' ? 'பழைய தரவு (Stale)' : 'Stale Data Notice',
        };
      case 'expired':
        return {
          icon: AlertTriangle,
          bg: 'bg-[#FCE8E6]',
          border: 'border-[#F4B2AF]',
          text: 'text-[#B93838]',
          label: language === 'ta' ? 'காலாவதியானது (Expired)' : 'Validity Expired',
        };
      default:
        return {
          icon: HelpCircle,
          bg: 'bg-[#F1F5F2]',
          border: 'border-[#DDE5DE]',
          text: 'text-[#697871]',
          label: language === 'ta' ? 'தெரியவில்லை (Unknown)' : 'Freshness Unknown',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <div className={`p-3.5 rounded-lg border ${config.border} ${config.bg} space-y-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-xs text-[#172923]">
          <Icon className={`w-4 h-4 ${config.text}`} />
          <span>{config.label}</span>
        </div>
        {freshness.ageMinutes !== null && (
          <span className="text-[11px] font-mono text-[#697871]">
            {freshness.ageMinutes}m / max {freshness.thresholdMinutes}m
          </span>
        )}
      </div>

      <p className="text-xs text-[#172923] leading-relaxed">{freshness.reason}</p>

      {/* Unboxed metadata line with typographic separator */}
      <div className="pt-1 text-[11px] text-[#697871] flex flex-wrap items-center gap-2 border-t border-black/5 font-mono">
        <span>Observed: {sourceTime ? new Date(sourceTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not provided'}</span>
        <span aria-hidden="true">·</span>
        <span>Ingested: {new Date(retrievedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};
