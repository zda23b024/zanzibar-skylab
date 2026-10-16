import React from 'react';
import { SkyState } from '../../astronomy/engine';
import { Clock, Play, Pause, FastForward, Rewind, RotateCcw, Calendar, Sun, Moon, Sparkles, AlertCircle, Compass } from 'lucide-react';

interface TimeLabProps {
  skyState: SkyState;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  timeSpeed: number;
  onChangeSpeed: (speed: number) => void;
  language: 'en' | 'sw';
}

const SPEED_PRESETS = [
  { label: '1×', value: 1, desc: 'Realtime' },
  { label: '60×', value: 60, desc: '1m / s (Planetary tracking)' },
  { label: '600×', value: 600, desc: '10m / s (Diurnal rotation)' },
  { label: '3600×', value: 3600, desc: '1h / s (Night progression)' },
  { label: '86400×', value: 86400, desc: '1d / s (Annual seasonal shift)' }
];

export const TimeLab: React.FC<TimeLabProps> = ({
  skyState,
  currentDate,
  onDateChange,
  isPlaying,
  onTogglePlay,
  timeSpeed,
  onChangeSpeed,
  language
}) => {
  const isSw = language === 'sw';

  // Time in Zanzibar (UTC+03:00)
  const zanzibarOffsetMs = 3 * 3600 * 1000;
  const zanzibarDate = new Date(currentDate.getTime() + zanzibarOffsetMs);

  const year = zanzibarDate.getUTCFullYear();
  const month = (zanzibarDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = zanzibarDate.getUTCDate().toString().padStart(2, '0');
  const hours = zanzibarDate.getUTCHours().toString().padStart(2, '0');
  const minutes = zanzibarDate.getUTCMinutes().toString().padStart(2, '0');
  const seconds = zanzibarDate.getUTCSeconds().toString().padStart(2, '0');

  const dateString = `${year}-${month}-${day}`;
  const timeString = `${hours}:${minutes}:${seconds}`;

  const handleStep = (secondsOffset: number) => {
    onDateChange(new Date(currentDate.getTime() + secondsOffset * 1000));
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    const newZanzibar = new Date(Date.UTC(y, m - 1, d, zanzibarDate.getUTCHours(), zanzibarDate.getUTCMinutes(), zanzibarDate.getUTCSeconds()));
    const newUtc = new Date(newZanzibar.getTime() - zanzibarOffsetMs);
    onDateChange(newUtc);
  };

  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [h, m] = val.split(':').map(Number);
    const newZanzibar = new Date(Date.UTC(zanzibarDate.getUTCFullYear(), zanzibarDate.getUTCMonth(), zanzibarDate.getUTCDate(), h, m, 0));
    const newUtc = new Date(newZanzibar.getTime() - zanzibarOffsetMs);
    onDateChange(newUtc);
  };

  // Jump to astronomical milestones
  const jumpToMilestone = (target: Date | null) => {
    if (target) onDateChange(target);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Module D · Astronomical Time Simulation Lab</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              {isSw ? 'Maabara ya Wakati na Mzunguko wa Dunia' : 'High-Precision Celestial Time Lab'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {isSw
                ? 'Endesha au simamisha wakati ili kuona mwendo wa nyota na sayari kwa hesabu halisi za kijiometri.'
                : 'Simulate Earth\'s diurnal rotation and orbital progression with continuous astronomical ephemeris recalculation.'}
            </p>
          </div>

          {/* Timezone Indicator */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Simulation Time (EAT)</span>
              <span className="text-lg font-bold text-white tabular-nums">{timeString}</span>
            </div>
            <div className="w-[1px] h-6 bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Universal Time (UTC)</span>
              <span className="text-sm font-semibold text-slate-300 tabular-nums">
                {currentDate.toISOString().substring(11, 19)}
              </span>
            </div>
          </div>
        </div>

        {/* Master Time Control Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          {/* Column 1: Date & Time Pickers */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
              {isSw ? 'Chagua Tarehe na Saa' : 'Date & Time Setting'}
            </span>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-slate-850 px-3 py-2 rounded-xl border border-slate-700 text-xs font-mono">
                <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="date"
                  value={dateString}
                  onChange={handleDateInput}
                  className="bg-transparent text-slate-100 focus:outline-none cursor-pointer w-full"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-850 px-3 py-2 rounded-xl border border-slate-700 text-xs font-mono">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="time"
                  step="1"
                  value={`${hours}:${minutes}`}
                  onChange={handleTimeInput}
                  className="bg-transparent text-slate-100 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => onDateChange(new Date())}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition-colors font-mono"
            >
              {isSw ? 'Weka Upya kwa Wakati wa Sasa (Now)' : 'Reset to Actual Current Time (Now)'}
            </button>
          </div>

          {/* Column 2: Playback & Speed Multipliers */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
              {isSw ? 'Uendeshaji wa Wakati' : 'Simulation Engine & Multipliers'}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStep(-3600)}
                className="p-2.5 rounded-xl bg-slate-850 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Step backward 1 hour"
              >
                <Rewind className="w-4 h-4" />
              </button>

              <button
                onClick={onTogglePlay}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
                  isPlaying
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>{isSw ? 'Simamisha Wakati' : 'Pause Simulation'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>{isSw ? 'Endesha Wakati' : 'Run Simulation'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleStep(3600)}
                className="p-2.5 rounded-xl bg-slate-850 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Step forward 1 hour"
              >
                <FastForward className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Multiplier Pill Strip */}
            <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-slate-850 border border-slate-700 text-xs font-mono">
              {SPEED_PRESETS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onChangeSpeed(opt.value)}
                  className={`py-1 rounded text-center transition-colors ${
                    timeSpeed === opt.value
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={opt.desc}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Quick Twilight Milestones */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
              {isSw ? 'Ruka Kwenye Vipindi Maalum' : 'Astronomical Milestones Jump'}
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => jumpToMilestone(skyState.twilight.sunset)}
                className="p-2 rounded-xl bg-slate-850 border border-slate-750 hover:border-slate-600 text-slate-300 text-left"
              >
                <span className="text-[10px] text-amber-400 block">Sunset (0°)</span>
                <span className="text-white font-semibold">18:25 EAT</span>
              </button>

              <button
                onClick={() => jumpToMilestone(skyState.twilight.astronomicalDusk)}
                className="p-2 rounded-xl bg-slate-850 border border-slate-750 hover:border-slate-600 text-slate-300 text-left"
              >
                <span className="text-[10px] text-indigo-400 block">Dark Sky (-18°)</span>
                <span className="text-white font-semibold">19:35 EAT</span>
              </button>

              <button
                onClick={() => {
                  const midnight = new Date(Date.UTC(zanzibarDate.getUTCFullYear(), zanzibarDate.getUTCMonth(), zanzibarDate.getUTCDate(), 21, 0, 0));
                  onDateChange(midnight);
                }}
                className="p-2 rounded-xl bg-slate-850 border border-slate-750 hover:border-slate-600 text-slate-300 text-left"
              >
                <span className="text-[10px] text-cyan-400 block">Midnight Culmination</span>
                <span className="text-white font-semibold">00:00 EAT</span>
              </button>

              <button
                onClick={() => jumpToMilestone(skyState.twilight.sunrise)}
                className="p-2 rounded-xl bg-slate-850 border border-slate-750 hover:border-slate-600 text-slate-300 text-left"
              >
                <span className="text-[10px] text-amber-400 block">Sunrise (0°)</span>
                <span className="text-white font-semibold">06:15 EAT</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REAL-TIME PLANETARY & STELLAR TELEMETRY DECK */}
      <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              {isSw ? 'Mwendo wa Miili ya Angani kwa Wakati Huu' : 'Simulated Ephemerides State'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {skyState.visibleCount} Bodies Above Horizon
          </span>
        </div>

        {/* Live Horizon Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Sun */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-750 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-amber-300">Sun</span>
              <span className={`text-[10px] uppercase font-bold ${skyState.sun.altitude >= 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                {skyState.sun.altitude >= 0 ? 'Above' : 'Below'}
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-white tabular-nums">
              {skyState.sun.altitude >= 0 ? `+${skyState.sun.altitude.toFixed(1)}°` : `${skyState.sun.altitude.toFixed(1)}°`}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">AZ {skyState.sun.azimuth.toFixed(0)}°</div>
          </div>

          {/* Moon */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-750 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-200">Moon</span>
              <span className={`text-[10px] uppercase font-bold ${skyState.moon.altitude >= 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {skyState.moon.altitude >= 0 ? 'Above' : 'Below'}
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-white tabular-nums">
              {skyState.moon.altitude >= 0 ? `+${skyState.moon.altitude.toFixed(1)}°` : `${skyState.moon.altitude.toFixed(1)}°`}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {Math.round((skyState.moon.illuminatedFraction || 0) * 100)}% illum
            </div>
          </div>

          {/* Mercury, Venus, Mars, Jupiter, Saturn */}
          {skyState.planets.filter(p => p.isNakedEye).map(p => (
            <div key={p.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-750 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-200">{p.name}</span>
                <span className={`text-[10px] uppercase font-bold ${p.altitude >= 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {p.altitude >= 0 ? 'Above' : 'Below'}
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-white tabular-nums">
                {p.altitude >= 0 ? `+${p.altitude.toFixed(1)}°` : `${p.altitude.toFixed(1)}°`}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                AZ {p.azimuth.toFixed(0)}° · Vmag {p.vmag.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
