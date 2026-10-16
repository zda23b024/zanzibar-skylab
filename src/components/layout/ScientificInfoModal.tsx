import React from 'react';
import { SkyState } from '../../astronomy/engine';
import { X, Cpu, Database, Compass, Globe2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ScientificInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  skyState: SkyState;
  language: 'en' | 'sw';
}

export const ScientificInfoModal: React.FC<ScientificInfoModalProps> = ({
  isOpen,
  onClose,
  skyState,
  language
}) => {
  if (!isOpen) return null;
  const isSw = language === 'sw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold text-white">
                {isSw ? 'Taarifa za Kisayansi na Vyanzo' : 'Scientific Methodology & Provenance'}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Calculated Sky — Current Time · Deterministic Celestial Mechanics
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live System State Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-750">
            <span className="text-[10px] text-slate-500 uppercase block">Observer Location</span>
            <span className="text-sm font-bold text-slate-100 mt-0.5 block">{skyState.observer.name}</span>
            <span className="text-[11px] text-cyan-400">
              {skyState.observer.latitude.toFixed(4)}°, {skyState.observer.longitude.toFixed(4)}°
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-750">
            <span className="text-[10px] text-slate-500 uppercase block">Elevation & Timezone</span>
            <span className="text-sm font-bold text-slate-100 mt-0.5 block">{skyState.observer.elevation} m</span>
            <span className="text-[11px] text-slate-400">EAT (UTC+03:00)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-750">
            <span className="text-[10px] text-slate-500 uppercase block">Local Sidereal Time</span>
            <span className="text-sm font-bold text-cyan-400 mt-0.5 block">
              {skyState.lstHours.toFixed(2)}h LST
            </span>
            <span className="text-[11px] text-slate-400">GAST: {skyState.gastHours.toFixed(2)}h</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-750">
            <span className="text-[10px] text-slate-500 uppercase block">Verified Star Catalog</span>
            <span className="text-sm font-bold text-slate-100 mt-0.5 block">
              {skyState.totalCatalogStars} Stars Loaded
            </span>
            <span className="text-[11px] text-slate-400">Yale BSC5 / Hipparcos (J2000)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-750">
            <span className="text-[10px] text-slate-500 uppercase block">Above Horizon Now</span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
              {skyState.visibleCount} Celestial Bodies
            </span>
            <span className="text-[11px] text-slate-400">Sun, Moon, Planets & Stars</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-750">
            <span className="text-[10px] text-slate-500 uppercase block">Projection Mode</span>
            <span className="text-sm font-bold text-slate-100 mt-0.5 block">Stereographic All-Sky</span>
            <span className="text-[11px] text-slate-400">Conformal Polar Mapping</span>
          </div>
        </div>

        {/* Scientific Integrity Statement */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-750 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-white">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>{isSw ? 'Mifumo ya Hesabu na Uadilifu wa Data' : 'Mathematical Engine & Data Integrity'}</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            {isSw
              ? 'Zanzibar SkyLab inatumia hesabu kamili za unajimu kulingana na nadharia za VSOP87 na ELP2000-82B zinazotolewa kupitia maktaba ya astronomy-engine. Hakuna nafasi ya sayari inayobuniwa au kubahatishwa; mahesabu yote ya Sun, Moon, na sayari yanazingatia muda wa usafiri wa mwanga (light-travel time), aberration, na kupinda kwa mwanga katika tabaka la hewa (atmospheric refraction).'
              : 'Zanzibar SkyLab computes celestial positions deterministically using the astronomy-engine core (VSOP87 planetary ephemerides and ELP2000-82B lunar theory by Don Cross). No planetary positions, moon phases, or stars are synthesized or simulated from random noise. Apparent positions account for precession, nutation, topocentric parallax, light-travel time, and Meeus atmospheric refraction.'}
          </p>
        </div>

        {/* Limitations */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs text-amber-300">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{isSw ? 'Mipaka ya Hesabu za Kisayansi' : 'Scientific Limitations & Assumptions'}</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5 text-amber-200/80">
            <li>
              <strong>Calculated Sky — Current Time:</strong> All celestial positions are mathematical calculations based on orbital mechanics. The application does not receive live telescope camera imagery.
            </li>
            <li>
              <strong>Atmospheric extinction & weather:</strong> Calculations model standard atmospheric refraction under clear conditions; coastal clouds, maritime humidity, and local terrain obstacles are not automatically measured.
            </li>
            <li>
              <strong>Geometric vs naked-eye visibility:</strong> An object being geometrically above the horizon (altitude &gt; 0°) does not guarantee naked-eye detection. Human eye detection requires sufficient visual brightness (Vmag &lt; 6.0), dark sky (Sun depression &lt; -12°), and elevation &gt; 15° to penetrate coastal aerosol layers.
            </li>
            <li>
              <strong>Epoch precession:</strong> Fixed star coordinates from the Yale Bright Star Catalog (J2000.0) are dynamically precessed to the epoch of observation using rigorous IAU coordinate rotation matrices.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
