import React from 'react';
import { CalculatedBody, TwilightTimes } from '../../data/types';
import { Moon, Compass, Calendar, AlertCircle, Info, Sparkles } from 'lucide-react';

interface MoonExplorerProps {
  moon: CalculatedBody;
  twilight: TwilightTimes;
  language: 'en' | 'sw';
}

interface PhaseCard {
  id: string;
  nameEn: string;
  nameSw: string;
  angleRange: string;
  descEn: string;
  descSw: string;
  illumination: string;
}

const ALL_PHASES: PhaseCard[] = [
  {
    id: 'new_moon',
    nameEn: 'New Moon',
    nameSw: 'Mwezi Mwandamo (Conjunction)',
    angleRange: '0° ± 22.5°',
    illumination: '0%',
    descEn: 'The Moon lies between Earth and Sun. Its illuminated side faces away from Earth. Invisible to human eyes.',
    descSw: 'Mwezi unakaa kati ya Dunia na Jua. Upande wenye mwanga unatazama mbali na Dunia. Hauwezi kuonekana kwa macho.'
  },
  {
    id: 'waxing_crescent',
    nameEn: 'Waxing Crescent (Hilal)',
    nameSw: 'Mwezi Hilali (Mchanga)',
    angleRange: '45° ± 22.5°',
    illumination: '1% – 49%',
    descEn: 'A slender sliver of light appears in the western sky just after sunset. Central to the coastal Islamic calendar.',
    descSw: 'Uzi mwembamba wa mwangaza unaoonekana magharibi mara baada ya Jua kutua. Muhimu sana katika kalenda ya Kiislamu ya pwani.'
  },
  {
    id: 'first_quarter',
    nameEn: 'First Quarter',
    nameSw: 'Robo ya Kwanza',
    angleRange: '90° ± 22.5°',
    illumination: '50%',
    descEn: 'Half of the Moon\'s visible disk is illuminated. High in the evening sky at sunset in Zanzibar.',
    descSw: 'Nusu ya uso wa mwezi inaangazwa na Jua. Huonekana juu sana angani wakati wa machweo.'
  },
  {
    id: 'waxing_gibbous',
    nameEn: 'Waxing Gibbous',
    nameSw: 'Mwezi Unaokua (Gibbous)',
    angleRange: '135° ± 22.5°',
    illumination: '51% – 99%',
    descEn: 'More than half is illuminated and continues to brighten each night toward fullness.',
    descSw: 'Zaidi ya nusu ina mwangaza na inaendelea kuongezeka kila usiku kuelekea mwezi mpevu.'
  },
  {
    id: 'full_moon',
    nameEn: 'Full Moon',
    nameSw: 'Mwezi Mpevu (Mwezi Kamili)',
    angleRange: '180° ± 22.5°',
    illumination: '100%',
    descEn: 'The Moon is directly opposite the Sun. Rises in the East right as the Sun sets in the West, illuminating the Zanzibar Channel.',
    descSw: 'Mwezi unakaa upande wa mkabala kabisa na Jua. Huchomoza Mashariki mara tu Jua linapozama Magharibi.'
  },
  {
    id: 'waning_gibbous',
    nameEn: 'Waning Gibbous',
    nameSw: 'Mwezi Unaopungua',
    angleRange: '225° ± 22.5°',
    illumination: '99% – 51%',
    descEn: 'Illumination starts receding from the right limb as the Moon heads toward third quarter.',
    descSw: 'Mwangaza unaanza kupungua kuelekea robo ya mwisho, ukichomoza baada ya usiku kuingia.'
  },
  {
    id: 'last_quarter',
    nameEn: 'Last / Third Quarter',
    nameSw: 'Robo ya Mwisho',
    angleRange: '270° ± 22.5°',
    illumination: '50%',
    descEn: 'The opposite half is illuminated. Rises around local midnight and remains high into the morning blue sky.',
    descSw: 'Nusu ya upande wa pili inaangazwa. Huchomoza usiku wa manane na kuonekana asubuhi.'
  },
  {
    id: 'waning_crescent',
    nameEn: 'Waning Crescent',
    nameSw: 'Mwezi Mkongwe (Alfajiri)',
    angleRange: '315° ± 22.5°',
    illumination: '49% – 1%',
    descEn: 'A delicate morning crescent visible in the eastern dawn sky before sunrise.',
    descSw: 'Hilali nyembamba ya asubuhi inayoonekana mashariki kabla ya pambazuko la alfajiri.'
  }
];

export const MoonExplorer: React.FC<MoonExplorerProps> = ({ moon, twilight, language }) => {
  const isSw = language === 'sw';
  const phaseAngle = moon.phaseAngle || 0;
  const illumPct = Math.round((moon.illuminatedFraction ?? 0.5) * 100);

  // Time format helper
  const formatTime = (d: Date | null) => {
    if (!d) return isSw ? 'Haichomozi/Haizami' : 'None';
    return d.toLocaleTimeString('en-US', {
      timeZone: 'Africa/Dar_es_Salaam',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Hero Visualizer Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 md:p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
          {/* Visual Moon Simulator */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-slate-950 border border-slate-800 shadow-[0_0_60px_rgba(56,189,248,0.08)] flex items-center justify-center overflow-hidden">
              {/* Moon texture surface circles */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800" />
              
              {/* Illuminated segment */}
              <div
                className="absolute inset-0 rounded-full bg-slate-100"
                style={{
                  clipPath: 'circle(50% at 50% 50%)'
                }}
              />

              {/* Dynamic Terminator Shadow Canvas */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="#0f172a" />
                <path
                  d={
                    illumPct >= 50
                      ? `M 50 2 A 48 48 0 0 1 50 98 A ${Math.abs(48 * (1 - 2 * (moon.illuminatedFraction || 0.5)))} 48 0 0 ${phaseAngle > 180 ? 1 : 0} 50 2 Z`
                      : `M 50 2 A 48 48 0 0 ${phaseAngle > 180 ? 1 : 0} 50 98 A ${Math.abs(48 * (1 - 2 * (moon.illuminatedFraction || 0.5)))} 48 0 0 ${phaseAngle > 180 ? 0 : 1} 50 2 Z`
                  }
                  fill="#f8fafc"
                />
              </svg>

              {/* Subtle crater details */}
              <div className="absolute top-12 left-16 w-8 h-8 rounded-full bg-slate-400/20 pointer-events-none" />
              <div className="absolute bottom-14 right-14 w-12 h-12 rounded-full bg-slate-400/15 pointer-events-none" />
              <div className="absolute top-20 right-20 w-6 h-6 rounded-full bg-slate-400/20 pointer-events-none" />
            </div>

            <div className="text-center mt-4">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono font-medium">
                {isSw ? 'Awamu ya Sasa' : 'Calculated Phase'}
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {isSw ? twilight.moonPhaseSw : twilight.moonPhaseName}
              </h2>
            </div>
          </div>

          {/* Key Lunar Telemetry Values */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                {isSw ? 'Mwangaza' : 'Illumination'}
              </span>
              <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums mt-1">
                {illumPct}%
              </div>
              <span className="text-xs text-slate-400">
                {isSw ? 'Sehemu inayoangazwa' : 'Fraction of visible disk'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                {isSw ? 'Umri wa Mwezi' : 'Lunar Age'}
              </span>
              <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums mt-1">
                {twilight.moonAgeDays} <span className="text-xs font-normal text-slate-400">{isSw ? 'siku' : 'days'}</span>
              </div>
              <span className="text-xs text-slate-400">
                {isSw ? 'Tangu mwezi mpya' : 'Since astronomical conjunction'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                {isSw ? 'Umbali' : 'Distance'}
              </span>
              <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums mt-1">
                {moon.distanceKm ? moon.distanceKm.toLocaleString() : '384,400'} <span className="text-xs font-normal text-slate-400">km</span>
              </div>
              <span className="text-xs text-slate-400">
                {isSw ? 'Kutoka Zanzibar' : 'Topocentric distance'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                {isSw ? 'Urefu (ALT)' : 'Altitude'}
              </span>
              <div className={`text-2xl font-bold font-mono tabular-nums mt-1 ${moon.altitude >= 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {moon.altitude >= 0 ? `+${moon.altitude.toFixed(1)}°` : `${moon.altitude.toFixed(1)}°`}
              </div>
              <span className="text-xs text-slate-400">
                {moon.altitude >= 0 ? (isSw ? 'Juu ya upeo' : 'Above horizon') : (isSw ? 'Chini ya upeo' : 'Below horizon')}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                {isSw ? 'Kuchomoza' : 'Moonrise'}
              </span>
              <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums mt-1">
                {formatTime(twilight.moonrise)}
              </div>
              <span className="text-xs text-slate-400">
                EAT (UTC+3)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                {isSw ? 'Kuzama' : 'Moonset'}
              </span>
              <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums mt-1">
                {formatTime(twilight.moonset)}
              </div>
              <span className="text-xs text-slate-400">
                EAT (UTC+3)
              </span>
            </div>
          </div>
        </div>

        {/* Scientific Transparency Callout: Hilal vs Astronomical Conjunction */}
        <div className="mt-6 p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-cyan-300">
              {isSw
                ? 'Kumbuka: Tofauti ya Awamu ya Unajimu na Kuonekana kwa Hilali Zanzibar'
                : 'Scientific Notice: Astronomical Conjunction vs. Physical Crescent Sighting (Hilal)'}
            </h4>
            <p className="text-cyan-200/80 leading-relaxed">
              {isSw
                ? 'Hesabu hii ya angani inaonyesha nafasi halisi ya kijiometri ya Mwezi na sehemu inayoangazwa. Hata hivyo, kuonekana kwa Hilali kwa jicho la mwanadamu kunahitaji umbali wa kutosha kutoka kwenye mwangaza wa Jua (elongation > 8°), mwezi kutua angalau dakika 30 baada ya Jua, na hewa safi ya baharini bila ukungu.'
                : 'Zanzibar SkyLab calculates the exact geometric phase angle and illuminated fraction using ELP2000-82B ephemerides. A computed young crescent phase does not guarantee that the physical crescent is optically visible to observers in Stone Town; naked-eye sighting requires sufficient solar elongation (> 8°–10°), a positive sunset-moonset lag time (30–50 min), and low atmospheric extinction.'}
            </p>
          </div>
        </div>
      </div>

      {/* 8 Lunar Phases Guide */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">
            {isSw ? 'Mwongozo wa Awamu 8 za Mwezi' : 'The 8 Primary Lunar Phases'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_PHASES.map(phase => {
            const isCurrent =
              twilight.moonPhaseName.toLowerCase().includes(phase.nameEn.toLowerCase()) ||
              phase.nameEn.toLowerCase().includes(twilight.moonPhaseName.toLowerCase());

            return (
              <div
                key={phase.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_20px_rgba(56,189,248,0.12)]'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{phase.angleRange}</span>
                  <span className="text-cyan-400 font-semibold">{phase.illumination}</span>
                </div>

                <h4 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                  <span>{isSw ? phase.nameSw : phase.nameEn}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      {isSw ? 'SASA' : 'ACTIVE'}
                    </span>
                  )}
                </h4>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {isSw ? phase.descSw : phase.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
