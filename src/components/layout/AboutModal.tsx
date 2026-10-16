import React from 'react';
import { X, Globe2, Compass, Award, Users, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'sw';
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;
  const isSw = language === 'sw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 md:p-8 text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Zanzibar SkyLab · Space Science Innovation</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              {isSw
                ? 'Kuhusu Zanzibar SkyLab'
                : 'About Zanzibar SkyLab'}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Explore the Universe from Zanzibar · Jukwaa la Sayansi ya Anga na Nyota
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Section 1: The Educational Problem */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>{isSw ? '1. Changamoto ya Kielimu (The Problem)' : '1. The Educational Problem'}</span>
            </h3>
            <p>
              {isSw
                ? 'Katika nchi za Afrika Mashariki, zana za vitendo za kujifunzia sayansi ya anga (astronomy na astrophysics) ni haba sana. Vyoo vingi vya sayansi na madarasa ya shule hayana vituo vya sayari (planetariums), na programu nyingi za angani zimeundwa kwa ajili ya latitudo za Ulaya na Marekani pekee, zikiacha mtazamo wa kipekee wa angani ya ukanda wa ikweta.'
                : 'Across East Africa, practical digital planetariums and space science educational platforms are virtually inaccessible in secondary schools and universities. Most global planetarium software is hardcoded or optimized for Northern Hemisphere mid-latitudes (Europe and North America), ignoring the breathtaking celestial dynamics unique to the equatorial belt.'}
            </p>
          </div>

          {/* Section 2: The Solution & Innovation */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{isSw ? '2. Suluhisho na Ubunifu Wetu (The Solution & Innovation)' : '2. The Solution & Innovation'}</span>
            </h3>
            <p>
              {isSw
                ? 'Zanzibar SkyLab inaleta suluhisho la kisasa: kituo cha angani cha kidijitali (digital astronomical observatory) kinachofanya kazi moja kwa moja kwenye kivinjari cha wavuti bila kuhitaji intaneti yenye kasi au seva za nje. Inatumia hesabu kamili za kimahesabu za kinyota (astronomy-engine), orodha ya nyota halisi ya Yale Bright Star Catalog, na zana za vitendo za kupanga uchunguzi wa darubini.'
                : 'Zanzibar SkyLab delivers a 100% client-side, zero-database, high-precision digital astronomical observatory and planning platform specifically calibrated for Zanzibar (Stone Town, Nungwi, Paje, and Pemba). It integrates real celestial mechanics (VSOP87 and ELP2000-82B), interactive star inspection, multi-site comparative tracking, and rigorous observation planning.'}
            </p>
          </div>

          {/* Section 3: Target Users */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>{isSw ? '3. Walengwa Wakuu (Target Audience)' : '3. Target Audience'}</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>
                <strong className="text-slate-200">Secondary & University Students in Tanzania:</strong> Learning physics, celestial mechanics, optics, and geometry.
              </li>
              <li>
                <strong className="text-slate-200">Science Teachers & Educators:</strong> Presenting celestial coordinate systems and seasonal star patterns without costly physical domes.
              </li>
              <li>
                <strong className="text-slate-200">Zanzibar Astronomy and Space Society (ZASS):</strong> Organizing community stargazing sessions and outreach in Stone Town and Unguja.
              </li>
              <li>
                <strong className="text-slate-200">Cultural & Maritime Historians:</strong> Documenting the ancient Swahili star-navigation traditions of Indian Ocean sailors.
              </li>
            </ul>
          </div>

          {/* Section 4: Scientific Provenance & Technology Stack */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750 space-y-2 text-xs">
            <h4 className="font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Scientific Specifications & Stack</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400 font-mono">
              <div>· Architecture: Static React 19 + TypeScript + Vite</div>
              <div>· Calculation Engine: astronomy-engine (Don Cross)</div>
              <div>· Solar System Model: VSOP87 & ELP2000-82B</div>
              <div>· Star Catalog: Yale BSC5 / Hipparcos (J2000)</div>
              <div>· Projection: Stereographic Conformal All-Sky</div>
              <div>· Coordinate Transformations: Meeus 1998</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Prepared for Space Science Innovation Competition</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans font-medium transition-colors"
          >
            {isSw ? 'Funga' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
