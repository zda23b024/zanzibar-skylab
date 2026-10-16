import React from 'react';
import { CalculatedBody } from '../../data/types';
import { X, Compass, Globe2, Eye, Info } from 'lucide-react';

interface ObjectInspectorProps {
  object: CalculatedBody | null;
  onClose: () => void;
  language: 'en' | 'sw';
}

function formatDMS(deg: number): string {
  const absolute = Math.abs(deg);
  const d = Math.floor(absolute);
  const m = Math.floor((absolute - d) * 60);
  const s = Math.round(((absolute - d) * 60 - m) * 60);
  const sign = deg < 0 ? '-' : '+';
  return `${sign}${d}° ${m}' ${s}"`;
}

function formatHMS(hours: number): string {
  const absolute = ((hours % 24) + 24) % 24;
  const h = Math.floor(absolute);
  const m = Math.floor((absolute - h) * 60);
  const s = Math.round(((absolute - h) * 60 - m) * 60);
  return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

function getAzimuthCompass(az: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((az % 360) / 22.5) % 16;
  return dirs[index];
}

export const ObjectInspector: React.FC<ObjectInspectorProps> = ({ object, onClose, language }) => {
  if (!object) return null;

  const isSw = language === 'sw';
  const isAbove = object.altitude >= 0;

  return (
    <div className="absolute bottom-4 right-4 w-80 md:w-96 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl p-4 text-slate-100 z-20 transition-all animate-in fade-in slide-in-from-bottom-2">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: object.color }}
            />
            <h3 className="text-base font-bold tracking-tight text-white">
              {isSw ? object.swahiliName : object.name}
            </h3>
            {object.bayer && (
              <span className="text-xs font-mono text-cyan-400">
                {object.bayer}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span className="capitalize">{object.type}</span>
            {object.constellation && (
              <>
                <span>·</span>
                <span>Constellation: {object.constellation}</span>
              </>
            )}
            {object.spectral && (
              <>
                <span>·</span>
                <span className="font-mono">{object.spectral}</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2.5 py-3 border-b border-slate-800 text-xs font-mono">
        {/* Altitude */}
        <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-750">
          <div className="text-[10px] uppercase text-slate-400 tracking-wider">
            {isSw ? 'Urefu wa Anga (ALT)' : 'Altitude (ALT)'}
          </div>
          <div className={`text-base font-bold tabular-nums mt-0.5 ${isAbove ? 'text-cyan-400' : 'text-slate-500'}`}>
            {formatDMS(object.altitude)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {object.altitude.toFixed(2)}° {isAbove ? (isSw ? '(Juu ya upeo)' : '(Above Horizon)') : (isSw ? '(Chini ya upeo)' : '(Below Horizon)')}
          </div>
        </div>

        {/* Azimuth */}
        <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-750">
          <div className="text-[10px] uppercase text-slate-400 tracking-wider">
            {isSw ? 'Dira ya Mwelekeo (AZ)' : 'Azimuth (AZ)'}
          </div>
          <div className="text-base font-bold tabular-nums text-slate-100 mt-0.5">
            {object.azimuth.toFixed(2)}°
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>Bearing {getAzimuthCompass(object.azimuth)}</span>
          </div>
        </div>

        {/* Right Ascension */}
        <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-750">
          <div className="text-[10px] uppercase text-slate-400 tracking-wider">
            {isSw ? 'Mwinuko wa Kulia (RA)' : 'Right Ascension'}
          </div>
          <div className="text-sm font-semibold tabular-nums text-slate-200 mt-0.5">
            {formatHMS(object.ra)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            J2000 / Of Date
          </div>
        </div>

        {/* Declination */}
        <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-750">
          <div className="text-[10px] uppercase text-slate-400 tracking-wider">
            {isSw ? 'Mwelekeo wa Ncha (DEC)' : 'Declination'}
          </div>
          <div className="text-sm font-semibold tabular-nums text-slate-200 mt-0.5">
            {formatDMS(object.dec)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {object.dec.toFixed(2)}°
          </div>
        </div>
      </div>

      {/* Secondary Scientific Parameters */}
      <div className="py-2.5 text-xs space-y-1.5 text-slate-300 font-mono">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">{isSw ? 'Mwangaza (Vmag):' : 'Visual Magnitude:'}</span>
          <span className="font-bold text-slate-200 tabular-nums">
            {object.vmag > 0 ? `+${object.vmag.toFixed(2)}` : object.vmag.toFixed(2)}
          </span>
        </div>

        {object.distanceAu !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400">{isSw ? 'Umbali (AU):' : 'Distance from Earth:'}</span>
            <span className="font-bold text-slate-200 tabular-nums">
              {object.distanceAu < 0.01 && object.distanceKm
                ? `${object.distanceKm.toLocaleString()} km`
                : `${object.distanceAu.toFixed(4)} AU`}
            </span>
          </div>
        )}

        {object.illuminatedFraction !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400">{isSw ? 'Sehemu ya Mwangaza:' : 'Illumination Fraction:'}</span>
            <span className="font-bold text-cyan-400 tabular-nums">
              {(object.illuminatedFraction * 100).toFixed(1)}%
            </span>
          </div>
        )}

        {object.phaseAngle !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400">{isSw ? 'Pembe ya Awamu:' : 'Phase Angle:'}</span>
            <span className="font-bold text-slate-200 tabular-nums">
              {object.phaseAngle.toFixed(1)}°
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-slate-400">{isSw ? 'Mwonekano:' : 'Visibility:'}</span>
          <span className={`font-medium ${isAbove ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isAbove
              ? (isSw ? 'Juu ya Upeo wa Zanzibar' : 'Above Horizon (Observable)')
              : (isSw ? 'Chini ya Upeo wa Zanzibar' : 'Below Horizon')}
          </span>
        </div>
      </div>

      {/* Attribution footer */}
      <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Calculated via astronomy-engine</span>
        <span>Epoch J2000.0</span>
      </div>
    </div>
  );
};
