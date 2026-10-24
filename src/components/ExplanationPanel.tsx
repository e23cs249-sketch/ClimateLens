import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, CheckCircle, AlertCircle, RefreshCw, Languages, Shield } from 'lucide-react';
import { WeatherData, ExplanationResult, requestExplanationApi } from '../services/api.ts';

interface ExplanationPanelProps {
  weather: WeatherData;
  language: 'en' | 'ta';
  onNavigateToReadyPlan: () => void;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  weather,
  language,
  onNavigateToReadyPlan,
}) => {
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<'en' | 'ta'>(language);

  // Sync with prop when changed
  useEffect(() => {
    setSelectedLang(language);
  }, [language]);

  const loadExplanation = async (langToUse: 'en' | 'ta') => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await requestExplanationApi(weather, langToUse);
      setExplanation(data);
    } catch (err: any) {
      setError(err.message || 'Unable to generate explanation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExplanation(selectedLang);
  }, [weather.location.label, selectedLang]);

  return (
    <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#8CE6E0]" />
            <h3 className="text-base font-bold text-[#F3F8FA]">
              {selectedLang === 'ta' ? 'AI காலநிலை விளக்கம் (விளக்கவுரை)' : 'Explain This Risk (Grounded AI)'}
            </h3>
          </div>
          <p className="text-xs text-[#A7BAC4] mt-0.5">
            {selectedLang === 'ta'
              ? 'உண்மையான வளிமண்டல அளவீடுகளின் அடிப்படையில் அறிவியல் பகுப்பாய்வு'
              : 'Grounded plain-language interpretation based strictly on structured evidence'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setSelectedLang('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedLang === 'en' ? 'bg-[#19B8A5] text-[#071722] font-bold shadow-xs' : 'text-[#A7BAC4] hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLang('ta')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedLang === 'ta' ? 'bg-[#19B8A5] text-[#071722] font-bold shadow-xs' : 'text-[#A7BAC4] hover:text-white'
              }`}
            >
              தமிழ்
            </button>
          </div>

          <button
            onClick={() => loadExplanation(selectedLang)}
            disabled={isLoading}
            title="Regenerate explanation"
            className="p-1.5 text-[#A7BAC4] hover:text-[#8CE6E0] rounded-lg hover:bg-white/5 border border-white/5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#19B8A5]' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center space-y-3">
          <div className="w-7 h-7 border-2 border-[#19B8A5] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#A7BAC4]">
            Synthesizing grounded explanation from structured meteorological data...
          </p>
        </div>
      ) : error ? (
        <div className="p-4 bg-[#FF6268]/10 text-[#FF6268] border border-[#FF6268]/20 rounded-xl text-xs">
          {error}
        </div>
      ) : explanation ? (
        <div className="space-y-4 text-xs">
          {/* Engine indicator */}
          <div className="flex items-center justify-between text-[11px] text-[#A7BAC4] bg-black/30 px-3 py-1.5 rounded-lg font-mono border border-white/5">
            <span>
              Engine: {explanation.providerUsed === 'gemini' ? 'Gemini 3.8 Flash (Server Grounded)' : 'Deterministic Empirical Rules Engine'}
            </span>
            <span className="text-[#8CE6E0]">Target: {selectedLang === 'ta' ? 'Tamil' : 'English'}</span>
          </div>

          {/* Section 1: What this means */}
          <div className="space-y-1">
            <span className="font-bold text-[#8CE6E0] uppercase tracking-wider text-[11px]">
              {selectedLang === 'ta' ? '1. இதன் பொருள் என்ன?' : '1. What this information means'}
            </span>
            <p className="text-[#F3F8FA] leading-relaxed text-sm">{explanation.meaning}</p>
          </div>

          {/* Section 2: Why it matters */}
          <div className="space-y-1">
            <span className="font-bold text-[#8CE6E0] uppercase tracking-wider text-[11px]">
              {selectedLang === 'ta' ? '2. இது ஏன் முக்கியமானது?' : '2. Why it matters'}
            </span>
            <p className="text-[#A7BAC4] leading-relaxed">{explanation.significance}</p>
          </div>

          {/* Section 3: Spatial and temporal context */}
          <div className="space-y-1">
            <span className="font-bold text-[#8CE6E0] uppercase tracking-wider text-[11px]">
              {selectedLang === 'ta' ? '3. பொருந்தும் பகுதி மற்றும் நேரம்' : '3. Spatial & Temporal Boundary'}
            </span>
            <p className="text-[#A7BAC4] leading-relaxed font-mono">{explanation.context}</p>
          </div>

          {/* Section 4: Recommended actions */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#19B8A5] uppercase tracking-wider text-[11px]">
                {selectedLang === 'ta' ? '4. நடைமுறை நடவடிக்கைகள்' : '4. Practical Preparedness Actions'}
              </span>
              <button
                onClick={onNavigateToReadyPlan}
                className="text-[11px] font-bold text-[#8CE6E0] hover:underline"
              >
                {selectedLang === 'ta' ? 'ரெடி பிளான் சரிபார்ப்புப் பட்டியல் →' : 'Open ReadyPlan Checklists →'}
              </button>
            </div>
            <ul className="space-y-1.5">
              {explanation.recommendedActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-[#F3F8FA]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#19B8A5] shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 5: Unknowns and limitations */}
          <div className="p-3.5 bg-[#FFBF69]/10 border border-[#FFBF69]/30 rounded-xl text-[11px] text-[#FFBF69] space-y-1">
            <span className="font-bold block">
              {selectedLang === 'ta' ? 'அறிவியல் வரம்புகள் & நிச்சயமற்ற தன்மைகள்:' : 'Scientific Limitations & Uncertainty Notice:'}
            </span>
            <p className="leading-relaxed text-[#F3F8FA]/90">{explanation.uncertainties}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
