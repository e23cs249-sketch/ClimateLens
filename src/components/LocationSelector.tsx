import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';
import { searchLocationsApi, LocationItem } from '../services/api.ts';

interface LocationSelectorProps {
  currentLocation: {
    label: string;
    latitude: number;
    longitude: number;
  };
  onSelectLocation: (loc: { label: string; latitude: number; longitude: number }) => void;
  language: 'en' | 'ta';
}

const PRESET_LOCATIONS = [
  { label: 'Chennai, Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707 },
  { label: 'Delhi, India', latitude: 28.6139, longitude: 77.209 },
  { label: 'Mumbai, Maharashtra, India', latitude: 19.076, longitude: 72.8777 },
  { label: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946 },
  { label: 'London, United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { label: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503 },
  { label: 'New York, USA', latitude: 40.7128, longitude: -74.006 },
];

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentLocation,
  onSelectLocation,
  language,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchLocationsApi(query);
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        onSelectLocation({
          label: `Local Coordinates (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`,
          latitude: lat,
          longitude: lon,
        });
        setIsOpen(false);
      },
      () => {
        setGeoError('Location access was denied or timed out. Please select from presets or type a city.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={isOpen ? query : currentLocation.label}
            onFocus={() => {
              setIsOpen(true);
              setQuery('');
            }}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'ta' ? 'நகரத்தைத் தேடுங்கள்...' : 'Search city or coordinate...'}
            className="w-full pl-9 pr-8 py-2 text-xs text-[#F3F8FA] bg-black/40 border border-white/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#19B8A5] focus:border-[#19B8A5] shadow-xs"
          />
          <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#19B8A5]" />
          {isSearching && (
            <Loader2 className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[#8CE6E0] animate-spin" />
          )}
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          title="Use GPS Geolocation (Only requested on click)"
          className="p-2 bg-black/40 border border-white/15 text-[#A7BAC4] hover:text-[#8CE6E0] hover:bg-white/10 rounded-xl transition-colors shadow-xs"
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>
      </div>

      {geoError && (
        <div className="mt-1 text-[11px] text-[#FFBF69] bg-[#FFBF69]/10 p-2 rounded-lg border border-[#FFBF69]/30">
          {geoError}
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 liquid-glass border border-white/20 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto divide-y divide-white/10">
          {/* Preset shortcuts */}
          <div className="p-3 bg-black/30">
            <div className="text-[10px] font-mono font-bold text-[#A7BAC4] uppercase tracking-wider mb-2 px-1">
              {language === 'ta' ? 'பரிந்துரைக்கப்பட்ட நகரங்கள்' : 'Preset Climate Hubs'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    onSelectLocation(preset);
                    setIsOpen(false);
                  }}
                  className="px-2.5 py-1 text-[11px] bg-white/5 border border-white/10 text-[#F3F8FA] hover:bg-[#19B8A5] hover:text-[#071722] hover:font-bold rounded-lg transition-all whitespace-nowrap"
                >
                  {preset.label.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Search results */}
          {results.length > 0 && (
            <div className="p-1.5">
              <div className="text-[10px] font-mono font-bold text-[#A7BAC4] uppercase tracking-wider mb-1 px-2 pt-1">
                {language === 'ta' ? 'தேடல் முடிவுகள்' : 'Search Results'}
              </div>
              {results.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    onSelectLocation({
                      label: loc.label,
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                    });
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-xs text-[#F3F8FA] hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold truncate">{loc.label}</span>
                  <span className="text-[10px] text-[#8CE6E0] font-mono shrink-0 ml-2">
                    {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && !isSearching && results.length === 0 && (
            <div className="p-4 text-center text-xs text-[#A7BAC4]">
              No location found matching &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
