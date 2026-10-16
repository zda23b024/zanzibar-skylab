import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Rewind, Clock, AlertTriangle, Calendar } from 'lucide-react';

interface TimeControlsProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  timeSpeed: number;
  onChangeSpeed: (speed: number) => void;
  language: 'en' | 'sw';
}

const SPEED_OPTIONS = [
  { label: '1×', value: 1, desc: 'Realtime' },
  { label: '60×', value: 60, desc: '1m / s' },
  { label: '600×', value: 600, desc: '10m / s' },
  { label: '3600×', value: 3600, desc: '1h / s' },
  { label: '86400×', value: 86400, desc: '1d / s' }
];

export const TimeControls: React.FC<TimeControlsProps> = ({
  currentDate,
  onDateChange,
  isPlaying,
  onTogglePlay,
  timeSpeed,
  onChangeSpeed,
  language
}) => {
  const isSw = language === 'sw';

  // Format Zanzibar local time (UTC+3)
  const zanzibarOffsetMs = 3 * 60 * 60 * 1000;
  const zanzibarDate = new Date(currentDate.getTime() + zanzibarOffsetMs);

  const year = zanzibarDate.getUTCFullYear();
  const month = (zanzibarDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = zanzibarDate.getUTCDate().toString().padStart(2, '0');
  const hours = zanzibarDate.getUTCHours().toString().padStart(2, '0');
  const minutes = zanzibarDate.getUTCMinutes().toString().padStart(2, '0');
  const seconds = zanzibarDate.getUTCSeconds().toString().padStart(2, '0');

  const dateString = `${year}-${month}-${day}`;
  const timeString = `${hours}:${minutes}:${seconds}`;

  // Check precision warning: star catalog assumes J2000 coordinates without individual proper motions
  const isOutsideSafeRange = year < 1850 || year > 2150;

  // Step helper
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

  const handleResetNow = () => {
    onDateChange(new Date());
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-3 text-slate-100 flex flex-wrap items-center justify-between gap-4">
      {/* Date & Time Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <input
            type="date"
            value={dateString}
            onChange={handleDateInput}
            className="bg-transparent text-slate-100 focus:outline-none font-mono cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs font-mono">
          <Clock className="w-4 h-4 text-cyan-400" />
          <input
            type="time"
            step="1"
            value={`${hours}:${minutes}`}
            onChange={handleTimeInput}
            className="bg-transparent text-slate-100 focus:outline-none cursor-pointer"
          />
          <span className="text-slate-400 font-sans text-[11px] whitespace-nowrap">
            EAT (UTC+3)
          </span>
        </div>

        <button
          onClick={handleResetNow}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 transition-colors whitespace-nowrap"
          title="Reset to current real time"
        >
          {isSw ? 'Sasa' : 'Now'}
        </button>
      </div>

      {/* Playback Controls & Steps */}
      <div className="flex items-center gap-2">
        {/* Step backward */}
        <button
          onClick={() => handleStep(-3600)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title={isSw ? 'Rudi nyuma saa 1' : 'Step back 1 hour'}
        >
          <Rewind className="w-4 h-4" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          className={`p-2 rounded-lg font-medium transition-colors ${
            isPlaying ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
          }`}
          title={isPlaying ? (isSw ? 'Simamisha' : 'Pause') : (isSw ? 'Endesha' : 'Play Time Travel')}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Step forward */}
        <button
          onClick={() => handleStep(3600)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title={isSw ? 'Nenda mbele saa 1' : 'Step forward 1 hour'}
        >
          <FastForward className="w-4 h-4" />
        </button>

        {/* Speed multiplier selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono ml-2">
          {SPEED_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onChangeSpeed(opt.value)}
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
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

      {/* Precision / Date range warning if far from J2000 */}
      {isOutsideSafeRange && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {isSw
              ? 'Tarehe ipo mbali na J2000. Hesabu za nyota zinaweza kutofautiana kidogo na mwendo halisi.'
              : 'Date is outside J2000 primary epoch (1850–2150). Star positions omit proper motion.'}
          </span>
        </div>
      )}
    </div>
  );
};
