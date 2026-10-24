import React from 'react';
import { Layers, Thermometer, Wind, Droplets, Gauge, Sun, ShieldCheck, Activity, Info } from 'lucide-react';
import { WeatherData } from '../services/api.ts';
import { LocationSelector } from '../components/LocationSelector.tsx';

interface ExplorerPageProps {
  weather: WeatherData | null;
  onSelectLocation: (loc: { label: string; latitude: number; longitude: number }) => void;
  onSealEvidence: () => void;
  isSealing: boolean;
  language: 'en' | 'ta';
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({
  weather,
  onSelectLocation,
  onSealEvidence,
  isSealing,
  language,
}) => {
  if (!weather) return null;

  const rawParameters = [
    {
      name: 'Ambient Surface Temperature (2m)',
      value: `${weather.values.temperature.toFixed(2)} ${weather.units.temperature}`,
      description: 'Standard meteorological dry-bulb air temperature measured 2 meters above ground level.',
      category: 'Thermal State',
    },
    {
      name: 'Apparent Heat Index (Thermal Comfort)',
      value: `${weather.values.apparentTemperature.toFixed(2)} ${weather.units.apparentTemperature}`,
      description: 'Perceived equivalent temperature combining ambient dry heat, solar radiation, and relative humidity.',
      category: 'Biometeorology',
    },
    {
      name: 'Relative Atmospheric Humidity',
      value: `${weather.values.relativeHumidity} ${weather.units.relativeHumidity}`,
      description: 'Ratio of the partial pressure of water vapor to the equilibrium vapor pressure at ambient temperature.',
      category: 'Moisture',
    },
    {
      name: 'Precipitation Water Column Rate',
      value: `${weather.values.precipitation.toFixed(2)} ${weather.units.precipitation}`,
      description: 'Accumulated depth of liquid water precipitation deposited on horizontal surface.',
      category: 'Hydrology',
    },
    {
      name: 'Wind Velocity Vector (10m AGL)',
      value: `${weather.values.windSpeed.toFixed(2)} ${weather.units.windSpeed}`,
      description: 'Horizontal wind speed calculated at 10 meters above ground level without micro-obstructions.',
      category: 'Kinematics',
    },
    {
      name: 'Barometric Surface Air Pressure',
      value: `${weather.values.surfacePressure ? weather.values.surfacePressure.toFixed(1) : '--'} hPa`,
      description: 'Static atmospheric pressure exerted by the weight of the air column above the local elevation.',
      category: 'Barometry',
    },
    {
      name: 'WMO Weather Synoptic Code',
      value: `Code ${weather.values.weatherCode} (${weather.values.weatherDescription})`,
      description: 'Standard World Meteorological Organization synoptic present weather classification code.',
      category: 'Synoptic Observation',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#DDE5DE] rounded-xl p-5 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-[#2D8173] uppercase tracking-wider">
            {language === 'ta' ? 'ஆழமான வளிமண்டல அளவீடுகள்' : 'Atmospheric Science Explorer'}
          </div>
          <h1 className="text-2xl font-bold text-[#172923] mt-0.5">
            {language === 'ta' ? 'வானிலை மாதிரி & அளவீட்டு தணிக்கை' : 'Atmospheric Telemetry & Model Grid Audit'}
          </h1>
          <p className="text-xs text-[#697871] mt-1">
            Raw observational and numerical weather prediction (NWP) parameters with physical SI units.
          </p>
        </div>

        <LocationSelector
          currentLocation={weather.location}
          onSelectLocation={onSelectLocation}
          language={language}
        />
      </div>

      {/* Raw Atmospheric Parameters Table */}
      <div className="bg-white border border-[#DDE5DE] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE5DE] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#172923]">
              Physical atmospheric parameters for {weather.location.label}
            </h2>
            <div className="text-xs text-[#697871] font-mono mt-0.5">
              Lat: {weather.location.latitude.toFixed(4)}° · Lon: {weather.location.longitude.toFixed(4)}° · Grid: 0.1° Resolution
            </div>
          </div>

          <button
            onClick={onSealEvidence}
            disabled={isSealing}
            className="px-3.5 py-2 bg-[#123D32] hover:bg-[#0B2822] text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Seal as Evidence Record</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DDE5DE] text-[#697871] font-semibold">
                <th className="py-2.5 px-3">Atmospheric Metric</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Standard Value &amp; SI Unit</th>
                <th className="py-2.5 px-3">Scientific Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F1]">
              {rawParameters.map((param, idx) => (
                <tr key={idx} className="hover:bg-[#F9FBFA] transition-colors">
                  <td className="py-3 px-3 font-semibold text-[#172923]">{param.name}</td>
                  <td className="py-3 px-3 text-[#2D8173] font-medium">{param.category}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#172923] whitespace-nowrap tabular-nums">
                    {param.value}
                  </td>
                  <td className="py-3 px-3 text-[#697871] leading-relaxed max-w-md">{param.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Grid Methodology */}
      <div className="bg-[#F5F7F3] border border-[#DDE5DE] rounded-xl p-5 text-xs text-[#697871] space-y-2">
        <div className="flex items-center gap-2 font-bold text-[#123D32]">
          <Info className="w-4 h-4" />
          <span>Meteorological Grid Interpolation &amp; Quality Notice</span>
        </div>
        <p className="leading-relaxed">
          The values presented above are interpolated from the Open-Meteo Multi-Model Ensemble combining ECMWF Integrated Forecasting System (IFS), Deutscher Wetterdienst ICON, and NOAA GFS at 0.1 degree spatial resolution. These represent macro-scale atmospheric grid state and do not capture microclimatic phenomena such as street-level thermal reflection or localized basement dampness.
        </p>
      </div>
    </div>
  );
};
