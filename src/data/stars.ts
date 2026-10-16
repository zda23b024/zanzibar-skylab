import { Star } from './types';

/**
 * Zanzibar SkyLab Verified Bright Star Catalog.
 * Primary source: Yale Bright Star Catalog (BSC5 / Hoffleit & Warren 1991) and Hipparcos (ESA 1997).
 * Coordinate Epoch: J2000.0.
 * Right Ascension (ra) is expressed in decimal hours [0, 24).
 * Declination (dec) is expressed in decimal degrees [-90, +90].
 * Magnitudes (vmag) are Johnson V-band visual magnitudes.
 * Colors are scientifically accurate RGB hex codes based on spectral temperature and B-V color index.
 */
export const BRIGHT_STAR_CATALOG: Star[] = [
  // --- ORION ---
  { id: 'HR 2061', name: 'Betelgeuse', bayer: 'α Ori', ra: 5.9195, dec: 7.4071, vmag: 0.50, spectral: 'M1-2Ia-ab', color: '#ffb380', constellation: 'ORI' },
  { id: 'HR 1713', name: 'Rigel', bayer: 'β Ori', ra: 5.2423, dec: -8.2016, vmag: 0.18, spectral: 'B8Ia', color: '#cad8ff', constellation: 'ORI' },
  { id: 'HR 1790', name: 'Bellatrix', bayer: 'γ Ori', ra: 5.4189, dec: 6.3497, vmag: 1.64, spectral: 'B2III', color: '#c2d4ff', constellation: 'ORI' },
  { id: 'HR 2004', name: 'Saiph', bayer: 'κ Ori', ra: 5.7959, dec: -9.6696, vmag: 2.07, spectral: 'B0.5Ia', color: '#bad0ff', constellation: 'ORI' },
  { id: 'HR 1948', name: 'Alnitak', bayer: 'ζ Ori', ra: 5.6793, dec: -1.9426, vmag: 1.74, spectral: 'O9.7Ib', color: '#b5ccff', constellation: 'ORI' },
  { id: 'HR 1903', name: 'Alnilam', bayer: 'ε Ori', ra: 5.6036, dec: -1.2019, vmag: 1.69, spectral: 'B0Ia', color: '#b8ceff', constellation: 'ORI' },
  { id: 'HR 1852', name: 'Mintaka', bayer: 'δ Ori', ra: 5.5334, dec: -0.2991, vmag: 2.25, spectral: 'O9.5II', color: '#b5ccff', constellation: 'ORI' },
  { id: 'HR 1879', name: 'Meissa', bayer: 'λ Ori', ra: 5.5858, dec: 9.9342, vmag: 3.39, spectral: 'O8III', color: '#b2caff', constellation: 'ORI' },

  // --- CANIS MAJOR & MINOR ---
  { id: 'HR 2491', name: 'Sirius', bayer: 'α CMa', ra: 6.7525, dec: -16.7161, vmag: -1.46, spectral: 'A1V', color: '#eef3ff', constellation: 'CMA' },
  { id: 'HR 2618', name: 'Adhara', bayer: 'ε CMa', ra: 6.9771, dec: -28.9721, vmag: 1.50, spectral: 'B2II', color: '#c2d4ff', constellation: 'CMA' },
  { id: 'HR 2693', name: 'Wezen', bayer: 'δ CMa', ra: 7.1403, dec: -26.3932, vmag: 1.83, spectral: 'F8Ia', color: '#fff1d6', constellation: 'CMA' },
  { id: 'HR 2294', name: 'Mirzam', bayer: 'β CMa', ra: 6.3783, dec: -17.9559, vmag: 1.98, spectral: 'B1II-III', color: '#bdd1ff', constellation: 'CMA' },
  { id: 'HR 2827', name: 'Aludra', bayer: 'η CMa', ra: 7.4015, dec: -29.3031, vmag: 2.45, spectral: 'B5Ia', color: '#c8d7ff', constellation: 'CMA' },
  { id: 'HR 2943', name: 'Procyon', bayer: 'α CMi', ra: 7.6550, dec: 5.2250, vmag: 0.38, spectral: 'F5IV-V', color: '#fff4e4', constellation: 'CMI' },
  { id: 'HR 2845', name: 'Gomeisa', bayer: 'β CMi', ra: 7.4533, dec: 8.2883, vmag: 2.89, spectral: 'B8Ve', color: '#cad8ff', constellation: 'CMI' },

  // --- CRUX (SOUTHERN CROSS) ---
  { id: 'HR 4730', name: 'Acrux', bayer: 'α Cru', ra: 12.4433, dec: -63.0991, vmag: 0.77, spectral: 'B0.5IV', color: '#bad0ff', constellation: 'CRU' },
  { id: 'HR 4853', name: 'Mimosa', bayer: 'β Cru', ra: 12.7953, dec: -59.6888, vmag: 1.25, spectral: 'B0.5III', color: '#bad0ff', constellation: 'CRU' },
  { id: 'HR 4763', name: 'Gacrux', bayer: 'γ Cru', ra: 12.5194, dec: -57.1137, vmag: 1.64, spectral: 'M3.5III', color: '#ffb070', constellation: 'CRU' },
  { id: 'HR 4656', name: 'Imai', bayer: 'δ Cru', ra: 12.2514, dec: -58.7489, vmag: 2.79, spectral: 'B2IV', color: '#c2d4ff', constellation: 'CRU' },
  { id: 'HR 4700', name: 'Ginan', bayer: 'ε Cru', ra: 12.3553, dec: -60.4011, vmag: 3.59, spectral: 'K3III', color: '#ffc88a', constellation: 'CRU' },

  // --- CENTAURUS ---
  { id: 'HR 5459', name: 'Rigil Kentaurus', bayer: 'α Cen', ra: 14.6601, dec: -60.8339, vmag: -0.01, spectral: 'G2V', color: '#fff2db', constellation: 'CEN' },
  { id: 'HR 5267', name: 'Hadar', bayer: 'β Cen', ra: 14.0637, dec: -60.3731, vmag: 0.61, spectral: 'B1III', color: '#bdd1ff', constellation: 'CEN' },
  { id: 'HR 5288', name: 'Menkent', bayer: 'θ Cen', ra: 14.1111, dec: -36.3699, vmag: 2.06, spectral: 'K0III', color: '#ffcf94', constellation: 'CEN' },
  { id: 'HR 4897', name: 'Muhlifain', bayer: 'γ Cen', ra: 12.6922, dec: -48.9603, vmag: 2.20, spectral: 'A1IV', color: '#eef3ff', constellation: 'CEN' },

  // --- CARINA ---
  { id: 'HR 2326', name: 'Canopus', bayer: 'α Car', ra: 6.3992, dec: -52.6957, vmag: -0.74, spectral: 'A9II', color: '#f8f9ff', constellation: 'CAR' },
  { id: 'HR 3685', name: 'Miaplacidus', bayer: 'β Car', ra: 9.2206, dec: -69.7172, vmag: 1.67, spectral: 'A1III', color: '#eef3ff', constellation: 'CAR' },
  { id: 'HR 3307', name: 'Avior', bayer: 'ε Car', ra: 8.3753, dec: -59.5094, vmag: 1.86, spectral: 'K3III+B2V', color: '#ffc88a', constellation: 'CAR' },
  { id: 'HR 3699', name: 'Aspidiske', bayer: 'ι Car', ra: 9.2848, dec: -59.2753, vmag: 2.21, spectral: 'A8Ib', color: '#f8f9ff', constellation: 'CAR' },

  // --- SCORPIUS ---
  { id: 'HR 6134', name: 'Antares', bayer: 'α Sco', ra: 16.4901, dec: -26.4320, vmag: 0.96, spectral: 'M1.5Iab', color: '#ff9c54', constellation: 'SCO' },
  { id: 'HR 6527', name: 'Shaula', bayer: 'λ Sco', ra: 17.5601, dec: -37.1038, vmag: 1.62, spectral: 'B2IV', color: '#c2d4ff', constellation: 'SCO' },
  { id: 'HR 6553', name: 'Sargas', bayer: 'θ Sco', ra: 17.6225, dec: -42.9978, vmag: 1.86, spectral: 'F0II', color: '#fff6ec', constellation: 'SCO' },
  { id: 'HR 5953', name: 'Dschubba', bayer: 'δ Sco', ra: 16.0055, dec: -22.6217, vmag: 2.29, spectral: 'B0.3IV', color: '#bad0ff', constellation: 'SCO' },
  { id: 'HR 5984', name: 'Graffias', bayer: 'β Sco', ra: 16.0906, dec: -19.8054, vmag: 2.56, spectral: 'B1V', color: '#bdd1ff', constellation: 'SCO' },
  { id: 'HR 6149', name: 'Larawag', bayer: 'ε Sco', ra: 16.8368, dec: -34.2933, vmag: 2.29, spectral: 'K2.5IIIb', color: '#ffc580', constellation: 'SCO' },
  { id: 'HR 6508', name: 'Lesath', bayer: 'υ Sco', ra: 17.5131, dec: -37.2961, vmag: 2.70, spectral: 'B2IV', color: '#c2d4ff', constellation: 'SCO' },

  // --- SAGITTARIUS (THE TEAPOT) ---
  { id: 'HR 6879', name: 'Kaus Australis', bayer: 'ε Sgr', ra: 18.4029, dec: -34.3846, vmag: 1.79, spectral: 'B9.5III', color: '#dbe5ff', constellation: 'SGR' },
  { id: 'HR 7121', name: 'Nunki', bayer: 'σ Sgr', ra: 18.9211, dec: -26.2967, vmag: 2.05, spectral: 'B2.5V', color: '#c2d4ff', constellation: 'SGR' },
  { id: 'HR 7348', name: 'Ascella', bayer: 'ζ Sgr', ra: 19.0434, dec: -29.8801, vmag: 2.60, spectral: 'A2.5Va', color: '#eef3ff', constellation: 'SGR' },
  { id: 'HR 6859', name: 'Kaus Media', bayer: 'δ Sgr', ra: 18.3496, dec: -29.8281, vmag: 2.72, spectral: 'K3III', color: '#ffc88a', constellation: 'SGR' },
  { id: 'HR 6913', name: 'Kaus Borealis', bayer: 'λ Sgr', ra: 18.4663, dec: -25.4219, vmag: 2.82, spectral: 'K0IV', color: '#ffcf94', constellation: 'SGR' },
  { id: 'HR 6746', name: 'Alnasl', bayer: 'γ2 Sgr', ra: 18.0967, dec: -30.4244, vmag: 2.98, spectral: 'K0III', color: '#ffcf94', constellation: 'SGR' },

  // --- TAURUS ---
  { id: 'HR 1457', name: 'Aldebaran', bayer: 'α Tau', ra: 4.5987, dec: 16.5093, vmag: 0.85, spectral: 'K5III', color: '#ffbe6b', constellation: 'TAU' },
  { id: 'HR 1791', name: 'Elnath', bayer: 'β Tau', ra: 5.4381, dec: 28.6075, vmag: 1.65, spectral: 'B7III', color: '#cad8ff', constellation: 'TAU' },
  { id: 'HR 1165', name: 'Alcyone', bayer: 'η Tau', ra: 3.7900, dec: 24.1051, vmag: 2.87, spectral: 'B7IIIe', color: '#cad8ff', constellation: 'TAU' },
  { id: 'HR 1910', name: 'Tianguan', bayer: 'ζ Tau', ra: 5.6275, dec: 21.1426, vmag: 2.97, spectral: 'B2IIIpe', color: '#c2d4ff', constellation: 'TAU' },

  // --- GEMINI ---
  { id: 'HR 2990', name: 'Pollux', bayer: 'β Gem', ra: 7.7553, dec: 28.0262, vmag: 1.15, spectral: 'K0III', color: '#ffcf94', constellation: 'GEM' },
  { id: 'HR 2891', name: 'Castor', bayer: 'α Gem', ra: 7.5767, dec: 31.8883, vmag: 1.58, spectral: 'A1V+A2V', color: '#eef3ff', constellation: 'GEM' },
  { id: 'HR 2421', name: 'Alhena', bayer: 'γ Gem', ra: 6.6285, dec: 16.3992, vmag: 1.93, spectral: 'A1.5IV+', color: '#eef3ff', constellation: 'GEM' },
  { id: 'HR 2777', name: 'Wasat', bayer: 'δ Gem', ra: 7.3353, dec: 21.9824, vmag: 3.53, spectral: 'F0IV', color: '#fff6ec', constellation: 'GEM' },
  { id: 'HR 2473', name: 'Mebsuta', bayer: 'ε Gem', ra: 6.7329, dec: 25.1311, vmag: 3.06, spectral: 'G8Ib', color: '#ffe4b5', constellation: 'GEM' },

  // --- LEO ---
  { id: 'HR 3982', name: 'Regulus', bayer: 'α Leo', ra: 10.1395, dec: 11.9672, vmag: 1.36, spectral: 'B8IVn', color: '#cad8ff', constellation: 'LEO' },
  { id: 'HR 4057', name: 'Algieba', bayer: 'γ1 Leo', ra: 10.3331, dec: 19.8415, vmag: 2.01, spectral: 'K0III', color: '#ffcf94', constellation: 'LEO' },
  { id: 'HR 4534', name: 'Denebola', bayer: 'β Leo', ra: 11.8177, dec: 14.5721, vmag: 2.14, spectral: 'A3V', color: '#eef3ff', constellation: 'LEO' },
  { id: 'HR 4358', name: 'Zosma', bayer: 'δ Leo', ra: 11.2354, dec: 20.5239, vmag: 2.56, spectral: 'A4V', color: '#eef3ff', constellation: 'LEO' },
  { id: 'HR 3905', name: 'Rasalas', bayer: 'μ Leo', ra: 9.8797, dec: 26.0068, vmag: 3.88, spectral: 'K2III', color: '#ffc88a', constellation: 'LEO' },

  // --- URSA MAJOR (THE BIG DIPPER / PLOUGH) ---
  { id: 'HR 4301', name: 'Dubhe', bayer: 'α UMa', ra: 11.0622, dec: 61.7508, vmag: 1.81, spectral: 'K0III', color: '#ffcf94', constellation: 'UMA' },
  { id: 'HR 4295', name: 'Merak', bayer: 'β UMa', ra: 11.0307, dec: 56.3824, vmag: 2.34, spectral: 'A1V', color: '#eef3ff', constellation: 'UMA' },
  { id: 'HR 4554', name: 'Phecda', bayer: 'γ UMa', ra: 11.8971, dec: 53.6948, vmag: 2.41, spectral: 'A0V', color: '#eef3ff', constellation: 'UMA' },
  { id: 'HR 4660', name: 'Megrez', bayer: 'δ UMa', ra: 12.2571, dec: 57.0326, vmag: 3.32, spectral: 'A3V', color: '#eef3ff', constellation: 'UMA' },
  { id: 'HR 4905', name: 'Alioth', bayer: 'ε UMa', ra: 12.9004, dec: 55.9598, vmag: 1.76, spectral: 'A1III-IVp', color: '#eef3ff', constellation: 'UMA' },
  { id: 'HR 5054', name: 'Mizar', bayer: 'ζ UMa', ra: 13.3987, dec: 54.9254, vmag: 2.23, spectral: 'A2V', color: '#eef3ff', constellation: 'UMA' },
  { id: 'HR 5191', name: 'Alkaid', bayer: 'η UMa', ra: 13.7924, dec: 49.3133, vmag: 1.85, spectral: 'B3V', color: '#c2d4ff', constellation: 'UMA' },

  // --- URSA MINOR ---
  { id: 'HR 897', name: 'Polaris', bayer: 'α UMi', ra: 2.5303, dec: 89.2641, vmag: 1.97, spectral: 'F7Ib', color: '#fff4e4', constellation: 'UMI' },
  { id: 'HR 5563', name: 'Kochab', bayer: 'β UMi', ra: 14.8451, dec: 74.1555, vmag: 2.07, spectral: 'K4III', color: '#ffc37a', constellation: 'UMI' },

  // --- CYGNUS (NORTHERN CROSS) ---
  { id: 'HR 7924', name: 'Deneb', bayer: 'α Cyg', ra: 20.6905, dec: 45.2803, vmag: 1.25, spectral: 'A2Ia', color: '#eef3ff', constellation: 'CYG' },
  { id: 'HR 7417', name: 'Albireo', bayer: 'β1 Cyg', ra: 19.5126, dec: 27.9597, vmag: 3.05, spectral: 'K2II', color: '#ffc88a', constellation: 'CYG' },
  { id: 'HR 7796', name: 'Sadr', bayer: 'γ Cyg', ra: 20.3732, dec: 40.2567, vmag: 2.23, spectral: 'F8Ib', color: '#fff1d6', constellation: 'CYG' },
  { id: 'HR 7949', name: 'Gienah', bayer: 'ε Cyg', ra: 20.7700, dec: 33.9703, vmag: 2.48, spectral: 'K0III', color: '#ffcf94', constellation: 'CYG' },
  { id: 'HR 7528', name: 'Fawaris', bayer: 'δ Cyg', ra: 19.7494, dec: 45.1308, vmag: 2.86, spectral: 'B9.5IV+', color: '#dbe5ff', constellation: 'CYG' },

  // --- LYRA ---
  { id: 'HR 7001', name: 'Vega', bayer: 'α Lyr', ra: 18.6156, dec: 38.7837, vmag: 0.03, spectral: 'A0Va', color: '#eef3ff', constellation: 'LYR' },
  { id: 'HR 7178', name: 'Sulafat', bayer: 'γ Lyr', ra: 18.9822, dec: 32.6917, vmag: 3.25, spectral: 'B9III', color: '#dbe5ff', constellation: 'LYR' },
  { id: 'HR 7106', name: 'Sheliak', bayer: 'β Lyr', ra: 18.8347, dec: 33.3627, vmag: 3.52, spectral: 'B8II-III', color: '#cad8ff', constellation: 'LYR' },

  // --- AQUILA ---
  { id: 'HR 7557', name: 'Altair', bayer: 'α Aql', ra: 19.8464, dec: 8.8683, vmag: 0.77, spectral: 'A7V', color: '#f8f9ff', constellation: 'AQL' },
  { id: 'HR 7525', name: 'Tarazed', bayer: 'γ Aql', ra: 19.7712, dec: 10.6133, vmag: 2.72, spectral: 'K3II', color: '#ffc88a', constellation: 'AQL' },
  { id: 'HR 7602', name: 'Alshain', bayer: 'β Aql', ra: 19.9228, dec: 6.4069, vmag: 3.71, spectral: 'G8IV', color: '#ffe4b5', constellation: 'AQL' },

  // --- BOÖTES ---
  { id: 'HR 5340', name: 'Arcturus', bayer: 'α Boo', ra: 14.2610, dec: 19.1824, vmag: -0.05, spectral: 'K1.5III', color: '#ffc88a', constellation: 'BOO' },
  { id: 'HR 5506', name: 'Izar', bayer: 'ε Boo', ra: 14.7498, dec: 27.0742, vmag: 2.35, spectral: 'K0II-III', color: '#ffcf94', constellation: 'BOO' },
  { id: 'HR 5198', name: 'Muphrid', bayer: 'η Boo', ra: 13.9115, dec: 18.3975, vmag: 2.68, spectral: 'G0IV', color: '#fff3db', constellation: 'BOO' },

  // --- VIRGO ---
  { id: 'HR 5056', name: 'Spica', bayer: 'α Vir', ra: 13.4199, dec: -11.1613, vmag: 0.98, spectral: 'B1III-IV', color: '#bdd1ff', constellation: 'VIR' },
  { id: 'HR 4825', name: 'Porrima', bayer: 'γ Vir', ra: 12.6943, dec: -1.4497, vmag: 2.74, spectral: 'F0V+F0V', color: '#fff6ec', constellation: 'VIR' },
  { id: 'HR 4910', name: 'Vindemiatrix', bayer: 'ε Vir', ra: 13.0363, dec: 10.9592, vmag: 2.85, spectral: 'G8III', color: '#ffe4b5', constellation: 'VIR' },

  // --- CASSIOPEIA ---
  { id: 'HR 168', name: 'Schedar', bayer: 'α Cas', ra: 0.6751, dec: 56.5373, vmag: 2.24, spectral: 'K0IIIa', color: '#ffcf94', constellation: 'CAS' },
  { id: 'HR 21', name: 'Caph', bayer: 'β Cas', ra: 0.1528, dec: 59.1498, vmag: 2.28, spectral: 'F2III', color: '#fff6ec', constellation: 'CAS' },
  { id: 'HR 264', name: 'Navi', bayer: 'γ Cas', ra: 0.9451, dec: 60.7167, vmag: 2.15, spectral: 'B0.5IVe', color: '#bad0ff', constellation: 'CAS' },
  { id: 'HR 403', name: 'Ruchbah', bayer: 'δ Cas', ra: 1.4278, dec: 60.2353, vmag: 2.66, spectral: 'A5III-IV', color: '#eef3ff', constellation: 'CAS' },
  { id: 'HR 542', name: 'Segin', bayer: 'ε Cas', ra: 1.9056, dec: 63.6701, vmag: 3.35, spectral: 'B3V', color: '#c2d4ff', constellation: 'CAS' },

  // --- PEGASUS & ANDROMEDA ---
  { id: 'HR 8775', name: 'Scheat', bayer: 'β Peg', ra: 23.0636, dec: 28.0828, vmag: 2.44, spectral: 'M2.5II-III', color: '#ff9c54', constellation: 'PEG' },
  { id: 'HR 8781', name: 'Markab', bayer: 'α Peg', ra: 23.0793, dec: 15.2053, vmag: 2.49, spectral: 'B9.5III', color: '#dbe5ff', constellation: 'PEG' },
  { id: 'HR 8880', name: 'Algenib', bayer: 'γ Peg', ra: 0.2206, dec: 15.1836, vmag: 2.84, spectral: 'B2IV', color: '#c2d4ff', constellation: 'PEG' },
  { id: 'HR 8308', name: 'Enif', bayer: 'ε Peg', ra: 21.7364, dec: 9.8750, vmag: 2.38, spectral: 'K2Ib', color: '#ffc88a', constellation: 'PEG' },
  { id: 'HR 15', name: 'Alpheratz', bayer: 'α And', ra: 0.1398, dec: 29.0904, vmag: 2.07, spectral: 'B8IVpMnHg', color: '#cad8ff', constellation: 'AND' },
  { id: 'HR 337', name: 'Mirach', bayer: 'β And', ra: 1.1622, dec: 35.6206, vmag: 2.07, spectral: 'M0III', color: '#ffaa66', constellation: 'AND' },
  { id: 'HR 603', name: 'Almach', bayer: 'γ1 And', ra: 2.0649, dec: 42.3297, vmag: 2.10, spectral: 'K3IIb', color: '#ffc88a', constellation: 'AND' },

  // --- ERIDANUS & SOUTHERN STARS ---
  { id: 'HR 658', name: 'Achernar', bayer: 'α Eri', ra: 1.6286, dec: -57.2367, vmag: 0.45, spectral: 'B6Vep', color: '#c8d7ff', constellation: 'ERI' },
  { id: 'HR 8728', name: 'Fomalhaut', bayer: 'α PsA', ra: 22.9608, dec: -29.6222, vmag: 1.17, spectral: 'A3V', color: '#eef3ff', constellation: 'PSA' },
  { id: 'HR 8425', name: 'Alnair', bayer: 'α Gru', ra: 22.1372, dec: -46.9609, vmag: 1.73, spectral: 'B6V', color: '#c8d7ff', constellation: 'GRU' },
  { id: 'HR 8636', name: 'Tiaki', bayer: 'β Gru', ra: 22.7111, dec: -46.8847, vmag: 2.11, spectral: 'M5III', color: '#ff9040', constellation: 'GRU' },
  { id: 'HR 7790', name: 'Peacock', bayer: 'α Pav', ra: 20.4275, dec: -56.7350, vmag: 1.94, spectral: 'B2.5V', color: '#c2d4ff', constellation: 'PAV' },
  { id: 'HR 6217', name: 'Atria', bayer: 'α TrA', ra: 16.8111, dec: -69.0278, vmag: 1.91, spectral: 'K2IIb-IIIa', color: '#ffc88a', constellation: 'TRA' },
  { id: 'HR 99', name: 'Ankaa', bayer: 'α Phe', ra: 0.4381, dec: -42.3060, vmag: 2.40, spectral: 'K0.5IIIb', color: '#ffcf94', constellation: 'PHE' },
  { id: 'HR 1708', name: 'Capella', bayer: 'α Aur', ra: 5.2781, dec: 45.9980, vmag: 0.08, spectral: 'G3III', color: '#ffeed1', constellation: 'AUR' },
  { id: 'HR 2088', name: 'Menkalinan', bayer: 'β Aur', ra: 5.9922, dec: 44.9472, vmag: 1.90, spectral: 'A1IV', color: '#eef3ff', constellation: 'AUR' },
  { id: 'HR 6556', name: 'Rasalhague', bayer: 'α Oph', ra: 17.5822, dec: 12.5600, vmag: 2.08, spectral: 'A5III', color: '#eef3ff', constellation: 'OPH' },
  { id: 'HR 6378', name: 'Sabik', bayer: 'η Oph', ra: 17.1728, dec: -15.7247, vmag: 2.43, spectral: 'A2.5V', color: '#eef3ff', constellation: 'OPH' },
  { id: 'HR 5793', name: 'Alphecca', bayer: 'α CrB', ra: 15.5781, dec: 26.7147, vmag: 2.22, spectral: 'A0V', color: '#eef3ff', constellation: 'CRB' },
  { id: 'HR 3634', name: 'Suhail', bayer: 'λ Vel', ra: 9.1332, dec: -43.4325, vmag: 2.21, spectral: 'K4.5Ib-II', color: '#ffb360', constellation: 'VEL' },
  { id: 'HR 3485', name: 'Alsephina', bayer: 'δ Vel', ra: 8.7464, dec: -54.7083, vmag: 1.93, spectral: 'A1V', color: '#eef3ff', constellation: 'VEL' },
  { id: 'HR 3207', name: 'Regor', bayer: 'γ2 Vel', ra: 8.1583, dec: -47.3364, vmag: 1.75, spectral: 'WC8+O7.5e', color: '#9bbfff', constellation: 'VEL' }
];
