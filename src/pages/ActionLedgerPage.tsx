import React, { useState, useEffect } from 'react';
import {
  ClimateAction,
  ActionStatus,
  fetchActionsApi,
  updateActionStatusApi,
  sealActionReceiptApi,
} from '../services/api.ts';
import {
  CheckCircle2,
  Clock,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Droplets,
  CloudRain,
  Zap,
  Trash2,
  Trees,
  Users,
  Download,
  Copy,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface ActionLedgerPageProps {
  language: 'en' | 'ta';
}

const CATEGORY_ICONS: Record<string, any> = {
  heat_preparedness: Flame,
  water_conservation: Droplets,
  rainfall_preparedness: CloudRain,
  energy_efficiency: Zap,
  waste_reduction: Trash2,
  tree_shade: Trees,
  community_awareness: Users,
};

export const ActionLedgerPage: React.FC<ActionLedgerPageProps> = ({ language }) => {
  const [actions, setActions] = useState<ClimateAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [sealingActionId, setSealingActionId] = useState<string | null>(null);

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchActionsApi();
      setActions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load climate actions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ActionStatus) => {
    try {
      const updated = await updateActionStatusApi(id, newStatus);
      setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err: any) {
      alert(err.message || 'Failed to update action status');
    }
  };

  const handleSealReceipt = async (id: string) => {
    setSealingActionId(id);
    try {
      const updated = await sealActionReceiptApi(id);
      setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setSelectedReceipt(updated.cryptographicReceipt);
    } catch (err: any) {
      alert(err.message || 'Failed to seal cryptographic action receipt');
    } finally {
      setSealingActionId(null);
    }
  };

  const filteredActions = actions.filter((action) => {
    if (filterCategory !== 'all' && action.category !== filterCategory) return false;
    if (filterStatus !== 'all' && action.status !== filterStatus) return false;
    return true;
  });

  const plannedCount = actions.filter((a) => a.status === 'planned').length;
  const inProgressCount = actions.filter((a) => a.status === 'in_progress').length;
  const completedCount = actions.filter((a) => a.status === 'completed').length;
  const receiptCount = actions.filter((a) => !!a.cryptographicReceipt).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="liquid-glass rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#19B8A5]/20 text-[#8CE6E0] border border-[#19B8A5]/30 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Unique Feature
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[#A7BAC4] border border-white/10 text-[11px] font-mono">
              Evidence-Linked Ledger
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F8FA] tracking-tight">
            Climate Action Impact Ledger
          </h1>

          <p className="text-xs sm:text-sm text-[#A7BAC4] max-w-2xl leading-relaxed">
            {language === 'ta'
              ? 'காலநிலை செயல் தாக்க லெட்ஜர்: சுற்றுச்சூழல் தரவு அடிப்படையில் நடைமுறை சமூக செயல்பாடுகளை இணைக்கும் அமைப்பு. ஒவ்வொரு நடவடிக்கைக்கும் கிரிப்டோகிராஃபிக் ரசீது உருவாக்க முடியும்.'
              : 'Turning verified atmospheric evidence into practical, trackable community interventions. Each action is directly tied to observed telemetry and sealed with an immutable SHA-256 evidence receipt.'}
          </p>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/10 text-xs font-mono">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[#A7BAC4] block text-[10px] uppercase">Planned Actions</span>
            <span className="text-2xl font-extrabold text-white">{plannedCount}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[#FFBF69] block text-[10px] uppercase">In Progress</span>
            <span className="text-2xl font-extrabold text-[#FFBF69]">{inProgressCount}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[#19B8A5] block text-[10px] uppercase">Completed Actions</span>
            <span className="text-2xl font-extrabold text-[#19B8A5]">{completedCount}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[#8CE6E0] block text-[10px] uppercase">Cryptographic Receipts</span>
            <span className="text-2xl font-extrabold text-[#8CE6E0]">{receiptCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 liquid-glass rounded-xl border border-white/10 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-[#19B8A5]" />
          <span className="text-white font-bold">Category:</span>
          {['all', 'heat_preparedness', 'energy_efficiency', 'rainfall_preparedness', 'tree_shade'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all ${
                filterCategory === cat
                  ? 'bg-[#19B8A5] text-[#071722] font-bold'
                  : 'bg-white/5 text-[#A7BAC4] hover:text-white hover:bg-white/10'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white font-bold">Status:</span>
          {['all', 'planned', 'in_progress', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase transition-all ${
                filterStatus === st
                  ? 'bg-white text-[#071722] font-bold'
                  : 'bg-white/5 text-[#A7BAC4] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Action Cards List */}
      <div className="space-y-4">
        {filteredActions.map((action) => {
          const Icon = CATEGORY_ICONS[action.category] || ShieldCheck;
          return (
            <div
              key={action.id}
              className="liquid-glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#19B8A5]/20 text-[#8CE6E0]">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#8CE6E0] uppercase font-bold">
                      {action.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#A7BAC4]">
                      {action.locationContext}
                    </span>
                    {action.status === 'completed' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#19B8A5]/20 text-[#8CE6E0] border border-[#19B8A5]/30">
                        User-Reported Completion
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {action.title[language] || action.title.en}
                  </h3>

                  <p className="text-xs text-[#A7BAC4] leading-relaxed">
                    {action.whyItMatters[language] || action.whyItMatters.en}
                  </p>
                </div>

                {/* Status Switcher & Receipt Button */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 text-xs font-mono">
                    {(['planned', 'in_progress', 'completed'] as ActionStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(action.id, status)}
                        className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                          action.status === status
                            ? status === 'completed'
                              ? 'bg-[#19B8A5] text-[#071722] font-bold'
                              : status === 'in_progress'
                              ? 'bg-[#FFBF69] text-[#071722] font-bold'
                              : 'bg-white/20 text-white font-bold'
                            : 'text-[#A7BAC4] hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {action.status === 'completed' && !action.cryptographicReceipt && (
                    <button
                      onClick={() => handleSealReceipt(action.id)}
                      disabled={sealingActionId === action.id}
                      className="px-3 py-1.5 text-xs font-bold text-[#071722] bg-[#8CE6E0] hover:bg-[#78cfc9] rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(140,230,224,0.3)]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{sealingActionId === action.id ? 'Sealing...' : 'Seal Action Receipt'}</span>
                    </button>
                  )}

                  {action.cryptographicReceipt && (
                    <button
                      onClick={() => setSelectedReceipt(action.cryptographicReceipt)}
                      className="px-3 py-1.5 text-xs font-mono font-bold text-[#19B8A5] bg-[#19B8A5]/10 hover:bg-[#19B8A5]/20 border border-[#19B8A5]/30 rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Receipt Sealed (SHA-256)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Supporting Evidence Strip */}
              <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#A7BAC4] block text-[10px] font-mono uppercase">Supporting Evidence Basis</span>
                  <span className="text-white font-semibold">{action.evidenceBasis.metric}: </span>
                  <span className="text-[#8CE6E0] font-mono">{action.evidenceBasis.observedValue}</span>
                </div>
                <div>
                  <span className="text-[#A7BAC4] block text-[10px] font-mono uppercase">Beneficiary & Timeframe</span>
                  <span className="text-white">{action.intendedBeneficiary}</span>
                  <span className="text-[#A7BAC4] block text-[10px] font-mono">({action.timeframe})</span>
                </div>
                <div>
                  <span className="text-[#A7BAC4] block text-[10px] font-mono uppercase">Metric for Progress</span>
                  <span className="text-[#A7BAC4]">{action.metricForProgress}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cryptographic Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl liquid-glass rounded-2xl p-6 sm:p-8 border border-[#19B8A5]/30 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#19B8A5]" />
                <h3 className="text-base font-bold text-white">Cryptographic Action Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-[#A7BAC4] hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[#A7BAC4] text-[10px] uppercase block">Action Title:</span>
                <span className="text-white font-bold">{selectedReceipt.actionTitle}</span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[#A7BAC4] text-[10px] uppercase block">Receipt SHA-256 Digest:</span>
                <span className="text-[#8CE6E0] select-all break-all font-bold block">{selectedReceipt.receiptSha256}</span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[#A7BAC4] text-[10px] uppercase block">Canonical Receipt Payload (RFC 8785):</span>
                <div className="text-[#A7BAC4] text-[10px] break-all max-h-32 overflow-y-auto p-2 bg-black/60 rounded">
                  {selectedReceipt.canonicalReceiptPayload}
                </div>
              </div>

              <div className="p-3 bg-[#19B8A5]/10 rounded-xl border border-[#19B8A5]/20 text-[11px] text-[#A7BAC4] leading-relaxed">
                <span className="font-bold text-[#19B8A5] block">Transparency Guarantee:</span>
                {selectedReceipt.disclaimer}
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 bg-[#19B8A5] text-[#071722] font-bold text-xs rounded-xl hover:bg-[#159a8a] transition-all"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
