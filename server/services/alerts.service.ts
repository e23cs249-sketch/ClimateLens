import { ClimateAlert } from '../types/index.ts';

export const OFFICIAL_ALERTS: ClimateAlert[] = [
  {
    id: 'alt-sim-01',
    title: 'High Temperature Advisory (Demonstration Bulletin)',
    sourceName: 'Simulated National Weather Advisory Model',
    sourceCategory: 'official_advisory',
    officialFeedConnected: false,
    severity: 'advisory',
    areaDesc: 'Coastal & Southern Plains Region',
    headline: 'Day temperatures likely to remain 2°C–3°C above seasonal climatological normals.',
    description:
      'Warm and humid conditions expected across coastal metropolitan districts during 11:30 AM to 03:30 PM. Vulnerable populations advised to take thermal mitigation precautions.',
    instruction:
      'Drink sufficient water, carry sun umbrellas, avoid strenuous unshaded manual labor during peak solar irradiance. For binding active emergency advisories, consult the official IMD portal at mausam.imd.gov.in.',
    effectiveTime: new Date(Date.now() - 3600000).toISOString(),
    expiresTime: new Date(Date.now() + 86400000).toISOString(),
    retrievedAt: new Date().toISOString(),
    sourceUrl: 'https://mausam.imd.gov.in',
    isSimulatedDemo: true,
  },
  {
    id: 'alt-sim-02',
    title: 'Isolated Pre-Monsoon Thunderstorm Squall Watch (Demonstration Bulletin)',
    sourceName: 'Simulated Regional Nowcasting Simulation',
    sourceCategory: 'forecast',
    officialFeedConnected: false,
    severity: 'watch',
    areaDesc: 'Inland High-Altitude & Plateau Districts',
    headline: 'Convective cloud formation with gusty winds (35–45 km/h) possible towards late evening.',
    description:
      'Intense surface heating coupled with moisture incursion may trigger localized convective shower cells and cloud-to-ground lightning discharge.',
    instruction:
      'Farmers and commuters are advised to avoid sheltering under isolated tall trees or metal shed structures during lightning strikes.',
    effectiveTime: new Date(Date.now() - 1800000).toISOString(),
    expiresTime: new Date(Date.now() + 43200000).toISOString(),
    retrievedAt: new Date().toISOString(),
    sourceUrl: 'https://mausam.imd.gov.in',
    isSimulatedDemo: true,
  },
];

export function getAlerts() {
  return {
    officialFeedConnected: false,
    notice:
      'Note: Live real-time official government CAP-RSS feeds (e.g. NDMA SACHET / IMD CAP XML) require authenticated institutional credentials. In this hackathon release, ClimateLens displays verified reference guidelines and clearly labeled demonstration advisory structures alongside direct links to live official emergency services.',
    alerts: OFFICIAL_ALERTS,
    officialPortals: [
      {
        name: 'India Meteorological Department (IMD) Mausam',
        url: 'https://mausam.imd.gov.in',
        description: 'Primary national authority for weather forecasts, cyclones, monsoon bulletins and heatwaves in India.',
      },
      {
        name: 'National Disaster Management Authority (NDMA)',
        url: 'https://ndma.gov.in',
        description: 'Apex statutory body for disaster mitigation, early warning dissemination, and civil protection directives.',
      },
      {
        name: 'Central Pollution Control Board (CPCB) Sameer',
        url: 'https://cpcb.nic.in',
        description: 'Real-time air quality index (AQI) monitoring and ambient pollutant bulletin publisher.',
      },
      {
        name: 'WMO Severe Weather Information Centre (SWIC)',
        url: 'https://severeweather.wmo.int',
        description: 'Global authoritative meteorological organization aggregating official national forecasts worldwide.',
      },
    ],
  };
}
