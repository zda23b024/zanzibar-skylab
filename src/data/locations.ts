import { ObserverLocation } from './types';

/**
 * Observer location presets for the Zanzibar Observation Network.
 * Coordinates are documented approximate reference values for coastal and island stations.
 * Time zone for all locations: East Africa Time (UTC+03:00 / Africa/Dar_es_Salaam).
 */
export const OBSERVER_PRESETS: ObserverLocation[] = [
  {
    id: 'stone-town',
    name: 'Stone Town Observatory, Unguja',
    swahiliName: 'Kituo cha Mji Mkongwe, Unguja',
    latitude: -6.1659,
    longitude: 39.2026,
    elevation: 5,
    timeZone: 'Africa/Dar_es_Salaam',
    description: 'Western coastal station on Unguja. Prime reference for maritime horizon observations and civic astronomy.',
    descriptionSw: 'Kituo cha pwani ya magharibi ya Unguja. Kielelezo kikuu cha unajimu wa bahari.'
  },
  {
    id: 'nungwi',
    name: 'Nungwi Observatory, North Unguja',
    swahiliName: 'Kituo cha Nungwi, Kaskazini mwa Unguja',
    latitude: -5.7264,
    longitude: 39.2981,
    elevation: 3,
    timeZone: 'Africa/Dar_es_Salaam',
    description: 'Northern tip of Unguja with panoramic 270-degree ocean horizon and low municipal light interference.',
    descriptionSw: 'Ncha ya kaskazini ya Unguja yenye upeo mpana wa bahari na giza zuri la asili.'
  },
  {
    id: 'paje',
    name: 'Paje Station, East Unguja',
    swahiliName: 'Kituo cha Paje, Mashariki mwa Unguja',
    latitude: -6.2655,
    longitude: 39.5339,
    elevation: 4,
    timeZone: 'Africa/Dar_es_Salaam',
    description: 'Eastern reef coast with unobstructed open horizon facing the Indian Ocean for early morning rise observations.',
    descriptionSw: 'Pwani ya mashariki inayoelekea Bahari ya Hindi, inafaa sana kwa kuchomoza kwa nyota alfajiri.'
  },
  {
    id: 'jambiani',
    name: 'Jambiani Station, Southeast Unguja',
    swahiliName: 'Kituo cha Jambiani, Kusini-Mashariki mwa Unguja',
    latitude: -6.3183,
    longitude: 39.5447,
    elevation: 4,
    timeZone: 'Africa/Dar_es_Salaam',
    description: 'Southeastern dark-sky coastal baseline. Minimal artificial skyglow for southern hemisphere tracking.',
    descriptionSw: 'Ukanda wa giza wa kusini-mashariki mwa Unguja, mzuri kwa kufuatilia anga ya kusini.'
  },
  {
    id: 'chake-chake',
    name: 'Chake Chake Station, Pemba Island',
    swahiliName: 'Kituo cha Chake Chake, Kisiwa cha Pemba',
    latitude: -5.2458,
    longitude: 39.7719,
    elevation: 18,
    timeZone: 'Africa/Dar_es_Salaam',
    description: 'Central elevated plateau on Pemba Island. Elevated marine atmosphere with high stellar transparency.',
    descriptionSw: 'Uwanda wa kati wa kisiwa cha Pemba wenye hewa safi na unyevu mdogo wa upeoni.'
  },
  {
    id: 'wete',
    name: 'Wete Station, North Pemba',
    swahiliName: 'Kituo cha Wete, Kaskazini mwa Pemba',
    latitude: -5.0569,
    longitude: 39.7289,
    elevation: 22,
    timeZone: 'Africa/Dar_es_Salaam',
    description: 'Northernmost station in the Zanzibar archipelago (-5.05° S). Lowest latitude for northern circumpolar visibility.',
    descriptionSw: 'Kituo cha kaskazini kabisa cha funguvisiwa la Zanzibar. Kina urefu mzuri wa kuona nyota za kaskazini.'
  },
  {
    id: 'dar-es-salaam',
    name: 'Dar es Salaam Baseline, Mainland',
    swahiliName: 'Kituo cha Dar es Salaam, Pwani ya Bara',
    latitude: -6.7924,
    longitude: 39.2083,
    elevation: 14,
    timeZone: 'Africa/Dar_es_Salaam',
    description: 'Mainland coastal port baseline 72 km southwest across the Zanzibar Channel for cross-channel parallax evaluation.',
    descriptionSw: 'Kituo cha kielelezo cha pwani ya bara kwa ajili ya kulinganisha anga kuvuka Mkondo wa Zanzibar.'
  }
];

export const DEFAULT_OBSERVER = OBSERVER_PRESETS[0];
