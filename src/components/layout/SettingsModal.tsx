import React, { useState } from 'react';
import { ObserverLocation } from '../../data/types';
import { OBSERVER_PRESETS } from '../../data/locations';
import { X, MapPin, Eye, Languages, RotateCcw, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  observer: ObserverLocation;
  onChangeObserver: (loc: ObserverLocation) => void;
  nightMode: boolean;
  onToggleNightMode: () => void;
  language: 'en' | 'sw';
  onChangeLanguage: (lang: 'en' | 'sw') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  observer,
  onChangeObserver,
  nightMode,
  onToggleNightMode,
  language,
  onChangeLanguage
}) => {
  if (!isOpen) return null;
  const isSw = language === 'sw';

  // Custom coordinate input states
  const [customLat, setCustomLat] = useState<string>(observer.latitude.toString());
  const [customLon, setCustomLon] = useState<string>(observer.longitude.toString());
  const [customElev, setCustomElev] = useState<string>(observer.elevation.toString());
  const [customName, setCustomName] = useState<string>(observer.name);
  const [coordError, setCoordError] = useState<string | null>(null);

  const handleApplyCustom = () => {
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    const elev = parseFloat(customElev) || 0;

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setCoordError(isSw ? 'Latitudo lazima iwe kati ya -90 na +90.' : 'Latitude must be between -90 and +90 degrees.');
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setCoordError(isSw ? 'Longitudo lazima iwe kati ya -180 na +180.' : 'Longitude must be between -180 and +180 degrees.');
      return;
    }

    setCoordError(null);
    onChangeObserver({
      id: 'custom-observer',
      name: customName || (isSw ? 'Kituo Maalum cha Mtazamaji' : 'Custom Observer Location'),
      swahiliName: customName || 'Kituo Maalum cha Mtazamaji',
      latitude: lat,
      longitude: lon,
      elevation: elev,
      timeZone: 'Africa/Dar_es_Salaam',
      description: 'User configured geographic coordinates.',
      descriptionSw: 'Viwianishi vya kijiografia vilivyowekwa na mtumiaji.'
    });
    onClose();
  };

  const handleSelectPreset = (preset: ObserverLocation) => {
    setCustomLat(preset.latitude.toString());
    setCustomLon(preset.longitude.toString());
    setCustomElev(preset.elevation.toString());
    setCustomName(preset.name);
    setCoordError(null);
    onChangeObserver(preset);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              {isSw ? 'Mipangilio ya Kituo na Anga' : 'Observatory Settings & Coordinates'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-cyan-400" />
            <span>{isSw ? 'Lugha ya Mfumo' : 'Display Language'}</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onChangeLanguage('en')}
              className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                language === 'en'
                  ? 'bg-cyan-500/20 border-cyan-500 text-white'
                  : 'bg-slate-800/40 border-slate-750 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>English (Default)</span>
              {language === 'en' && <Check className="w-4 h-4 text-cyan-400" />}
            </button>
            <button
              onClick={() => onChangeLanguage('sw')}
              className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                language === 'sw'
                  ? 'bg-cyan-500/20 border-cyan-500 text-white'
                  : 'bg-slate-800/40 border-slate-750 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>Kiswahili (Sanifu)</span>
              {language === 'sw' && <Check className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Night-Vision Mode Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-750">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-rose-500" />
            <div>
              <div className="text-sm font-semibold text-slate-100">
                {isSw ? 'Mwonekano wa Giza la Usiku (Night Mode)' : 'Red Night-Vision Mode'}
              </div>
              <div className="text-xs text-slate-400">
                {isSw
                  ? 'Hulinda macho yasipoteze uwezo wa kuona nyota gizani'
                  : 'Uses monochromatic red wavelengths to preserve rod photoreceptor dark adaptation'}
              </div>
            </div>
          </div>

          <button
            onClick={onToggleNightMode}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              nightMode ? 'bg-rose-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                nightMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Location Presets */}
        <div className="space-y-3">
          <label className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
            {isSw ? 'Chagua Kituo cha Marejeleo Zanzibar na Tanzania' : 'Location Presets (Zanzibar & Coast)'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {OBSERVER_PRESETS.map(preset => {
              const isSelected = observer.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-sm'
                      : 'bg-slate-800/40 border-slate-750 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-slate-100 flex items-center justify-between">
                    <span>{isSw ? preset.swahiliName : preset.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className="font-mono text-[10px] text-cyan-400 mt-1">
                    {preset.latitude.toFixed(4)}°, {preset.longitude.toFixed(4)}° · {preset.elevation}m
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {isSw ? preset.descriptionSw : preset.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Coordinates Stepper */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-750 space-y-3">
          <label className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
            {isSw ? 'Au Weka Viwianishi Maalum' : 'Or Custom Geographic Coordinates'}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Latitude (°N/S)</span>
              <input
                type="number"
                step="0.0001"
                value={customLat}
                onChange={e => setCustomLat(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="-6.1659"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Longitude (°E/W)</span>
              <input
                type="number"
                step="0.0001"
                value={customLon}
                onChange={e => setCustomLon(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="39.2026"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Elevation (m)</span>
              <input
                type="number"
                value={customElev}
                onChange={e => setCustomElev(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="5"
              />
            </div>
          </div>

          {coordError && (
            <div className="text-xs text-rose-400 font-mono mt-1">
              {coordError}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleApplyCustom}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
            >
              {isSw ? 'Tumia Viwianishi Hivi' : 'Apply Coordinates'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
