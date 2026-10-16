import { Constellation } from './types';

/**
 * Verified constellation line segments and cultural/educational descriptions.
 * Each line segment strictly connects valid catalog star IDs from BRIGHT_STAR_CATALOG.
 */
export const CONSTELLATIONS: Constellation[] = [
  {
    code: 'ORI',
    name: 'Orion',
    swahiliName: 'Kikosi cha Mwindaji',
    englishMeaning: 'The Hunter',
    centerRa: 5.6,
    centerDec: 0.0,
    lines: [
      { fromId: 'HR 2061', toId: 'HR 1790' }, // Betelgeuse - Bellatrix
      { fromId: 'HR 1790', toId: 'HR 1852' }, // Bellatrix - Mintaka
      { fromId: 'HR 2061', toId: 'HR 1948' }, // Betelgeuse - Alnitak
      { fromId: 'HR 1852', toId: 'HR 1903' }, // Mintaka - Alnilam (Belt)
      { fromId: 'HR 1903', toId: 'HR 1948' }, // Alnilam - Alnitak (Belt)
      { fromId: 'HR 1948', toId: 'HR 2004' }, // Alnitak - Saiph
      { fromId: 'HR 1852', toId: 'HR 1713' }, // Mintaka - Rigel
      { fromId: 'HR 2004', toId: 'HR 1713' }, // Saiph - Rigel
      { fromId: 'HR 2061', toId: 'HR 1879' }, // Betelgeuse - Meissa
      { fromId: 'HR 1790', toId: 'HR 1879' }  // Bellatrix - Meissa
    ],
    description: 'Prominent equatorial constellation visible worldwide. In Zanzibar, Orion passes almost directly through the zenith in January and February.',
    descriptionSw: 'Kundi mashuhuri linalopita katikati kabisa ya anga ya Zanzibar (zenith) wakati wa miezi ya Januari na Februari.'
  },
  {
    code: 'CRU',
    name: 'Crux',
    swahiliName: 'Msalaba wa Kusini',
    englishMeaning: 'The Southern Cross',
    centerRa: 12.5,
    centerDec: -60.0,
    lines: [
      { fromId: 'HR 4763', toId: 'HR 4730' }, // Gacrux - Acrux (Major Axis pointing South)
      { fromId: 'HR 4656', toId: 'HR 4853' }, // Imai - Mimosa (Minor Axis)
      { fromId: 'HR 4730', toId: 'HR 4700' }  // Acrux - Ginan
    ],
    description: 'The iconic Southern Cross. At latitude 6° South in Zanzibar, Crux climbs to over 30° above the southern horizon, used for centuries by Swahili sailors for navigation.',
    descriptionSw: 'Kundi muhimu zaidi la kusini. Katika latitudo ya 6° Kusini hapa Zanzibar, Msalaba hupanda juu ya upeo na ulitumiwa na mabaharia wa Kiswahili kutambua Kusini.'
  },
  {
    code: 'CMA',
    name: 'Canis Major',
    swahiliName: 'Mbwa Mkubwa',
    englishMeaning: 'The Greater Dog',
    centerRa: 6.8,
    centerDec: -22.0,
    lines: [
      { fromId: 'HR 2491', toId: 'HR 2294' }, // Sirius - Mirzam
      { fromId: 'HR 2491', toId: 'HR 2693' }, // Sirius - Wezen
      { fromId: 'HR 2693', toId: 'HR 2618' }, // Wezen - Adhara
      { fromId: 'HR 2693', toId: 'HR 2827' }  // Wezen - Aludra
    ],
    description: 'Contains Sirius, the brightest star in the night sky. In coastal East Africa, Sirius is historically known as Suhail / Kilimia marker star.',
    descriptionSw: 'Lina nyota ya Sirius, nyota inayong\'aa zaidi angani kote, inayojulikana katika historia ya pwani ya Afrika Mashariki.'
  },
  {
    code: 'SCO',
    name: 'Scorpius',
    swahiliName: 'Nge',
    englishMeaning: 'The Scorpion',
    centerRa: 16.8,
    centerDec: -30.0,
    lines: [
      { fromId: 'HR 5984', toId: 'HR 5953' }, // Graffias - Dschubba
      { fromId: 'HR 5953', toId: 'HR 6134' }, // Dschubba - Antares
      { fromId: 'HR 6134', toId: 'HR 6149' }, // Antares - Larawag
      { fromId: 'HR 6149', toId: 'HR 6553' }, // Larawag - Sargas
      { fromId: 'HR 6553', toId: 'HR 6527' }, // Sargas - Shaula
      { fromId: 'HR 6527', toId: 'HR 6508' }  // Shaula - Lesath (Stinger)
    ],
    description: 'Magnificent southern constellation with red supergiant Antares at its heart. Dominates Zanzibar skies during the dry season (June to August).',
    descriptionSw: 'Kundi zuri lenye umbo halisi la nge na nyota kubwa nyekundu ya Antares. Huonekana vizuri sana Zanzibar msimu wa kaskazi na kipupwe.'
  },
  {
    code: 'SGR',
    name: 'Sagittarius',
    swahiliName: 'Mshale / Birika',
    englishMeaning: 'The Archer (The Teapot)',
    centerRa: 18.6,
    centerDec: -30.0,
    lines: [
      { fromId: 'HR 6913', toId: 'HR 6859' }, // Kaus Borealis - Kaus Media
      { fromId: 'HR 6859', toId: 'HR 6879' }, // Kaus Media - Kaus Australis
      { fromId: 'HR 6879', toId: 'HR 7348' }, // Kaus Australis - Ascella
      { fromId: 'HR 7348', toId: 'HR 7121' }, // Ascella - Nunki
      { fromId: 'HR 7121', toId: 'HR 6913' }, // Nunki - Kaus Borealis
      { fromId: 'HR 6859', toId: 'HR 6746' }, // Kaus Media - Alnasl (Spout)
      { fromId: 'HR 6913', toId: 'HR 6746' }  // Kaus Borealis - Alnasl
    ],
    description: 'Marks the galactic center of our Milky Way. Forms the famous "Teapot" asterism, pouring steam into the dense southern star clouds.',
    descriptionSw: 'Huelea kuelekea kitovu cha Galaksi yetu ya Njia Nyeupe. Hufanya umbo la birika la chai linaloonekana wazi angani.'
  },
  {
    code: 'TAU',
    name: 'Taurus',
    swahiliName: 'Fahali',
    englishMeaning: 'The Bull',
    centerRa: 4.6,
    centerDec: 20.0,
    lines: [
      { fromId: 'HR 1457', toId: 'HR 1791' }, // Aldebaran - Elnath (Horn)
      { fromId: 'HR 1457', toId: 'HR 1910' }, // Aldebaran - Tianguan
      { fromId: 'HR 1457', toId: 'HR 1165' }  // Aldebaran - Alcyone (Pleiades)
    ],
    description: 'Zodiac constellation featuring reddish Aldebaran and the famous Pleiades (Kilimia in Swahili, marking seasonal agricultural cycles).',
    descriptionSw: 'Kundi lenye nyota ya Aldebaran na Kilimia (Pleiades) inayotumika kihistoria na wakulima wa Zanzibar kutambua msimu wa kupanda.'
  },
  {
    code: 'GEM',
    name: 'Gemini',
    swahiliName: 'Mapacha',
    englishMeaning: 'The Twins',
    centerRa: 7.5,
    centerDec: 24.0,
    lines: [
      { fromId: 'HR 2891', toId: 'HR 2990' }, // Castor - Pollux
      { fromId: 'HR 2891', toId: 'HR 2473' }, // Castor - Mebsuta
      { fromId: 'HR 2473', toId: 'HR 2421' }, // Mebsuta - Alhena
      { fromId: 'HR 2990', toId: 'HR 2777' }, // Pollux - Wasat
      { fromId: 'HR 2777', toId: 'HR 2421' }  // Wasat - Alhena
    ],
    description: 'The celestial twins marked by the bright stars Castor and Pollux.',
    descriptionSw: 'Mapacha wa angani wanaowakilishwa na nyota mbili angavu za Castor na Pollux.'
  },
  {
    code: 'LEO',
    name: 'Leo',
    swahiliName: 'Simba',
    englishMeaning: 'The Lion',
    centerRa: 10.8,
    centerDec: 15.0,
    lines: [
      { fromId: 'HR 3982', toId: 'HR 4057' }, // Regulus - Algieba
      { fromId: 'HR 4057', toId: 'HR 3905' }, // Algieba - Rasalas
      { fromId: 'HR 4057', toId: 'HR 4358' }, // Algieba - Zosma
      { fromId: 'HR 4358', toId: 'HR 4534' }, // Zosma - Denebola
      { fromId: 'HR 3982', toId: 'HR 4534' }  // Regulus - Denebola
    ],
    description: 'Distinctive sickle-shaped head and triangular hindquarters, anchored by royal star Regulus.',
    descriptionSw: 'Umbo maarufu la simba angani linaloongozwa na nyota kuu ya kifalme ya Regulus.'
  },
  {
    code: 'UMA',
    name: 'Ursa Major',
    swahiliName: 'Dubu Mkubwa (Pawa)',
    englishMeaning: 'The Great Bear (The Big Dipper)',
    centerRa: 12.0,
    centerDec: 55.0,
    lines: [
      { fromId: 'HR 4301', toId: 'HR 4295' }, // Dubhe - Merak (Pointers)
      { fromId: 'HR 4295', toId: 'HR 4554' }, // Merak - Phecda
      { fromId: 'HR 4554', toId: 'HR 4660' }, // Phecda - Megrez
      { fromId: 'HR 4660', toId: 'HR 4301' }, // Megrez - Dubhe
      { fromId: 'HR 4660', toId: 'HR 4905' }, // Megrez - Alioth
      { fromId: 'HR 4905', toId: 'HR 5054' }, // Alioth - Mizar
      { fromId: 'HR 5054', toId: 'HR 5191' }  // Mizar - Alkaid
    ],
    description: 'Northern constellation whose famous Dipper asterism skims low on the northern horizon from Zanzibar between March and June.',
    descriptionSw: 'Kundi la kaskazini ambalo huchungulia chini kidogo ya upeo wa kaskazini kutoka Zanzibar kati ya Machi na Juni.'
  },
  {
    code: 'CYG',
    name: 'Cygnus',
    swahiliName: 'Bata Maji (Msalaba wa Kaskazini)',
    englishMeaning: 'The Swan (Northern Cross)',
    centerRa: 20.4,
    centerDec: 42.0,
    lines: [
      { fromId: 'HR 7924', toId: 'HR 7796' }, // Deneb - Sadr
      { fromId: 'HR 7796', toId: 'HR 7417' }, // Sadr - Albireo
      { fromId: 'HR 7528', toId: 'HR 7796' }, // Fawaris - Sadr
      { fromId: 'HR 7796', toId: 'HR 7949' }  // Sadr - Gienah
    ],
    description: 'The Northern Cross flying along the Milky Way with blue-white supergiant Deneb at its tail.',
    descriptionSw: 'Msalaba wa kaskazini unaoruka kando ya Njia Nyeupe ukiongozwa na nyota ya Deneb.'
  },
  {
    code: 'CEN',
    name: 'Centaurus',
    swahiliName: 'Kantara',
    englishMeaning: 'The Centaur',
    centerRa: 14.2,
    centerDec: -50.0,
    lines: [
      { fromId: 'HR 5459', toId: 'HR 5267' }, // Alpha Cen - Beta Cen (Southern Pointers)
      { fromId: 'HR 5267', toId: 'HR 4897' }, // Beta Cen - Muhlifain
      { fromId: 'HR 4897', toId: 'HR 5288' }  // Muhlifain - Menkent
    ],
    description: 'Houses Alpha Centauri, our closest star system (4.37 light years). Its bright stars point directly to the Southern Cross.',
    descriptionSw: 'Nyumba ya mfumo wa nyota ulio karibu zaidi na Jua letu (Alpha Centauri). Nyota zake zinaelekeza kwenye Msalaba wa Kusini.'
  },
  {
    code: 'CAS',
    name: 'Cassiopeia',
    swahiliName: 'Malkia Kasiopia',
    englishMeaning: 'The Queen',
    centerRa: 1.0,
    centerDec: 60.0,
    lines: [
      { fromId: 'HR 21', toId: 'HR 168' },   // Caph - Schedar
      { fromId: 'HR 168', toId: 'HR 264' },  // Schedar - Navi
      { fromId: 'HR 264', toId: 'HR 403' },  // Navi - Ruchbah
      { fromId: 'HR 403', toId: 'HR 542' }   // Ruchbah - Segin
    ],
    description: 'Distinctive W-shaped constellation in the far north. Visible briefly low on the northern horizon from Zanzibar in October–November.',
    descriptionSw: 'Kundi lenye umbo la herufi "W" upande wa kaskazini mbali linaloonekana chini kwenye upeo wa Zanzibar miezi ya Oktoba na Novemba.'
  },
  {
    code: 'LYR',
    name: 'Lyra',
    swahiliName: 'Kinubi',
    englishMeaning: 'The Lyre / Harp',
    centerRa: 18.8,
    centerDec: 36.0,
    lines: [
      { fromId: 'HR 7001', toId: 'HR 7106' }, // Vega - Sheliak
      { fromId: 'HR 7106', toId: 'HR 7178' }  // Sheliak - Sulafat
    ],
    description: 'Compact constellation centered on sapphire-white Vega, the zero-point of the astronomical magnitude scale.',
    descriptionSw: 'Kundi lenye nyota angavu ya Vega, kielelezo cha kipimo cha mwangaza wa nyota ulimwenguni.'
  },
  {
    code: 'PEG',
    name: 'Pegasus',
    swahiliName: 'Farasi Mwenye Mabawa',
    englishMeaning: 'The Winged Horse',
    centerRa: 23.0,
    centerDec: 20.0,
    lines: [
      { fromId: 'HR 8781', toId: 'HR 8775' }, // Markab - Scheat
      { fromId: 'HR 8775', toId: 'HR 15' },   // Scheat - Alpheratz
      { fromId: 'HR 15', toId: 'HR 8880' },   // Alpheratz - Algenib
      { fromId: 'HR 8880', toId: 'HR 8781' }, // Algenib - Markab (Great Square)
      { fromId: 'HR 8781', toId: 'HR 8308' }  // Markab - Enif
    ],
    description: 'Forms the Great Square of Pegasus, a gigantic celestial landmark visible across northern and equatorial skies.',
    descriptionSw: 'Hufanya umbo la mraba mkubwa wa Pegasus unaoonekana wazi angani wakati wa mwanzo wa mwaka.'
  }
];
