/**
 * Zanzibar SkyLab - Scientific & Observational Guides
 * High-level scientific reference documents for interpreting equatorial celestial mechanics.
 */

export interface ScientificGuide {
  id: string;
  title: string;
  titleSw: string;
  category: string;
  readTime: string;
  summary: string;
  summarySw: string;
  content: string[];
  contentSw: string[];
}

export const SCIENTIFIC_GUIDES: ScientificGuide[] = [
  {
    id: 'equatorial-sky',
    title: 'Equatorial Celestial Mechanics at 6° South',
    titleSw: 'Makanika ya Anga ya Ikweta (Nyuzi 6 Kusini)',
    category: 'Orbital Geometry',
    readTime: '3 min read',
    summary: 'The geometric and observational implications of Zanzibar\'s low-latitude celestial horizon.',
    summarySw: 'Upekee wa kijiometri wa anga la Zanzibar lililopo nyuzi 6 kusini mwa ikweta.',
    content: [
      'Located at latitude -6.17° S, Zanzibar enjoys one of the most comprehensive celestial vantage points on Earth. Over a 12-month period, approximately 98.5% of the total celestial sphere passes above the local horizon.',
      'Unlike high-latitude observatories where stars trace shallow oblique arcs across the sky, equatorial celestial paths intersect the horizon at steep, near-vertical angles (83.8° to the horizon). This produces rapid transitions through the dense atmospheric boundary layer.',
      'The celestial equator passes within 6.17° of the local zenith, allowing simultaneous observation of northern asterisms (such as the Big Dipper/Ursa Major low on the northern horizon) and southern milestones (Crux/the Southern Cross at 30° altitude).'
    ],
    contentSw: [
      'Ikiwa ipo katika latitudo ya nyuzi 6.17 Kusini, Zanzibar ina mojawapo ya mitazamo mipana zaidi ya angani duniani. Katika kipindi cha miezi 12, takriban 98.5% ya anga yote ya ulimwengu hupita juu ya upeo wake.',
      'Tofauti na nchi za mbali na ikweta ambako nyota hupita kwa mshazari, miili ya mbinguni hapa Zanzibar huchomoza na kuzama kwa pembe ya wima (nyuzi 83.8), hivyo kuondoka haraka katika hewa chafu ya chini.',
      'Ikweta ya angani inapita nyuzi 6.17 tu kando ya kitovu cha juu (zenith), hali inayowezesha kuona makundi ya kaskazini (kama Dubu Mkubwa) na ya kusini (kama Msalaba wa Kusini) kwa pamoja.'
    ]
  },
  {
    id: 'swahili-navigation',
    title: 'Historic Swahili Maritime Stellar Navigation',
    titleSw: 'Sayansi ya Mabaharia wa Kiswahili wa Bahari ya Hindi',
    category: 'Archaeoastronomy & History',
    readTime: '4 min read',
    summary: 'Empirical celestial methods developed by Swahili dhow captains over eight centuries of oceanic trade.',
    summarySw: 'Mbinu za kisayansi zilizotumiwa na manahodha wa majahazi ya Zanzibar katika Bahari ya Hindi.',
    content: [
      'For over eight centuries, dhow (jahazi) captains operating between Zanzibar, Kilwa, Oman, and Gujarat relied on the celestial clockwork of the Indian Ocean monsoon winds (Kaskazi and Kusi) and precise stellar altitudes.',
      'The Southern Cross (Crux) was the primary compass for finding true South. By extending the major axis from Gacrux through Acrux 4.5 times downwards, navigators pinpointed the South Celestial Pole.',
      'Polaris (known historically as Al-Jaddi) provided a direct latitude measurement for northbound voyages toward the Arabian Sea. Navigators used the "isba" (finger width, approximately 1°36\') with a kamal instrument to measure Polaris elevation.',
      'The Pleiades open cluster (known in Swahili as Kilimia) marked the onset of agricultural planting seasons and the shifting of the trade winds across the Swahili coast.'
    ],
    contentSw: [
      'Kwa zaidi ya karne nane, manahodha wa majahazi kati ya Zanzibar, Kilwa, Oman, na Bara Hindi walitegemea urefu halisi wa nyota angani kuongoza safari zao za baharini.',
      'Kundi la Msalaba wa Kusini (Crux) lilikuwa dira kuu ya kutambua Kusini kamili. Mstari kati ya Gacrux na Acrux uliteremshwa chini mara 4.5 ili kupata Ncha ya Kusini ya anga.',
      'Nyota ya Polaris (Al-Jaddi) ilitumiwa kupima latitudo kuelekea kaskazini kwa kutumia kifaa cha kitamaduni cha kamal.',
      'Kundi la Kilimia (Pleiades) lilitumika kama kalenda ya msimu wa mvua za masika na kilimo katika jamii za pwani ya Afrika Mashariki.'
    ]
  },
  {
    id: 'crescent-visibility-hilal',
    title: 'Optics of Lunar Crescent (Hilal) Visibility',
    titleSw: 'Fizikia na Elimu ya Mwangaza wa Hilali',
    category: 'Observational Optics',
    readTime: '3 min read',
    summary: 'Distinguishing mathematical geocentric conjunction from optical naked-eye crescent observation.',
    summarySw: 'Tofauti ya kisayansi kati ya muungano wa angani na kuonekana halisi kwa Hilali kwa macho.',
    content: [
      'Astronomical "New Moon" occurs at the exact instant of geocentric conjunction, when the Moon passes directly between Earth and Sun. At conjunction, the Moon is in total solar glare and optically invisible from Earth.',
      'Naked-eye crescent visibility (Hilal) requires sufficient solar elongation (typically >= 8.5° to 10.5° according to the Danjon and Yallop criteria) to create a perceptible luminous crescent contrast against the sunset horizon.',
      'Key observational parameters from Zanzibar include Moonset lag time (the interval between sunset and moonset, typically requiring >= 35 to 45 minutes) and low coastal atmospheric extinction.',
      'Zanzibar SkyLab computes deterministic astronomical phase and topocentric coordinates, providing empirical data to evaluate observation feasibility.'
    ],
    contentSw: [
      'Mwezi Mpya wa kijiometri (conjunction) hutokea pale Mwezi unapokaa kwenye mstari mmoja kati ya Dunia na Jua. Wakati huu, mwezi huwa giza kabisa na hauwezi kuonekana kwa darubini wala macho.',
      'Kuonekana kwa Hilali kwa macho kunahitaji pembe ya kujitenga (elongation) ya angalau nyuzi 8.5 hadi 10.5 ili mwangaza wake uweze kushinda mwangaza wa machweo.',
      'Vigezo muhimu kwa Zanzibar ni muda wa kuchelewa kutua kwa mwezi (lag time ya dakika 35 hadi 45 baada ya Jua kuzama) na uwazi wa hewa ya baharini bila ukungu.',
      'Zanzibar SkyLab inatoa hesabu sahihi za kimahesabu ili kuwawezesha waangalizi kuthibitisha uwezekano wa kuonekana kwa Hilali kisayansi.'
    ]
  }
];
