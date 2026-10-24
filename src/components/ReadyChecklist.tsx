import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  Circle,
  ExternalLink,
  Flame,
  CloudRain,
  Home,
  Droplets,
  Leaf,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { ReadyPlanItem } from '../services/api.ts';

interface ReadyChecklistProps {
  items: ReadyPlanItem[];
  language: 'en' | 'ta';
}

const CATEGORY_ICONS: Record<string, any> = {
  extreme_heat: Flame,
  heavy_rainfall: CloudRain,
  household_readiness: Home,
  water_conservation: Droplets,
  everyday_awareness: Leaf,
};

export const ReadyChecklist: React.FC<ReadyChecklistProps> = ({ items, language }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('extreme_heat');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('climatelens_readyplan_progress');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const activeItem = items.find((item) => item.category === selectedCategory) || items[0];

  useEffect(() => {
    try {
      localStorage.setItem('climatelens_readyplan_progress', JSON.stringify(completedSteps));
    } catch (err) {
      console.warn('Storage error:', err);
    }
  }, [completedSteps]);

  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const handleReset = () => {
    if (!activeItem) return;
    const newCompleted = { ...completedSteps };
    activeItem.practicalSteps[language].forEach((_, idx) => {
      delete newCompleted[`${activeItem.id}_step_${idx}`];
    });
    setCompletedSteps(newCompleted);
  };

  if (!activeItem) return null;

  const currentSteps = activeItem.practicalSteps[language] || [];
  const completedInCurrent = currentSteps.filter(
    (_, idx) => completedSteps[`${activeItem.id}_step_${idx}`]
  ).length;
  const progressPercent = currentSteps.length > 0 ? Math.round((completedInCurrent / currentSteps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-2 liquid-glass rounded-2xl border border-white/10 shadow-lg">
        {items.map((item) => {
          const Icon = CATEGORY_ICONS[item.category] || ClipboardCheck;
          const isSelected = item.category === selectedCategory;
          return (
            <button
              key={item.category}
              onClick={() => setSelectedCategory(item.category)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-[#19B8A5] text-[#071722] shadow-[0_0_16px_rgba(25,184,165,0.4)]'
                  : 'text-[#A7BAC4] hover:text-[#F3F8FA] hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.categoryLabel[language]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Checklist Card */}
      <div className="liquid-glass rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#19B8A5] uppercase tracking-wider block">
              {activeItem.categoryLabel[language]}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#F3F8FA] mt-1">{activeItem.title[language]}</h3>
            <p className="text-xs text-[#A7BAC4] mt-1 leading-relaxed max-w-2xl">
              {activeItem.description[language]}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-xs text-[#A7BAC4] block">Checklist Progress</span>
              <span className="text-sm font-bold font-mono text-[#8CE6E0]">
                {completedInCurrent} / {currentSteps.length} ({progressPercent}%)
              </span>
            </div>
            <button
              onClick={handleReset}
              title="Reset checklist progress"
              className="p-2 text-[#A7BAC4] hover:text-white hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#19B8A5] to-[#8CE6E0] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {currentSteps.map((step, idx) => {
            const stepKey = `${activeItem.id}_step_${idx}`;
            const isDone = Boolean(completedSteps[stepKey]);

            return (
              <div
                key={idx}
                onClick={() => toggleStep(stepKey)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 text-xs ${
                  isDone
                    ? 'bg-[#19B8A5]/10 border-[#19B8A5]/40 text-[#F3F8FA]'
                    : 'bg-white/5 border-white/5 text-[#F3F8FA] hover:bg-white/10 hover:border-white/15'
                }`}
              >
                <button
                  type="button"
                  className={`mt-0.5 shrink-0 ${isDone ? 'text-[#19B8A5]' : 'text-[#A7BAC4]'}`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </button>
                <div className={`flex-1 leading-relaxed ${isDone ? 'line-through text-[#A7BAC4]' : ''}`}>
                  {step}
                </div>
              </div>
            );
          })}
        </div>

        {/* Critical Safety Protocol Box */}
        <div className="p-4 bg-[#FF6268]/10 border border-[#FF6268]/30 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#FF6268]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Emergency Civil Safety Directive:</span>
          </div>
          <p className="text-[#F3F8FA] leading-relaxed">{activeItem.safetyNotice[language]}</p>
        </div>

        {/* Official Reference Link */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#A7BAC4] gap-2">
          <span>Official Framework Guidelines:</span>
          <a
            href={activeItem.officialAuthorityRef.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8CE6E0] hover:underline font-bold flex items-center gap-1"
          >
            <span>{activeItem.officialAuthorityRef.name}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
