/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Topbar } from './components/Topbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { OverviewPage } from './pages/OverviewPage.tsx';
import { MyAreaPage } from './pages/MyAreaPage.tsx';
import { TwinPage } from './pages/TwinPage.tsx';
import { TamperLabPage } from './pages/TamperLabPage.tsx';
import { ActionLedgerPage } from './pages/ActionLedgerPage.tsx';
import { ChallengesPage } from './pages/ChallengesPage.tsx';
import { ClimateMap } from './components/ClimateMap.tsx';
import { EvidencePage } from './pages/EvidencePage.tsx';
import { VerifyPage } from './pages/VerifyPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { ReadyPlanPage } from './pages/ReadyPlanPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import {
  WeatherData,
  EvidenceSnapshot,
  fetchWeather,
  fetchEvidenceSnapshots,
  captureEvidenceSnapshot,
} from './services/api.ts';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [location, setLocation] = useState({
    label: 'Chennai, Tamil Nadu, India',
    latitude: 13.0827,
    longitude: 80.2707,
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [evidenceSnapshots, setEvidenceSnapshots] = useState<EvidenceSnapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | undefined>(undefined);
  const [isSealing, setIsSealing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Hash router sync
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
      if (['overview', 'myarea', 'twin', 'tamper', 'actions', 'challenges', 'map', 'evidence', 'verify', 'history', 'readyplan', 'about'].includes(hash)) {
        setCurrentTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (tab: string, snapshotId?: string) => {
    setCurrentTab(tab);
    window.location.hash = `#/${tab}`;
    if (snapshotId) {
      setSelectedSnapshotId(snapshotId);
    }
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch weather for selected location
  const loadWeather = async (loc = location) => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    try {
      const data = await fetchWeather(loc.latitude, loc.longitude, loc.label);
      setWeather(data);
    } catch (err: any) {
      setWeatherError(err.message || 'Unable to retrieve meteorological data.');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Fetch evidence snapshots list
  const loadEvidenceSnapshots = async () => {
    try {
      const data = await fetchEvidenceSnapshots();
      setEvidenceSnapshots(data);
      if (!selectedSnapshotId && data.length > 0) {
        setSelectedSnapshotId(data[0].id);
      }
    } catch (err) {
      console.warn('Could not load evidence records:', err);
    }
  };

  useEffect(() => {
    loadWeather(location);
    loadEvidenceSnapshots();
  }, [location.latitude, location.longitude]);

  // Seal current weather as an immutable evidence record
  const handleSealEvidence = async () => {
    if (!weather) return;
    setIsSealing(true);
    try {
      const snapshot = await captureEvidenceSnapshot(weather);
      setEvidenceSnapshots((prev) => [snapshot, ...prev]);
      setSelectedSnapshotId(snapshot.id);
      showToast(
        language === 'ta'
          ? `சான்று சீல் செய்யப்பட்டது! SHA-256: ${snapshot.contentHash.substring(0, 12)}...`
          : `Evidence sealed! SHA-256 digest: ${snapshot.contentHash.substring(0, 12)}...`
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to seal evidence', 'info');
    } finally {
      setIsSealing(false);
    }
  };

  const handleSelectLocation = (newLoc: { label: string; latitude: number; longitude: number }) => {
    setLocation(newLoc);
  };

  return (
    <div className="min-h-screen bg-[#071722] text-[#F3F8FA] flex flex-col font-sans selection:bg-[#19B8A5] selection:text-[#071722]">
      {/* Top Bar with Brand, Breadcrumb, and Quick Actions (No duplicate nav links) */}
      <Topbar
        currentTab={currentTab}
        onNavigate={navigateTo}
        language={language}
        onToggleLanguage={setLanguage}
        onRefresh={() => loadWeather(location)}
        isRefreshing={isLoadingWeather}
        onSealEvidence={handleSealEvidence}
        isSealing={isSealing}
        currentLocationLabel={location.label}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 liquid-glass text-[#F3F8FA] px-5 py-3.5 rounded-2xl shadow-2xl border border-[#19B8A5]/40 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-[#19B8A5]" />
          <span className="font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full">
        {/* Single Authoritative Navigation Sidebar (Desktop persistent + Mobile off-canvas drawer) */}
        <Sidebar
          currentTab={currentTab}
          onNavigate={navigateTo}
          language={language}
          evidenceCount={evidenceSnapshots.length}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'overview' && (
            <OverviewPage
              weather={weather}
              isLoading={isLoadingWeather}
              error={weatherError}
              onSelectLocation={handleSelectLocation}
              onSealEvidence={handleSealEvidence}
              isSealing={isSealing}
              evidenceSnapshots={evidenceSnapshots}
              onNavigate={navigateTo}
              language={language}
            />
          )}

          {currentTab === 'myarea' && (
            <MyAreaPage
              weather={weather}
              isLoading={isLoadingWeather}
              error={weatherError}
              onSelectLocation={handleSelectLocation}
              onSealEvidence={handleSealEvidence}
              isSealing={isSealing}
              onNavigateToSafety={() => navigateTo('readyplan')}
              onNavigateToVerify={(id) => navigateTo('verify', id)}
              language={language}
            />
          )}

          {currentTab === 'twin' && (
            <TwinPage
              weather={weather}
              onNavigateToTamper={(id) => navigateTo('tamper', id)}
              onNavigateToVerify={(id) => navigateTo('verify', id)}
              onNavigateToActions={() => navigateTo('actions')}
              language={language}
            />
          )}

          {currentTab === 'tamper' && (
            <TamperLabPage
              snapshots={evidenceSnapshots}
              initialSnapshotId={selectedSnapshotId}
              language={language}
            />
          )}

          {currentTab === 'actions' && (
            <ActionLedgerPage
              language={language}
            />
          )}

          {currentTab === 'challenges' && (
            <ChallengesPage
              language={language}
            />
          )}

          {currentTab === 'map' && (
            <ClimateMap
              weather={weather}
              onSelectLocation={(loc) => {
                handleSelectLocation(loc);
                navigateTo('myarea');
              }}
              onNavigateToMyArea={() => navigateTo('myarea')}
              language={language}
            />
          )}

          {currentTab === 'evidence' && (
            <EvidencePage
              snapshots={evidenceSnapshots}
              onVerify={(id) => navigateTo('verify', id)}
              language={language}
            />
          )}

          {currentTab === 'verify' && (
            <VerifyPage
              snapshots={evidenceSnapshots}
              selectedSnapshotId={selectedSnapshotId}
              onSelectSnapshot={setSelectedSnapshotId}
              language={language}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              onSelectSnapshot={(id) => navigateTo('verify', id)}
              language={language}
            />
          )}

          {currentTab === 'readyplan' && <ReadyPlanPage language={language} />}

          {currentTab === 'about' && <AboutPage language={language} />}
        </main>
      </div>
    </div>
  );
}
