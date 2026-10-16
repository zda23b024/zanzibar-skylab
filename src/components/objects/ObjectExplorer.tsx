import React, { useState, useMemo } from 'react';
import { CalculatedBody, Constellation } from '../../data/types';
import { CONSTELLATIONS } from '../../data/constellations';
import { Search, Compass, Eye, EyeOff, Sparkles, Telescope, ArrowUpRight, Globe2, AlertCircle } from 'lucide-react';

interface ObjectExplorerProps {
  sun: CalculatedBody;
  moon: CalculatedBody;
  planets: CalculatedBody[];
  stars: CalculatedBody[];
  onLocateInSky: (obj: CalculatedBody) => void;
  language: 'en' | 'sw';
}

export const ObjectExplorer: React.FC<ObjectExplorerProps> = ({
  sun,
  moon,
  planets,
  stars,
  onLocateInSky,
  language
}) => {
  const isSw = language === 'sw';
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'planets' | 'stars' | 'constellations'>('all');
  const [horizonFilter, setHorizonFilter] = useState<'all' | 'above'>('all');

  // Combined objects
  const allObjects: CalculatedBody[] = useMemo(() => {
    return [sun, moon, ...planets, ...stars];
  }, [sun, moon, planets, stars]);

  // Filtered objects
  const filteredObjects = useMemo(() => {
    return allObjects.filter(obj => {
      // Category filter
      if (categoryFilter === 'planets' && obj.type !== 'planet' && obj.type !== 'moon' && obj.type !== 'sun') return false;
      if (categoryFilter === 'stars' && obj.type !== 'star') return false;

      // Horizon filter
      if (horizonFilter === 'above' && !obj.isAboveHorizon) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = obj.name.toLowerCase().includes(query);
        const matchSw = obj.swahiliName.toLowerCase().includes(query);
        const matchId = obj.id.toLowerCase().includes(query);
        const matchBayer = obj.bayer?.toLowerCase().includes(query);
        const matchConst = obj.constellation?.toLowerCase().includes(query);
        if (!matchName && !matchSw && !matchId && !matchBayer && !matchConst) return false;
      }

      return true;
    });
  }, [allObjects, categoryFilter, horizonFilter, searchTerm]);

  // Filtered constellations if constellation tab is chosen
  const filteredConstellations = useMemo(() => {
    if (categoryFilter !== 'all' && categoryFilter !== 'constellations') return [];
    if (!searchTerm.trim()) return CONSTELLATIONS;
    const query = searchTerm.toLowerCase();
    return CONSTELLATIONS.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.swahiliName.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query)
    );
  }, [categoryFilter, searchTerm]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
              <Telescope className="w-4 h-4" />
              <span>Module C · Astronomical Object Directory</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              {isSw ? 'Katalogi ya Miili ya Angani' : 'Celestial Object Directory & Ephemerides'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {isSw
                ? 'Orodha ya kisayansi ya sayari, Jua, Mwezi, na nyota angavu za Yale Bright Star Catalog zenye viwianishi halisi vya Stone Town.'
                : 'Searchable scientific catalog with verified coordinates, magnitudes, and direct viewport location.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
              {filteredObjects.length} Bodies Matched
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isSw ? 'Tafuta kwa jina, kitambulisho (mf. Sirius, Jupiter, Betelgeuse)...' : 'Search by name, catalog ID, constellation (e.g. Jupiter, Sirius, Betelgeuse)...'}
              className="w-full bg-slate-850 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${categoryFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setCategoryFilter('planets')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${categoryFilter === 'planets' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Planets & Moon
            </button>
            <button
              onClick={() => setCategoryFilter('stars')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${categoryFilter === 'stars' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Stars
            </button>
            <button
              onClick={() => setCategoryFilter('constellations')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${categoryFilter === 'constellations' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Constellations
            </button>
          </div>

          {/* Above Horizon Toggle */}
          <button
            onClick={() => setHorizonFilter(prev => prev === 'all' ? 'above' : 'all')}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              horizonFilter === 'above'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                : 'bg-slate-850 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isSw ? 'Juu ya Upeo Tu' : 'Above Horizon Only'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Celestial Bodies */}
      {categoryFilter !== 'constellations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredObjects.map(obj => {
            const isAbove = obj.isAboveHorizon;

            return (
              <div
                key={obj.id}
                className="rounded-2xl bg-slate-900/85 border border-slate-800 p-5 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
              >
                <div>
                  {/* Top Bar: Name, Type, Horizon Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: obj.color }}
                      />
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {isSw ? obj.swahiliName : obj.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                          <span className="capitalize">{obj.type}</span>
                          {obj.bayer && (
                            <>
                              <span>·</span>
                              <span className="text-cyan-400">{obj.bayer}</span>
                            </>
                          )}
                          {obj.constellation && (
                            <>
                              <span>·</span>
                              <span>{obj.constellation}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                        isAbove
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-750'
                      }`}
                    >
                      {isAbove ? (isSw ? 'Juu ya Upeo' : 'Above Horizon') : (isSw ? 'Chini ya Upeo' : 'Below Horizon')}
                    </span>
                  </div>

                  {/* Horizontal & Equatorial Coordinates */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono bg-slate-800/40 p-3 rounded-xl border border-slate-750">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Altitude</span>
                      <span className={`font-bold mt-0.5 block ${isAbove ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {obj.altitude >= 0 ? `+${obj.altitude.toFixed(2)}°` : `${obj.altitude.toFixed(2)}°`}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Azimuth</span>
                      <span className="font-bold text-slate-200 mt-0.5 block">
                        {obj.azimuth.toFixed(2)}°
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Right Ascension</span>
                      <span className="text-slate-300 mt-0.5 block">
                        {obj.ra.toFixed(2)}h
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Declination</span>
                      <span className="text-slate-300 mt-0.5 block">
                        {obj.dec >= 0 ? `+${obj.dec.toFixed(2)}°` : `${obj.dec.toFixed(2)}°`}
                      </span>
                    </div>
                  </div>

                  {/* Astrophysical Parameters */}
                  <div className="mt-3 text-xs font-mono text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Visual Magnitude:</span>
                      <span className="text-slate-200 font-semibold">{obj.vmag > 0 ? `+${obj.vmag.toFixed(2)}` : obj.vmag.toFixed(2)}</span>
                    </div>
                    {obj.spectral && (
                      <div className="flex justify-between">
                        <span>Spectral Type:</span>
                        <span className="text-cyan-300">{obj.spectral}</span>
                      </div>
                    )}
                    {obj.distanceAu !== undefined && (
                      <div className="flex justify-between">
                        <span>Distance:</span>
                        <span className="text-slate-200">
                          {obj.distanceAu < 0.01 && obj.distanceKm
                            ? `${obj.distanceKm.toLocaleString()} km`
                            : `${obj.distanceAu.toFixed(3)} AU`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* "Locate in Sky" Action */}
                <div className="pt-3 border-t border-slate-800">
                  <button
                    onClick={() => onLocateInSky(obj)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{isSw ? 'Tazama Kwenye Anga' : 'Locate in Sky'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  {!isAbove && (
                    <div className="text-[10px] text-amber-400/80 font-mono mt-1 text-center">
                      * Object is currently below Zanzibar horizon ({obj.altitude.toFixed(1)}°)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Constellations Directory */}
      {(categoryFilter === 'all' || categoryFilter === 'constellations') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              {isSw ? 'Makundi ya Nyota (Constellations)' : 'Verified Constellations & Boundaries'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConstellations.map(c => (
              <div
                key={c.code}
                className="rounded-2xl bg-slate-900/85 border border-slate-800 p-5 backdrop-blur-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{c.code}</span>
                    <h4 className="text-base font-bold text-white">
                      {isSw ? c.swahiliName : c.name}
                    </h4>
                    <span className="text-xs text-slate-400">{c.englishMeaning}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                    {c.lines.length} Lines
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {isSw ? c.descriptionSw : c.description}
                </p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Center RA: {c.centerRa}h</span>
                  <span>Center DEC: {c.centerDec > 0 ? `+${c.centerDec}°` : `${c.centerDec}°`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
