import React from 'react';
import { Telescope, Compass, Settings, Sparkles, Calendar, Moon } from 'lucide-react';
import { ObserverLocation } from '../../data/types';

interface HeaderProps {
  activeTab: 'sky' | 'planner' | 'objects' | 'timelab' | 'moon';
  onSelectTab: (tab: 'sky' | 'planner' | 'objects' | 'timelab' | 'moon') => void;
  observer: ObserverLocation;
  currentDate: Date;
  onOpenSettings: () => void;
  onOpenScientificInfo: () => void;
  onOpenAbout: () => void;
  onStartDemo: () => void;
  nightMode: boolean;
  language: 'en' | 'sw';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  observer,
  currentDate,
  onOpenSettings,
  onOpenScientificInfo,
  onOpenAbout,
  onStartDemo,
  nightMode,
  language
}) => {
  const isSw = language === 'sw';

  return (
    <header className="w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shrink-0 z-30">
      {/* 3-Zone Top Navigation Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Title with Custom Zanzibar SkyLab Icon */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-500 p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <ellipse cx="12" cy="12" rx="9" ry="4" stroke="currentColor" strokeDasharray="2 2" transform="rotate(-25 12 12)" />
                <path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('sky')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-base font-extrabold tracking-tight text-white block group-hover:text-cyan-400 transition-colors whitespace-nowrap">
              Zanzibar SkyLab
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-Line Text with Subtle Hover Underlines) */}
        <nav className="flex items-center gap-3 lg:gap-6 text-xs font-semibold uppercase tracking-wider overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => onSelectTab('sky')}
            className={`py-1 transition-all whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'sky'
                ? 'text-cyan-400 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-100 border-transparent'
            }`}
          >
            {isSw ? 'Anga Halisi' : 'Explore Sky'}
          </button>

          <button
            onClick={() => onSelectTab('planner')}
            className={`py-1 transition-all whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'planner'
                ? 'text-cyan-400 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-100 border-transparent'
            }`}
          >
            {isSw ? 'Mpangilio wa Usiku' : 'Planner'}
          </button>

          <button
            onClick={() => onSelectTab('objects')}
            className={`py-1 transition-all whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'objects'
                ? 'text-cyan-400 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-100 border-transparent'
            }`}
          >
            {isSw ? 'Katalogi ya Miili' : 'Directory'}
          </button>

          <button
            onClick={() => onSelectTab('timelab')}
            className={`py-1 transition-all whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'timelab'
                ? 'text-cyan-400 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-100 border-transparent'
            }`}
          >
            {isSw ? 'Maabara ya Wakati' : 'Time Lab'}
          </button>

          <button
            onClick={() => onSelectTab('moon')}
            className={`py-1 transition-all whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'moon'
                ? 'text-cyan-400 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-100 border-transparent'
            }`}
          >
            {isSw ? 'Mwezi na Hilali' : 'Moon & Hilal'}
          </button>

          <button
            onClick={onOpenAbout}
            className="py-1 text-slate-400 hover:text-slate-100 border-b-2 border-transparent transition-all whitespace-nowrap shrink-0"
          >
            {isSw ? 'Kuhusu' : 'About'}
          </button>
        </nav>

        {/* Zone 3: Primary Action (Competition Demo & Settings) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onStartDemo}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
            title="Launch 3-Minute Presenter Walkthrough"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSw ? 'Onyesho la Mashindano' : 'Competition Demo'}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors shrink-0"
            title="Observatory Location & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subheader Scientific Ribbon (Telemetry & Vantage Point) */}
      <div className="bg-slate-900/60 border-t border-slate-850 px-4 sm:px-6 py-1.5 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200">{observer.name}</span>
            <span>({observer.latitude.toFixed(2)}° S, {observer.longitude.toFixed(2)}° E)</span>
          </button>
          <span>·</span>
          <span>EAT (UTC+03:00)</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScientificInfo}
            className="text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-cyan-500/30"
          >
            {isSw ? 'Hesabu za Kisayansi (Engine Info)' : 'Calculated Sky View · Provenance'}
          </button>
        </div>
      </div>
    </header>
  );
};
