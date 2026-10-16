/**
 * Zanzibar SkyLab — Interactive Digital Planetarium and Astronomy Learning Platform
 * @license Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/layout/Header';
import { SkyCanvas } from './components/sky/SkyCanvas';
import { ObjectInspector } from './components/sky/ObjectInspector';
import { TimeControls } from './components/controls/TimeControls';
import { ObservationPlanner } from './components/observation/ObservationPlanner';
import { MoonExplorer } from './components/moon/MoonExplorer';
import { ObjectExplorer } from './components/objects/ObjectExplorer';
import { TimeLab } from './components/timelab/TimeLab';
import { ScientificInfoModal } from './components/layout/ScientificInfoModal';
import { AboutModal } from './components/layout/AboutModal';
import { SettingsModal } from './components/layout/SettingsModal';
import { CompetitionDemo } from './components/demo/CompetitionDemo';

import { DEFAULT_OBSERVER } from './data/locations';
import { ObserverLocation, CalculatedBody } from './data/types';
import { computeSkyState, buildObservationPlan } from './astronomy/engine';
import { Sparkles, Telescope, Compass, BookOpen, Moon, ArrowRight, ShieldCheck } from 'lucide-react';

export default function App() {
  // Navigation & View state - 5 Professional Observatory Modules
  const [activeTab, setActiveTab] = useState<'sky' | 'planner' | 'objects' | 'timelab' | 'moon'>('sky');

  // Simulation Time & Speed
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeSpeed, setTimeSpeed] = useState<number>(60); // Default 60x (1 min / second)

  // Observer Location
  const [observer, setObserver] = useState<ObserverLocation>(DEFAULT_OBSERVER);

  // Inspector & Selection
  const [selectedObject, setSelectedObject] = useState<CalculatedBody | null>(null);

  // Modals
  const [isScientificInfoOpen, setIsScientificInfoOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);

  // Appearance & Localization
  const [nightMode, setNightMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');

  // Hero banner dismissal in Sky view
  const [dismissHero, setDismissHero] = useState<boolean>(false);

  // High-performance time simulation tick
  const lastTickTimeRef = useRef<number>(performance.now());
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (isPlaying) {
        const deltaMs = now - lastTickTimeRef.current;
        if (deltaMs > 30) {
          // Advance simulation time: deltaMs * timeSpeed
          const simDeltaMs = deltaMs * timeSpeed;
          setCurrentDate(prev => new Date(prev.getTime() + simDeltaMs));
          lastTickTimeRef.current = now;
        }
      } else {
        lastTickTimeRef.current = now;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, timeSpeed]);

  // Compute live sky state using astronomy-engine
  const skyState = useMemo(() => {
    return computeSkyState(currentDate, observer);
  }, [currentDate, observer]);

  // Compute observation targets
  const observationTargets = useMemo(() => {
    return buildObservationPlan(skyState);
  }, [skyState]);

  // Pre-select Betelgeuse or Sirius for competition demo
  const sampleStar = useMemo(() => {
    return skyState.stars.find(s => s.id === 'HR 2061') || skyState.stars[0] || null;
  }, [skyState.stars]);

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden ${nightMode ? 'bg-[#0d0000]' : 'bg-[#060913]'}`}>
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        observer={observer}
        currentDate={currentDate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenScientificInfo={() => setIsScientificInfoOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onStartDemo={() => setIsDemoOpen(true)}
        nightMode={nightMode}
        language={language}
      />

      {/* Main Viewport */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* MODULE A: LIVE SKY EXPLORER */}
        {activeTab === 'sky' && (
          <div className="w-full h-full relative flex flex-col">
            {/* Top Introductory Banner for First-Time Viewers */}
            {!dismissHero && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-xl w-[92%] p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 shadow-2xl text-slate-100 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-cyan-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Zanzibar SkyLab · Digital Observatory</span>
                  </div>
                  <h1 className="text-sm font-bold text-white">
                    {language === 'sw'
                      ? 'Anga la Moja kwa Moja kutoka Mji Mkongwe, Zanzibar'
                      : 'Explore the Universe from Stone Town, Zanzibar'}
                  </h1>
                  <p className="text-[11px] text-slate-400">
                    {language === 'sw'
                      ? 'Hesabu halisi za kinyota (VSOP87 & ELP2000-82B). Bofya kitu chochote kuona vipimo.'
                      : 'Live mathematical projection of the equatorial night sky. Click any star or planet to inspect.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsDemoOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {language === 'sw' ? 'Onyesho' : 'Quick Demo'}
                  </button>
                  <button
                    onClick={() => setDismissHero(true)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {language === 'sw' ? 'Funga' : 'Dismiss'}
                  </button>
                </div>
              </div>
            )}

            {/* Interactive HTML Canvas Sky Map */}
            <div className="flex-1 w-full h-full relative">
              <SkyCanvas
                sun={skyState.sun}
                moon={skyState.moon}
                planets={skyState.planets}
                stars={skyState.stars}
                selectedObject={selectedObject}
                onSelectObject={setSelectedObject}
                nightMode={nightMode}
                language={language}
              />

              {/* Selected Object Inspector */}
              <ObjectInspector
                object={selectedObject}
                onClose={() => setSelectedObject(null)}
                language={language}
              />
            </div>

            {/* Bottom Time Travel Controls */}
            <TimeControls
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(p => !p)}
              timeSpeed={timeSpeed}
              onChangeSpeed={setTimeSpeed}
              language={language}
            />
          </div>
        )}

        {/* MODULE B: OBSERVATION PLANNER */}
        {activeTab === 'planner' && (
          <div className="w-full h-full overflow-y-auto p-4 md:p-8">
            <ObservationPlanner
              targets={observationTargets}
              twilight={skyState.twilight}
              observer={observer}
              currentDate={currentDate}
              onSelectDate={setCurrentDate}
              onChangeObserver={setObserver}
              language={language}
            />
          </div>
        )}

        {/* MODULE C: CELESTIAL OBJECT DIRECTORY & EPHEMERIDES */}
        {activeTab === 'objects' && (
          <div className="w-full h-full overflow-y-auto p-4 md:p-8">
            <ObjectExplorer
              sun={skyState.sun}
              moon={skyState.moon}
              planets={skyState.planets}
              stars={skyState.stars}
              onLocateInSky={obj => {
                setSelectedObject(obj);
                setActiveTab('sky');
              }}
              language={language}
            />
          </div>
        )}

        {/* MODULE D: ASTRONOMICAL TIME LAB */}
        {activeTab === 'timelab' && (
          <div className="w-full h-full overflow-y-auto p-4 md:p-8">
            <TimeLab
              skyState={skyState}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(p => !p)}
              timeSpeed={timeSpeed}
              onChangeSpeed={setTimeSpeed}
              language={language}
            />
          </div>
        )}

        {/* MODULE E: LUNAR MECHANICS & HILAL OBSERVATORY */}
        {activeTab === 'moon' && (
          <div className="w-full h-full overflow-y-auto p-4 md:p-8">
            <MoonExplorer
              moon={skyState.moon}
              twilight={skyState.twilight}
              language={language}
            />
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <ScientificInfoModal
        isOpen={isScientificInfoOpen}
        onClose={() => setIsScientificInfoOpen(false)}
        skyState={skyState}
        language={language}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        observer={observer}
        onChangeObserver={setObserver}
        nightMode={nightMode}
        onToggleNightMode={() => setNightMode(m => !m)}
        language={language}
        onChangeLanguage={setLanguage}
      />

      <CompetitionDemo
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onNavigateView={setActiveTab}
        onSelectObject={setSelectedObject}
        sampleStar={sampleStar}
        onTriggerTimeSpeed={speed => {
          setTimeSpeed(speed);
          setIsPlaying(true);
        }}
        language={language}
      />
    </div>
  );
}
