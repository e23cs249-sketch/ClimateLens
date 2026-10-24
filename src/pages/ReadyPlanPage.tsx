import React, { useState, useEffect } from 'react';
import { ClipboardList, PhoneCall, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { fetchReadyPlanApi, ReadyPlanItem } from '../services/api.ts';
import { ReadyChecklist } from '../components/ReadyChecklist.tsx';

interface ReadyPlanPageProps {
  language: 'en' | 'ta';
}

export const ReadyPlanPage: React.FC<ReadyPlanPageProps> = ({ language }) => {
  const [items, setItems] = useState<ReadyPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReadyPlanApi()
      .then((res) => setItems(res))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const emergencyContacts = [
    { label: 'National Disaster Management Emergency Helpline', number: '1070 / 1077', desc: 'Civil protection & flood rescue' },
    { label: 'Medical Ambulance First Response', number: '108', desc: 'Emergency medical care & heat stroke' },
    { label: 'Unified Emergency Services (India)', number: '112', desc: 'Police, Fire, Ambulance coordination' },
    { label: 'Fire & Rescue Services', number: '101', desc: 'Urban waterlogging & structural collapse' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 liquid-glass rounded-2xl border border-white/10 shadow-xl space-y-2">
        <div className="text-xs font-semibold text-[#19B8A5] uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <ClipboardList className="w-4 h-4 text-[#8CE6E0]" />
          <span>{language === 'ta' ? 'செயல்பாட்டு தயார்நிலை' : 'Practical Preparedness Action'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F8FA]">
          {language === 'ta' ? 'ரெடி பிளான் — பருவநிலை தயார்நிலை வழிகாட்டி' : 'ReadyPlan — Climate Readiness & Emergency Safety Guide'}
        </h1>
        <p className="text-xs text-[#A7BAC4] max-w-3xl leading-relaxed">
          {language === 'ta'
            ? 'அதிக வெப்ப அலை, பலத்த மழை, வீட்டு அவசர தொகுப்பு, மற்றும் நீர் சேமிப்புக்கான நடைமுறை சரிபார்ப்புப் பட்டியல்கள்.'
            : 'Operational household checklists translating complex meteorological indicators into everyday preparedness actions.'}
        </p>
      </div>

      {/* Emergency Contacts Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B2633] to-[#071722] border border-[#19B8A5]/30 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#8CE6E0] uppercase tracking-wider font-mono">
          <PhoneCall className="w-4 h-4 text-[#19B8A5]" />
          <span>Immediate Emergency Helpline Directory</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {emergencyContacts.map((contact, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] text-[#A7BAC4] block leading-tight font-semibold">{contact.label}</span>
              <div className="text-xl font-bold font-mono text-[#F3F8FA]">{contact.number}</div>
              <span className="text-[10px] text-[#8CE6E0] block font-mono">{contact.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#A7BAC4] liquid-glass rounded-2xl border border-white/10">
          Loading ReadyPlan checklists...
        </div>
      ) : (
        <ReadyChecklist items={items} language={language} />
      )}
    </div>
  );
};
