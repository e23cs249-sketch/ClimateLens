import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, ExternalLink, Info, CheckCircle2, Radio } from 'lucide-react';
import { fetchAlertsApi } from '../services/api.ts';

interface AlertsPageProps {
  language: 'en' | 'ta';
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ language }) => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlertsApi()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#DDE5DE] rounded-xl p-6 shadow-xs space-y-2">
        <div className="text-xs font-semibold text-[#A96612] uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#A96612]" />
          <span>{language === 'ta' ? 'அதிகாரப்பூர்வ எச்சரிக்கைகள் & தகவல்கள்' : 'Information & Alerts Centre'}</span>
        </div>
        <h1 className="text-2xl font-bold text-[#172923]">
          {language === 'ta' ? 'அரசு வானிலை ஆலோசனைகள் & வழிகாட்டுதல்கள்' : 'Civil Protection & Severe Weather Bulletins'}
        </h1>
        <p className="text-xs text-[#697871] max-w-3xl leading-relaxed">
          {language === 'ta'
            ? 'அதிகாரப்பூர்வ வானிலை மையங்கள் மற்றும் பேரிடர் மேலாண்மை அமைப்புகளின் நேரடி வழிகாட்டல்கள். எந்தவொரு சூழ்நிலையிலும் அரசின் அவசர உத்தரவுகளுக்கு முன்னுரிமை அளியுங்கள்.'
            : 'Authoritative bulletins, advisory status tracking, and direct gateways to official civil protection authorities.'}
        </p>
      </div>

      {/* Transparent Feed Status Notice Banner */}
      <div className="p-4 bg-[#FFF3D9] border border-[#F0D59D] rounded-xl text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-[#A96612]">
          <Radio className="w-4 h-4" />
          <span>Integration &amp; Feed Transparency Notice</span>
        </div>
        <p className="text-[#172923] leading-relaxed">
          {data?.notice ||
            'Direct live-stream Common Alerting Protocol (CAP) interfaces from statutory government agencies require authenticated institutional access keys. In this hackathon build, ClimateLens provides verified reference guidelines and clearly labeled demonstration advisory structures alongside direct hyperlinks to live government gateways.'}
        </p>
      </div>

      {/* Primary National Authorities Grid */}
      <div className="bg-white border border-[#DDE5DE] rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[#172923]">
          Official Statutory Meteorological &amp; Civil Protection Portals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.officialPortals?.map((portal: any) => (
            <div
              key={portal.name}
              className="p-4 bg-[#F9FBFA] border border-[#DDE5DE] rounded-xl space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-[#172923]">{portal.name}</h3>
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2D8173] hover:text-[#123D32] flex items-center gap-1 text-xs font-semibold"
                  >
                    <span>Visit Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-[#697871] mt-1 leading-relaxed">{portal.description}</p>
              </div>
              <div className="text-[10px] text-[#24724E] font-medium pt-2 border-t border-[#E8EEEA] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Statutory Authority Reference Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advisory Bulletins (Clearly labeled simulated bulletins for demonstration) */}
      <div className="bg-white border border-[#DDE5DE] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDE5DE] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#172923]">
              Sample Advisory Bulletins (Testing &amp; Demonstration Exercises)
            </h3>
            <p className="text-xs text-[#697871] mt-0.5">
              Prominently labeled simulated payloads illustrating the structured evidence format.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase bg-[#FFF3D9] text-[#A96612] px-2 py-0.5 rounded font-semibold border border-[#F0D59D]">
            Simulated Content
          </span>
        </div>

        <div className="space-y-4">
          {data?.alerts?.map((alert: any) => (
            <div
              key={alert.id}
              className="p-4 bg-[#F9FBFA] border border-[#DDE5DE] rounded-xl space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8EEEA] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#172923]">{alert.title}</span>
                  <span className="text-[10px] font-mono text-[#A96612] bg-[#FFF3D9] px-1.5 py-0.5 rounded">
                    Demonstration
                  </span>
                </div>
                <span className="text-[11px] text-[#697871] font-mono">
                  Effective: {new Date(alert.effectiveTime).toLocaleDateString()}
                </span>
              </div>

              <div className="text-xs text-[#172923] space-y-2">
                <p className="font-semibold">{alert.headline}</p>
                <p className="text-[#697871] leading-relaxed">{alert.description}</p>
              </div>

              <div className="p-3 bg-white border border-[#DDE5DE] rounded-lg text-xs space-y-1">
                <span className="font-bold text-[#123D32] block">Recommended Action Directive:</span>
                <p className="text-[#172923] leading-relaxed">{alert.instruction}</p>
              </div>

              <div className="pt-1 text-[11px] text-[#697871] flex flex-wrap items-center justify-between gap-2 font-mono">
                <span>Coverage: {alert.areaDesc}</span>
                <span>Source: {alert.sourceName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
