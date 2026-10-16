import React, { useState, useMemo } from 'react';
import { ObservationTarget, TwilightTimes, ObserverLocation, CalculatedBody } from '../../data/types';
import { computeObjectEphemerisCurve, computeLocationNetworkComparison } from '../../astronomy/engine';
import { OBSERVER_PRESETS } from '../../data/locations';
import { BRIGHT_STAR_CATALOG } from '../../data/stars';
import { Sun, Moon, Sparkles, Clock, AlertCircle, Compass, LineChart, CheckCircle2, ChevronRight, Eye, MapPin, Globe2 } from 'lucide-react';

interface ObservationPlannerProps {
  targets: ObservationTarget[];
  twilight: TwilightTimes;
  observer: ObserverLocation;
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  onChangeObserver?: (loc: ObserverLocation) => void;
  language: 'en' | 'sw';
}

const SELECTABLE_OBJECTS = [
  { id: 'jupiter', name: 'Jupiter', type: 'Planet', mag: -2.3 },
  { id: 'saturn', name: 'Saturn', type: 'Planet', mag: 0.8 },
  { id: 'mars', name: 'Mars', type: 'Planet', mag: 0.2 },
  { id: 'venus', name: 'Venus', type: 'Planet', mag: -4.1 },
  { id: 'moon', name: 'Moon', type: 'Satellite', mag: -11.5 },
  { id: 'HR 2491', name: 'Sirius (α CMa)', type: 'Star', mag: -1.46 },
  { id: 'HR 2326', name: 'Canopus (α Car)', type: 'Star', mag: -0.74 },
  { id: 'HR 4730', name: 'Acrux (α Cru / Southern Cross)', type: 'Star', mag: 0.77 },
  { id: 'HR 2061', name: 'Betelgeuse (α Ori)', type: 'Star', mag: 0.50 },
  { id: 'HR 1713', name: 'Rigel (β Ori)', type: 'Star', mag: 0.18 },
  { id: 'HR 6134', name: 'Antares (α Sco)', type: 'Star', mag: 0.96 },
  { id: 'HR 7001', name: 'Vega (α Lyr)', type: 'Star', mag: 0.03 },
  { id: 'HR 5340', name: 'Arcturus (α Boo)', type: 'Star', mag: -0.05 },
  { id: 'HR 5056', name: 'Spica (α Vir)', type: 'Star', mag: 0.98 },
  { id: 'HR 897', name: 'Polaris (α UMi / North Star)', type: 'Star', mag: 1.97 }
];

export const ObservationPlanner: React.FC<ObservationPlannerProps> = ({
  targets,
  twilight,
  observer,
  currentDate,
  onSelectDate,
  onChangeObserver,
  language
}) => {
  const isSw = language === 'sw';
  const [selectedObjectId, setSelectedObjectId] = useState<string>('jupiter');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Compute ephemeris curve strictly from real astronomical calculations
  const ephemeris = useMemo(() => {
    return computeObjectEphemerisCurve(selectedObjectId, currentDate, observer);
  }, [selectedObjectId, currentDate, observer]);

  // Multi-site comparison across Zanzibar archipelago and East African stations
  const networkComparisons = useMemo(() => {
    return computeLocationNetworkComparison(selectedObjectId, currentDate, OBSERVER_PRESETS);
  }, [selectedObjectId, currentDate]);

  const selectedObjectMeta = useMemo(() => {
    return SELECTABLE_OBJECTS.find(o => o.id === selectedObjectId) || SELECTABLE_OBJECTS[0];
  }, [selectedObjectId]);

  const formatTime = (d: Date | null) => {
    if (!d) return isSw ? 'Haichomozi/Haizami' : 'None / Circumpolar';
    return d.toLocaleTimeString('en-US', {
      timeZone: 'Africa/Dar_es_Salaam',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // SVG Chart Geometry
  const svgWidth = 860;
  const svgHeight = 280;
  const margin = { top: 30, right: 30, bottom: 40, left: 55 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  // Y-Scale: -20° to +90°
  const minY = -20;
  const maxY = 90;
  const scaleY = (alt: number) => {
    const clamped = Math.max(minY, Math.min(maxY, alt));
    return margin.top + chartHeight - ((clamped - minY) / (maxY - minY)) * chartHeight;
  };

  // X-Scale: total points across the sampling interval
  const totalPoints = ephemeris.curve.length;
  const scaleX = (index: number) => {
    return margin.left + (index / (totalPoints - 1)) * chartWidth;
  };

  // Build SVG Path for the calculated Altitude Curve
  const curvePath = useMemo(() => {
    if (!ephemeris.curve.length) return '';
    return ephemeris.curve.reduce((acc, pt, i) => {
      const x = scaleX(i);
      const y = scaleY(pt.altitude);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [ephemeris.curve]);

  // Horizon Line (0°)
  const yHorizon = scaleY(0);
  // Clean-Air 15° Line
  const y15Deg = scaleY(15);

  const hoveredPoint = hoveredPointIndex !== null ? ephemeris.curve[hoveredPointIndex] : null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Module Title & Observatory Status */}
      <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Module B · Sky Observation Planner</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              {isSw ? `Ratiba ya Uchunguzi: ${observer.swahiliName}` : `Astronomical Observation Planner: ${observer.name}`}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 font-mono">
              <span>LAT {observer.latitude.toFixed(4)}°</span>
              <span>·</span>
              <span>LON {observer.longitude.toFixed(4)}°</span>
              <span>·</span>
              <span>ELEV {observer.elevation}m</span>
              <span>·</span>
              <span>EAT (UTC+03:00)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono">
              <Moon className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-semibold text-slate-100 block">{twilight.moonPhaseName}</span>
                <span className="text-slate-400 text-[11px]">{Math.round(twilight.moonIllumination * 100)}% illuminated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Object & Date Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-mono text-slate-400 font-semibold">
              {isSw ? 'Chagua Kitu cha Angani' : 'Target Celestial Object'}
            </label>
            <select
              value={selectedObjectId}
              onChange={e => setSelectedObjectId(e.target.value)}
              className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {SELECTABLE_OBJECTS.map(obj => (
                <option key={obj.id} value={obj.id} className="bg-slate-900 text-slate-100">
                  {obj.name} ({obj.type}, Vmag {obj.mag})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase font-mono text-slate-400 font-semibold">
              {isSw ? 'Tarehe ya Uchunguzi' : 'Observation Date'}
            </label>
            <input
              type="date"
              value={currentDate.toISOString().split('T')[0]}
              onChange={e => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split('-').map(Number);
                  onSelectDate(new Date(Date.UTC(y, m - 1, d, 18, 0, 0)));
                }
              }}
              className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase font-mono text-slate-400 font-semibold">
              {isSw ? 'Dirisha Bora la Kuangazia' : 'Calculated Window Quality'}
            </label>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/40 border border-slate-750 text-xs">
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${
                  ephemeris.observationWindow.quality === 'optimal'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : ephemeris.observationWindow.quality === 'moderate'
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {ephemeris.observationWindow.quality}
              </span>
              <span className="text-slate-300 truncate text-[11px]">
                {ephemeris.observationWindow.summary}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ALTITUDE-VERSUS-TIME EPHEMERIS CHART */}
      {!ephemeris.isValid ? (
        <div className="rounded-2xl bg-amber-950/40 border border-amber-500/40 p-6 text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-base text-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span>{isSw ? 'Kitu cha Angani Hakijapatikana' : 'Unrecognized Celestial Object'}</span>
          </div>
          <p className="text-xs text-amber-300">
            {ephemeris.errorMessage || 'Target could not be located in solar system ephemerides or star catalog.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-6 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isSw
                    ? `Grafu ya Mwinuko wa Saa 24 (24h Altitude vs Time): ${ephemeris.objectName}`
                    : `Calculated 24-Hour Altitude vs. Time Curve: ${ephemeris.objectName}`}
                </h3>
              </div>
              {ephemeris.observationWindow.criteria && (
                <p className="text-[11px] text-slate-400 font-mono">
                  {ephemeris.observationWindow.criteria}
                </p>
              )}
            </div>

            {/* Key Transit Events */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
              <div>
                <span className="text-slate-500 mr-1.5">RISE</span>
                <span className="text-slate-200 font-semibold">{formatTime(ephemeris.riseTime)}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-1.5">CULMINATION</span>
                <span className="text-cyan-400 font-semibold">{formatTime(ephemeris.transitTime)} (+{ephemeris.transitAltitude.toFixed(1)}°)</span>
              </div>
              <div>
                <span className="text-slate-500 mr-1.5">DARK-SKY PEAK</span>
                <span className={`font-semibold ${ephemeris.peakAltitudeDarkSky !== null ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {ephemeris.peakAltitudeDarkSky !== null ? `+${ephemeris.peakAltitudeDarkSky.toFixed(1)}°` : 'None (Daylight Only)'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 mr-1.5">SET</span>
                <span className="text-slate-200 font-semibold">{formatTime(ephemeris.setTime)}</span>
              </div>
            </div>
          </div>

          {/* SVG Visualization Container */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[780px]">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto select-none overflow-visible"
                onMouseLeave={() => setHoveredPointIndex(null)}
              >
                {/* Background Twilight Bands for each 30-min block */}
                {ephemeris.curve.map((pt, i) => {
                  if (i >= totalPoints - 1) return null;
                  const x1 = scaleX(i);
                  const x2 = scaleX(i + 1);
                  const w = x2 - x1;

                let bandColor = 'rgba(15, 23, 42, 0.4)'; // Night default
                if (pt.sunAltitude > 0) {
                  bandColor = 'rgba(245, 158, 11, 0.08)'; // Daylight glare
                } else if (pt.sunAltitude > -6) {
                  bandColor = 'rgba(6, 182, 212, 0.12)'; // Civil twilight
                } else if (pt.sunAltitude > -12) {
                  bandColor = 'rgba(59, 130, 246, 0.10)'; // Nautical twilight
                } else if (pt.sunAltitude > -18) {
                  bandColor = 'rgba(99, 102, 241, 0.08)'; // Astronomical twilight
                } else {
                  bandColor = 'rgba(3, 7, 18, 0.85)'; // True dark night
                }

                return (
                  <rect
                    key={i}
                    x={x1}
                    y={margin.top}
                    width={w}
                    height={chartHeight}
                    fill={bandColor}
                  />
                );
              })}

              {/* Grid Lines for Y-Axis (Altitudes: 0°, 30°, 60°, 90°) */}
              {[0, 30, 60, 90].map(alt => {
                const y = scaleY(alt);
                return (
                  <g key={alt}>
                    <line
                      x1={margin.left}
                      y1={y}
                      x2={margin.left + chartWidth}
                      y2={y}
                      stroke={alt === 0 ? '#0284c7' : 'rgba(51, 65, 85, 0.4)'}
                      strokeWidth={alt === 0 ? 1.5 : 1}
                      strokeDasharray={alt === 0 ? 'none' : '3 3'}
                    />
                    <text
                      x={margin.left - 8}
                      y={y + 3}
                      fill={alt === 0 ? '#38bdf8' : '#64748b'}
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="end"
                    >
                      {alt === 0 ? 'Horizon 0°' : `+${alt}°`}
                    </text>
                  </g>
                );
              })}

              {/* 15° Clean Air Extinction Threshold Line */}
              <line
                x1={margin.left}
                y1={y15Deg}
                x2={margin.left + chartWidth}
                y2={y15Deg}
                stroke="#10b981"
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.6}
              />
              <text
                x={margin.left + chartWidth - 6}
                y={y15Deg - 4}
                fill="#10b981"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="end"
                opacity={0.8}
              >
                15° Coastal Seeing Threshold
              </text>

              {/* Transit Marker Line if within range */}
              {ephemeris.transitTime && (
                (() => {
                  // Find closest index in curve
                  const transitMs = ephemeris.transitTime.getTime();
                  let closestIdx = 0;
                  let minDiff = Infinity;
                  ephemeris.curve.forEach((pt, idx) => {
                    const diff = Math.abs(pt.time.getTime() - transitMs);
                    if (diff < minDiff) {
                      minDiff = diff;
                      closestIdx = idx;
                    }
                  });
                  const x = scaleX(closestIdx);
                  return (
                    <g>
                      <line
                        x1={x}
                        y1={margin.top}
                        x2={x}
                        y2={margin.top + chartHeight}
                        stroke="#f59e0b"
                        strokeWidth={1.2}
                        strokeDasharray="2 2"
                      />
                      <text
                        x={x + 4}
                        y={margin.top + 12}
                        fill="#fbbf24"
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        Transit / Max Alt
                      </text>
                    </g>
                  );
                })()
              )}

              {/* Calculated Altitude Curve Path */}
              <path
                d={curvePath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Points and Hover Detection Slices */}
              {ephemeris.curve.map((pt, i) => {
                const x = scaleX(i);
                const y = scaleY(pt.altitude);
                const isHovered = hoveredPointIndex === i;

                return (
                  <g key={i}>
                    {/* Invisible wider hover hit target */}
                    <rect
                      x={x - chartWidth / (totalPoints * 2)}
                      y={margin.top}
                      width={chartWidth / totalPoints}
                      height={chartHeight}
                      fill="transparent"
                      onMouseEnter={() => setHoveredPointIndex(i)}
                      className="cursor-crosshair"
                    />

                    {/* Point Marker */}
                    {(i % 2 === 0 || isHovered) && (
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 5 : 2.5}
                        fill={isHovered ? '#38bdf8' : pt.altitude >= 0 ? '#7dd3fc' : '#475569'}
                        stroke="#0f172a"
                        strokeWidth={1}
                      />
                    )}
                  </g>
                );
              })}

              {/* X-Axis Time Labels (Every 2 hours = every 4 points) */}
              {ephemeris.curve.map((pt, i) => {
                if (i % 4 !== 0) return null;
                const x = scaleX(i);
                return (
                  <text
                    key={i}
                    x={x}
                    y={margin.top + chartHeight + 18}
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                  >
                    {pt.timeLabel}
                  </text>
                );
              })}

              {/* X-Axis Footer Label */}
              <text
                x={margin.left + chartWidth / 2}
                y={svgHeight - 6}
                fill="#64748b"
                fontSize="10"
                fontFamily="Plus Jakarta Sans, sans-serif"
                textAnchor="middle"
              >
                Local Time in {observer.name} (EAT / UTC+03:00) — Complete 24-Hour Diurnal Cycle (12:00 to 12:00 Next Day)
              </text>
            </svg>
          </div>
        </div>

        {/* Hover Readout Tooltip Bar */}
        {hoveredPoint ? (
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-200 flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">{hoveredPoint.timeLabel} EAT</span>
            </div>
            <div>
              <span className="text-slate-400 mr-1.5">ALTITUDE:</span>
              <span className={`font-bold ${hoveredPoint.altitude >= 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                {hoveredPoint.altitude >= 0 ? `+${hoveredPoint.altitude.toFixed(1)}°` : `${hoveredPoint.altitude.toFixed(1)}°`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 mr-1.5">AZIMUTH:</span>
              <span className="font-bold text-slate-100">{hoveredPoint.azimuth.toFixed(1)}°</span>
            </div>
            <div>
              <span className="text-slate-400 mr-1.5">SUN ALTITUDE:</span>
              <span className="text-slate-300">{hoveredPoint.sunAltitude.toFixed(1)}°</span>
            </div>
            <div>
              <span className="text-slate-400 mr-1.5">CONDITION:</span>
              <span className={hoveredPoint.isAstroDark ? 'text-emerald-400 font-bold' : hoveredPoint.isDarkSky ? 'text-cyan-400 font-semibold' : 'text-amber-400'}>
                {hoveredPoint.skyCondition.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-500 italic py-1">
            Hover over the 24-hour curve to inspect exact topocentric horizontal coordinates and sky brightness states.
          </div>
        )}

        {/* Scientific Transparency Notice: Geometric vs Physical Visibility */}
        <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-750 text-xs text-slate-300 space-y-1.5">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Calculated Sky &amp; Observational Ephemerides (Scientific Principles)</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            All positions are computed mathematically from IAU/JPL astronomical ephemerides (VSOP87 &amp; ELP2000-82B) and the verified Yale Bright Star Catalog. The platform does not stream live camera images, and local atmospheric cloud cover or terrain obstacles are not automatically sensed.
          </p>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Geometric altitude (Alt &gt; 0°) denotes mathematical elevation above the theoretical sea-level horizon. Physical naked-eye detection requires sufficient object brightness (Vmag &lt; 5.5–6.0 for stars), dark skies (Sun depression &lt; -12°), and elevation &gt; 15° to penetrate coastal maritime aerosol layers.
          </p>
        </div>
      </div>
      )}

      {/* TONIGHT'S OBSERVATION CATALOGUE TABLE */}
      <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              {isSw ? 'Orodha ya Malengo ya Usiku Huu (Hakuna Makadirio Bandia)' : 'Tonight\'s Ranked Celestial Targets (Genuine Night Calculations)'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {targets.length} Targets Evaluated · {targets[0]?.nightObservationInterval || (isSw ? 'Dirisha la usiku halipatikani' : 'Night window unavailable')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                <th className="pb-3 font-semibold">{isSw ? 'Kitu' : 'Target'}</th>
                <th className="pb-3 font-semibold">{isSw ? 'Aina' : 'Category'}</th>
                <th className="pb-3 font-semibold">{isSw ? 'Vmag' : 'Magnitude'}</th>
                <th className="pb-3 font-semibold">{isSw ? 'Urefu Sasa' : 'Current Alt'}</th>
                <th className="pb-3 font-semibold">{isSw ? 'Dira' : 'Bearing'}</th>
                <th className="pb-3 font-semibold">{isSw ? 'Upeo wa Usiku' : 'Night Peak (Dark Sky)'}</th>
                <th className="pb-3 font-semibold">{isSw ? 'Hali' : 'Observation Quality'}</th>
                <th className="pb-3 font-semibold">{isSw ? 'Tathmini' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {targets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-5 text-center text-amber-300 font-sans">
                    {isSw
                      ? 'Mapendekezo hayapatikani kwa sababu machweo au macheo ya siku inayofuata hayakuweza kuhesabiwa.'
                      : 'Recommendations are unavailable because sunset or the following local-day sunrise could not be calculated.'}
                  </td>
                </tr>
              ) : targets.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-sans font-bold text-slate-100">
                    {t.name}
                  </td>
                  <td className="py-3 text-slate-400 capitalize font-sans">
                    {t.type}
                  </td>
                  <td className="py-3 tabular-nums text-slate-200">
                    {t.magnitude > 0 ? `+${t.magnitude.toFixed(1)}` : t.magnitude.toFixed(1)}
                  </td>
                  <td className="py-3 tabular-nums">
                    <span className={t.altitudeNow >= 0 ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>
                      {t.altitudeNow >= 0 ? `+${t.altitudeNow.toFixed(1)}°` : `${t.altitudeNow.toFixed(1)}°`}
                    </span>
                  </td>
                  <td className="py-3 tabular-nums text-slate-300">
                    {t.azimuthNow.toFixed(1)}°
                  </td>
                  <td className="py-3 tabular-nums font-semibold">
                    <span className="text-emerald-400">+{t.maxAltitudeTonight.toFixed(1)}°</span>
                    {t.peakAltitudeDarkSky != null && (
                      <span className="text-slate-500 text-[10px] ml-1">
                        ({t.peakAltitudeDarkSky >= 0 ? `+${t.peakAltitudeDarkSky.toFixed(1)}°` : `${t.peakAltitudeDarkSky.toFixed(1)}°`} dark)
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        t.visibilityStatus === 'optimal'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : t.visibilityStatus === 'moderate'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : t.visibilityStatus === 'daylight'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {t.visibilityStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 font-sans">
                    <button
                      onClick={() => setSelectedObjectId(t.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition-colors text-[11px] font-medium cursor-pointer"
                    >
                      Plot Curve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MULTI-SITE ARCHIPELAGO OBSERVATORY COMPARISON */}
      <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
              <Globe2 className="w-4 h-4" />
              <span>{isSw ? 'Ulinganisho wa Vituo vya Angani' : 'Multi-Station Comparative Network'}</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              {isSw
                ? `Athari za Kubadili Mahali pa Uchunguzi: ${selectedObjectMeta.name}`
                : `How Changing Location Affects Observation: ${selectedObjectMeta.name}`}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {isSw
                ? 'Linganisha unajimu katika vituo vya Unguja, Pemba, na pwani ya bara. Angalia tofauti za kuchomoza/kuzama kwa Jua, giza la anga, na urefu wa lengo lililochaguliwa.'
                : 'Direct mathematical comparison of celestial ephemerides across Unguja, Pemba Island, and mainland stations. Compare twilight times, horizon clearance, and maximum elevation.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
              Target: <span className="text-cyan-400 font-bold">{selectedObjectMeta.name}</span>
            </span>
          </div>
        </div>

        {/* Station Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {networkComparisons.map(comp => {
            const isCurrentStation = comp.station.id === observer.id;
            return (
              <div
                key={comp.station.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrentStation
                    ? 'bg-slate-850/90 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.12)]'
                    : 'bg-slate-800/40 border-slate-750 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className={`w-3.5 h-3.5 ${isCurrentStation ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {isSw ? comp.station.swahiliName : comp.station.name}
                      </h4>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {comp.station.latitude.toFixed(2)}° S, {comp.station.longitude.toFixed(2)}° E · {comp.station.elevation}m
                    </div>
                  </div>

                  {isCurrentStation ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 shrink-0">
                      Active
                    </span>
                  ) : (
                    onChangeObserver && (
                      <button
                        onClick={() => onChangeObserver(comp.station)}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
                      >
                        Set Active
                      </button>
                    )
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  {isSw ? comp.station.descriptionSw : comp.station.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-750 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">SUNSET (EAT)</span>
                    <span className="font-semibold text-slate-200">{formatTime(comp.sunset)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">DARK SKY (DUSK)</span>
                    <span className="font-semibold text-indigo-300">{formatTime(comp.astronomicalDusk)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">TARGET ALT (NOW)</span>
                    <span className={`font-semibold ${comp.targetAltitude >= 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                      {comp.targetAltitude >= 0 ? `+${comp.targetAltitude.toFixed(1)}°` : `${comp.targetAltitude.toFixed(1)}°`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">PEAK TONIGHT</span>
                    <span className="font-semibold text-emerald-400">
                      {comp.targetMaxAlt === null
                        ? (isSw ? 'Haipatikani' : 'Unavailable')
                        : `${comp.targetMaxAlt >= 0 ? '+' : ''}${comp.targetMaxAlt.toFixed(1)}°`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
