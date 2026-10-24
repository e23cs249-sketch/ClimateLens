import React, { useState, useEffect } from 'react';
import {
  CommunityChallenge,
  fetchChallengesApi,
  recordChallengeEvidenceApi,
} from '../services/api.ts';
import {
  Users,
  Target,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  Sparkles,
  Award,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

interface ChallengesPageProps {
  language: 'en' | 'ta';
}

export const ChallengesPage: React.FC<ChallengesPageProps> = ({ language }) => {
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setIsLoading(true);
    try {
      const data = await fetchChallengesApi();
      setChallenges(data);
    } catch (err) {
      console.warn('Failed to load challenges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEvidence = async (id: string) => {
    setSubmittingId(id);
    try {
      const updated = await recordChallengeEvidenceApi(id);
      setChallenges((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setToastMessage('Community evidence log recorded and progress updated!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit challenge evidence');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="liquid-glass rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#8CE6E0]/20 text-[#8CE6E0] border border-[#8CE6E0]/30 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Community Resilience Module
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#FFBF69]/20 text-[#FFBF69] border border-[#FFBF69]/30 text-[11px] font-mono font-bold">
              DEMONSTRATION MODE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F8FA] tracking-tight">
            Community Climate Challenges
          </h1>

          <p className="text-xs sm:text-sm text-[#A7BAC4] max-w-2xl leading-relaxed">
            {language === 'ta'
              ? 'சமூக காலநிலை சவால்கள்: பள்ளிகள், கல்லூரிகள் மற்றும் குடியிருப்போர் நல சங்கங்களுக்கான கூட்டு சுற்றுச்சூழல் தணிக்கை மற்றும் செயல் திட்டங்கள். பங்கேற்பாளர் புள்ளிவிவரங்கள் சமூக அறிக்கைகளை குறிக்கின்றன; அவை தானியங்கி வானிலை மைய அளவீடுகளிலிருந்து வேறுபட்டவை.'
              : 'Collaborative climate resilience campaigns for schools, universities, and residential welfare associations. Participant and evidence metrics reflect community-reported actions logged in the local ledger, clearly distinguished from automated calibrated meteorological telemetry.'}
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 bg-[#19B8A5]/20 border border-[#19B8A5]/40 text-[#8CE6E0] rounded-xl text-xs flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#19B8A5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="liquid-glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#8CE6E0] uppercase font-bold">
                  {challenge.targetAudience}
                </span>
                <span className="text-[10px] font-mono text-[#A7BAC4]">{challenge.location.split(',')[0]}</span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">
                {challenge.title[language] || challenge.title.en}
              </h3>

              <p className="text-xs text-[#A7BAC4] leading-relaxed">
                {challenge.objective[language] || challenge.objective.en}
              </p>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A7BAC4]">Campaign Progress:</span>
                  <span className="text-[#19B8A5] font-bold">{challenge.progressPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[#19B8A5] to-[#8CE6E0] transition-all duration-500 rounded-full"
                    style={{ width: `${challenge.progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#A7BAC4] block">Participants</span>
                  <span className="text-white font-bold">{challenge.participantCount}</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#A7BAC4] block">Evidence Logs</span>
                  <span className="text-[#8CE6E0] font-bold">{challenge.evidenceCount}</span>
                </div>
              </div>

              <div className="text-[11px] text-[#A7BAC4] space-y-1 pt-2 border-t border-white/5">
                <div>
                  <span className="font-semibold text-white/80">Measurement: </span>
                  {challenge.measurementMethod}
                </div>
                <div>
                  <span className="font-semibold text-white/80">Completion Target: </span>
                  {challenge.completionCriteria}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSubmitEvidence(challenge.id)}
              disabled={submittingId === challenge.id}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#19B8A5]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#19B8A5]" />
              <span>{submittingId === challenge.id ? 'Recording...' : 'Submit Participant Evidence'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
