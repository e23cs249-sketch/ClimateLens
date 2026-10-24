import React from 'react';
import { Check, X, ShieldAlert, Cpu } from 'lucide-react';
import { WeatherData } from '../services/api.ts';

interface QualityPanelProps {
  weather: WeatherData;
  language: 'en' | 'ta';
}

export const QualityPanel: React.FC<QualityPanelProps> = ({ weather, language }) => {
  const isFresh = weather.freshness.status === 'fresh';
  const isComplete = weather.completeness.status === 'complete';
  const hasSourceTimestamp = Boolean(weather.timestamps.sourceTime);
  const hasValidUnits = Boolean(weather.units.temperature && weather.units.windSpeed);
  const isNotExpired = weather.freshness.status !== 'expired';

  const checks = [
    {
      title: language === 'ta' ? 'அனைத்து முக்கிய வானிலை அளவீடுகளும் கிடைக்கின்றன' : 'Core Meteorological Parameters Present',
      passed: isComplete,
      detail: weather.completeness.reason,
    },
    {
      title: language === 'ta' ? 'மூல அவதானிப்பு கால முத்திரை சரிபார்க்கப்பட்டது' : 'Source Observation Timestamp Provided',
      passed: hasSourceTimestamp,
      detail: hasSourceTimestamp
        ? `Observed at ${new Date(weather.timestamps.sourceTime).toUTCString()}`
        : 'Source omitted explicit timestamp; relying on ingestion time.',
    },
    {
      title: language === 'ta' ? 'செயல்பாட்டு புத்துணர்ச்சி வரம்பிற்குள் உள்ளது' : 'Within Operational Freshness Window',
      passed: isFresh,
      detail: weather.freshness.reason,
    },
    {
      title: language === 'ta' ? 'மாதிரி முன்கணிப்பு காலாவதியாகவில்லை' : 'Forecast Cycle Validity Active',
      passed: isNotExpired,
      detail: weather.timestamps.validUntil
        ? `Cycle valid until ${new Date(weather.timestamps.validUntil).toLocaleTimeString()}`
        : 'Open validity period specified by provider.',
    },
    {
      title: language === 'ta' ? 'சர்வதேச அளவீட்டு அலகுகள் (SI Units) முழுமையானவை' : 'Standard Metric Units Defined',
      passed: hasValidUnits,
      detail: `Temp: ${weather.units.temperature}, Wind: ${weather.units.windSpeed}, Pressure: ${weather.units.surfacePressure || 'hPa'}`,
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;

  return (
    <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#8CE6E0]" />
          <h3 className="text-sm font-bold text-[#F3F8FA]">
            {language === 'ta' ? 'வெளிப்படையான தரவு தர தணிக்கை' : 'Transparent Data Quality Audit'}
          </h3>
        </div>
        <div className="text-xs font-mono font-bold text-[#071722] bg-[#19B8A5] px-2.5 py-1 rounded-lg">
          {passedCount} / {checks.length} {language === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Checks Passed'}
        </div>
      </div>

      <div className="space-y-3">
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                check.passed ? 'bg-[#19B8A5]/20 text-[#19B8A5]' : 'bg-[#FF6268]/20 text-[#FF6268]'
              }`}
            >
              {check.passed ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[#F3F8FA]">{check.title}</div>
              <div className="text-[#A7BAC4] text-[11px] mt-0.5 leading-relaxed">{check.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/10 text-[11px] text-[#A7BAC4] leading-relaxed">
        <strong>Transparency Policy:</strong> Quality checks verify presence, freshness, and structural compliance. They evaluate whether data meets empirical operational thresholds, not subjective confidence scores.
      </div>
    </div>
  );
};
