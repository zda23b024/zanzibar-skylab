import React, { useState } from 'react';
import { Play, ArrowRight, ArrowLeft, Check, Sparkles, X, Clock, Compass, BookOpen, Cpu } from 'lucide-react';
import { CalculatedBody } from '../../data/types';

interface DemoStep {
  stepNumber: number;
  titleEn: string;
  titleSw: string;
  duration: string;
  narrationEn: string;
  narrationSw: string;
  actionHintEn: string;
  actionHintSw: string;
  targetView: 'sky' | 'planner' | 'objects' | 'timelab' | 'moon';
  action?: () => void;
}

interface CompetitionDemoProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView: (view: 'sky' | 'planner' | 'objects' | 'timelab' | 'moon') => void;
  onSelectObject: (obj: CalculatedBody | null) => void;
  sampleStar: CalculatedBody | null;
  onTriggerTimeSpeed: (speed: number) => void;
  language: 'en' | 'sw';
}

export const CompetitionDemo: React.FC<CompetitionDemoProps> = ({
  isOpen,
  onClose,
  onNavigateView,
  onSelectObject,
  sampleStar,
  onTriggerTimeSpeed,
  language
}) => {
  if (!isOpen) return null;
  const isSw = language === 'sw';
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const steps: DemoStep[] = [
    {
      stepNumber: 1,
      titleEn: '1. Introduction: The Equatorial Vantage Point',
      titleSw: '1. Utangulizi: Mtazamo Maalum wa Ikweta',
      duration: '0:00 – 0:30',
      narrationEn: 'Welcome to Zanzibar SkyLab. Located at 6° South in Stone Town, Zanzibar has one of the world\'s most privileged astronomical viewpoints: over the course of a year, observers can see nearly 100% of the entire celestial sphere. Notice the clean, responsive interface designed for offline school and observatory accessibility across East Africa.',
      narrationSw: 'Karibu Zanzibar SkyLab. Ikiwa ipo nyuzi 6 kusini mwa ikweta hapa Mji Mkongwe, Zanzibar ina moja ya mitazamo bora zaidi duniani ambapo unaweza kuona takriban asilimia 100 ya anga yote ya ulimwengu.',
      actionHintEn: 'Notice the live Stone Town coordinates and local sidereal time ribbon.',
      actionHintSw: 'Angalia viwianishi halisi vya Mji Mkongwe na wakati wa kinyota.',
      targetView: 'sky',
      action: () => {
        onNavigateView('sky');
        onSelectObject(null);
      }
    },
    {
      stepNumber: 2,
      titleEn: '2. The Calculated Sky Above Stone Town',
      titleSw: '2. Anga Halisi ya Kimahesabu Juu ya Mji Mkongwe',
      duration: '0:30 – 1:00',
      narrationEn: 'This interactive sky map is powered by genuine astronomical algorithms (VSOP87 & ELP2000-82B) and a verified Yale Bright Star Catalog. Notice that in the north we can observe Ursa Major skimming the horizon, while in the south Crux (the Southern Cross) blazes brightly — a combination impossible in Europe or Australia!',
      narrationSw: 'Ramani hii ya anga inatumia kanuni halisi za unajimu na orodha ya nyota kutoka Yale Bright Star Catalog. Kaskazini unaweza kuona Dubu Mkubwa, wakati huo huo Kusini unaona Msalaba wa Kusini!',
      actionHintEn: 'Rotate heading or toggle constellation lines using the upper controls.',
      actionHintSw: 'Zungusha dira au washa mistari ya makundi ya nyota.',
      targetView: 'sky',
      action: () => {
        onNavigateView('sky');
      }
    },
    {
      stepNumber: 3,
      titleEn: '3. Precision Object Inspector',
      titleSw: '3. Uchunguzi wa Nyota na Sayari kwa Kina',
      duration: '1:00 – 1:30',
      narrationEn: 'Clicking any celestial object opens our scientific inspector panel. Here we inspect real topocentric altitude, azimuth, right ascension, declination, visual magnitude, and spectral class. Every value is derived from first-principles celestial mechanics with zero synthetic approximations.',
      narrationSw: 'Kubofya kitu chochote cha angani hufungua jopo la sayansi linaloonyesha urefu halisi (ALT), dira (AZ), RA, DEC, na mwangaza (Vmag).',
      actionHintEn: 'We have selected a verified star to demonstrate live coordinate telemetry.',
      actionHintSw: 'Tumechagua nyota kielelezo kuonyesha vipimo halisi vya angani.',
      targetView: 'sky',
      action: () => {
        onNavigateView('sky');
        if (sampleStar) onSelectObject(sampleStar);
      }
    },
    {
      stepNumber: 4,
      titleEn: '4. Celestial Time Travel & Diurnal Motion',
      titleSw: '4. Safari ya Wakati na Mzunguko wa Dunia',
      duration: '1:30 – 2:00',
      narrationEn: 'With our Time Travel engine, observers can accelerate time up to 3600× to observe Earth\'s axial rotation in real time. Notice how stars in Zanzibar rise almost vertically from the eastern ocean horizon rather than slanting sideways like in higher latitudes.',
      narrationSw: 'Kupitia mfumo wetu wa Safari ya Wakati, unaweza kuharakisha muda ili kuona Dunia inavyojizungusha na jinsi nyota zinavyochomoza wima kutoka Bahari ya Hindi.',
      actionHintEn: 'Accelerating time to 600× to show diurnal celestial rotation.',
      actionHintSw: 'Tumeharakisha wakati kwa 600× kuonyesha mzunguko wa angani.',
      targetView: 'sky',
      action: () => {
        onNavigateView('sky');
        onTriggerTimeSpeed(600);
      }
    },
    {
      stepNumber: 5,
      titleEn: '5. Moon Explorer & Hilal Sighting Science',
      titleSw: '5. Uchunguzi wa Mwezi na Sayansi ya Hilali',
      duration: '2:00 – 2:30',
      narrationEn: 'In East African maritime and cultural tradition, the lunar crescent (Hilal) is vital. Our Moon Explorer calculates exact illuminated fraction, topocentric distance, and moonrise/moonset, while scientifically distinguishing geometric conjunction from naked-eye optical visibility.',
      narrationSw: 'Katika mila za bahari za Afrika Mashariki, mwandamo wa Mwezi (Hilali) ni muhimu sana. Mfumo wetu unahesabu mwangaza na kueleza sayansi ya kuonekana kwa Hilali.',
      actionHintEn: 'Switching to the dedicated Moon Explorer interface.',
      actionHintSw: 'Tunahamia kwenye ukurasa maalum wa Mwezi.',
      targetView: 'moon',
      action: () => {
        onNavigateView('moon');
      }
    },
    {
      stepNumber: 6,
      titleEn: '6. Practical Observation Planner & Ephemerides',
      titleSw: '6. Mpangilio wa Uchunguzi na Nyakati za Angani',
      duration: '2:30 – 3:00',
      narrationEn: 'Finally, our practical observatory tool: the Zanzibar Observation Planner. Observers plan telescope and binocular sessions with calculated altitude-versus-time curves, dark-sky twilight intervals, transit heights, and ranked visibility ratings. Zanzibar SkyLab provides authentic scientific infrastructure for astronomy across East Africa!',
      narrationSw: 'Chombo chetu cha vitendo cha uchunguzi: mpangilio wa darubini wenye grafu za urefu dhidi ya muda, nyakati za giza nene, na orodha iliyopimwa kisayansi.',
      actionHintEn: 'Navigating to the observation planner and ephemeris curves.',
      actionHintSw: 'Kufungua jopo la kupanga uchunguzi wa usiku.',
      targetView: 'planner',
      action: () => {
        onNavigateView('planner');
      }
    }
  ];

  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (steps[nextIdx].action) steps[nextIdx].action!();
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      if (steps[prevIdx].action) steps[prevIdx].action!();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-4">
      <div className="rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] p-5 text-slate-100 space-y-4">
        {/* Step indicator and close */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Competition Demo Mode · 3-Minute Walkthrough
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {currentStep.duration}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Exit Demo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Presenter Narration Script */}
        <div>
          <h4 className="text-base font-bold text-white">
            {isSw ? currentStep.titleSw : currentStep.titleEn}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed mt-2 bg-slate-800/40 p-3 rounded-xl border border-slate-750">
            <span className="text-[10px] uppercase font-mono text-cyan-400 block font-semibold mb-1">
              Presenter Script / Spoken Narration:
            </span>
            "{isSw ? currentStep.narrationSw : currentStep.narrationEn}"
          </p>
        </div>

        {/* Action Hint */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{isSw ? currentStep.actionHintSw : currentStep.actionHintEn}</span>
          </div>

          {/* Stepper buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400">
              {currentStepIndex + 1} / {steps.length}
            </span>
            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <span>{currentStepIndex === steps.length - 1 ? (isSw ? 'Maliza' : 'Finish') : (isSw ? 'Mbele' : 'Next')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
