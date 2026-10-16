import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CalculatedBody, Constellation } from '../../data/types';
import { CONSTELLATIONS } from '../../data/constellations';
import { projectHorizontal, unprojectCanvasPoint, ProjectionType } from '../../astronomy/projection';
import { ZoomIn, ZoomOut, RotateCcw, Compass, Eye, Sparkles, Layers } from 'lucide-react';

interface SkyCanvasProps {
  sun: CalculatedBody;
  moon: CalculatedBody;
  planets: CalculatedBody[];
  stars: CalculatedBody[];
  selectedObject: CalculatedBody | null;
  onSelectObject: (obj: CalculatedBody | null) => void;
  nightMode: boolean;
  language: 'en' | 'sw';
}

export const SkyCanvas: React.FC<SkyCanvasProps> = ({
  sun,
  moon,
  planets,
  stars,
  selectedObject,
  onSelectObject,
  nightMode,
  language
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport parameters
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [headingOffset, setHeadingOffset] = useState<number>(0); // 0 = North up
  const [projection, setProjection] = useState<ProjectionType>('stereographic');

  // Layer toggles
  const [showConstellationLines, setShowConstellationLines] = useState<boolean>(true);
  const [showConstellationLabels, setShowConstellationLabels] = useState<boolean>(true);
  const [showStarLabels, setShowStarLabels] = useState<boolean>(true);
  const [showPlanetLabels, setShowPlanetLabels] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAtmosphere, setShowAtmosphere] = useState<boolean>(true);

  // Hover detection
  const [hoveredObject, setHoveredObject] = useState<CalculatedBody | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ alt: number; az: number } | null>(null);

  // Drag interaction state
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map star IDs for rapid lookup in constellation drawing
  const starMap = useRef<Map<string, CalculatedBody>>(new Map());
  useEffect(() => {
    const map = new Map<string, CalculatedBody>();
    stars.forEach(s => map.set(s.id, s));
    starMap.current = map;
  }, [stars]);

  // Center on selected object if user clicks or selects
  useEffect(() => {
    if (!selectedObject) return;
    if (selectedObject.altitude >= 0) {
      // Set heading offset towards the object's azimuth so it faces upright
      setHeadingOffset(Math.round(selectedObject.azimuth));
      setPan({ x: 0, y: 0 });
    }
  }, [selectedObject?.id]);

  // Handle Canvas Rendering
  const renderSky = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2 + pan.x;
    const centerY = height / 2 + pan.y;
    const radius = Math.min(width, height) * 0.44 * zoom;

    const projOpts = {
      width,
      height,
      projection,
      headingOffsetDeg: headingOffset,
      zoom,
      panX: pan.x,
      panY: pan.y
    };

    // 1. Atmosphere / Background calculation based on Sun altitude
    const sunAlt = sun.altitude;
    let skyBg = '#060913';
    let domeFill = '#03050a';

    if (nightMode) {
      skyBg = '#0d0000';
      domeFill = '#1a0303';
    } else if (showAtmosphere) {
      if (sunAlt > 0) {
        // Daylight: bright oceanic cyan-blue
        const dayAlpha = Math.min(sunAlt / 40, 1);
        domeFill = `rgb(${Math.round(20 + 40 * dayAlpha)}, ${Math.round(45 + 110 * dayAlpha)}, ${Math.round(85 + 150 * dayAlpha)})`;
      } else if (sunAlt > -6) {
        // Civil twilight: deep twilight indigo with orange horizon glow
        domeFill = '#0d1933';
      } else if (sunAlt > -12) {
        // Nautical twilight: deep navy
        domeFill = '#070f22';
      } else if (sunAlt > -18) {
        // Astronomical twilight: near-space
        domeFill = '#040916';
      }
    }

    // Canvas background
    ctx.fillStyle = skyBg;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Celestial Dome (Masked circular viewport representing the hemisphere above horizon)
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    // Sky Dome background
    ctx.fillStyle = domeFill;
    ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

    // Subtle Milky Way luminous wash across the dome
    if (!nightMode && sunAlt < -10) {
      const mwGrad = ctx.createLinearGradient(centerX - radius * 0.7, centerY - radius * 0.7, centerX + radius * 0.7, centerY + radius * 0.7);
      mwGrad.addColorStop(0, 'rgba(56, 189, 248, 0.015)');
      mwGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.035)');
      mwGrad.addColorStop(1, 'rgba(56, 189, 248, 0.015)');
      ctx.fillStyle = mwGrad;
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    }

    // 3. Alt-Az Coordinate Grid
    if (showGrid) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = nightMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.12)';
      ctx.fillStyle = nightMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(148, 163, 184, 0.4)';
      ctx.font = '10px "JetBrains Mono", monospace';

      // Concentric altitude circles: 30°, 60°
      [30, 60].forEach(alt => {
        const pt = projectHorizontal(alt, 0, projOpts);
        const rRing = Math.abs(pt.y - centerY);
        ctx.beginPath();
        ctx.arc(centerX, centerY, rRing, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillText(`${alt}°`, centerX + 4, centerY - rRing + 12);
      });

      // Azimuth radial spokes (every 45 degrees: N, NE, E, SE, S, SW, W, NW)
      for (let az = 0; az < 360; az += 45) {
        const pHor = projectHorizontal(0, az, projOpts);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(pHor.x, pHor.y);
        ctx.stroke();
      }

      // Center crosshair (Zenith: 90° altitude)
      ctx.beginPath();
      ctx.moveTo(centerX - 6, centerY);
      ctx.lineTo(centerX + 6, centerY);
      ctx.moveTo(centerX, centerY - 6);
      ctx.lineTo(centerX, centerY + 6);
      ctx.stroke();
      ctx.fillText('Zenith (90°)', centerX + 8, centerY - 8);
    }

    // 4. Constellation Lines
    if (showConstellationLines) {
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = nightMode ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.3)';

      CONSTELLATIONS.forEach(constell => {
        constell.lines.forEach(line => {
          const s1 = starMap.current.get(line.fromId);
          const s2 = starMap.current.get(line.toId);
          if (s1 && s2 && (s1.altitude > -5 || s2.altitude > -5)) {
            const p1 = projectHorizontal(s1.altitude, s1.azimuth, projOpts);
            const p2 = projectHorizontal(s2.altitude, s2.azimuth, projOpts);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
    }

    // 5. Constellation Labels
    if (showConstellationLabels) {
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = nightMode ? 'rgba(239, 68, 68, 0.7)' : 'rgba(125, 211, 252, 0.75)';
      ctx.textAlign = 'center';

      CONSTELLATIONS.forEach(constell => {
        // Calculate average position of constellation stars above horizon
        let sumX = 0;
        let sumY = 0;
        let count = 0;

        constell.lines.forEach(l => {
          const s = starMap.current.get(l.fromId);
          if (s && s.altitude > 2) {
            const pt = projectHorizontal(s.altitude, s.azimuth, projOpts);
            sumX += pt.x;
            sumY += pt.y;
            count++;
          }
        });

        if (count >= 2) {
          const avgX = sumX / count;
          const avgY = sumY / count;
          const label = language === 'sw' ? constell.swahiliName : constell.name;
          ctx.fillText(label.toUpperCase(), avgX, avgY - 10);
        }
      });
    }

    // 6. Draw Stars
    stars.forEach(star => {
      if (star.altitude < -1) return; // Below horizon
      const pt = projectHorizontal(star.altitude, star.azimuth, projOpts);
      if (!pt.isInViewport) return;

      // Magnitude to circle radius: Sirius (-1.46) ~ 5px, mag 4 ~ 1.5px
      const baseSize = Math.max(1.2, 4.2 - star.vmag * 0.7);
      const isSelected = selectedObject?.id === star.id;
      const isHovered = hoveredObject?.id === star.id;

      // Color adaptation for night mode
      let starColor = nightMode ? '#f87171' : star.color;

      // Star point
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isSelected ? baseSize + 2 : baseSize, 0, Math.PI * 2);
      ctx.fillStyle = starColor;
      ctx.fill();

      // Atmospheric scintillation / bright star glow for 1st magnitude stars
      if (star.vmag < 1.5 && !nightMode) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, baseSize * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = star.color.replace(')', ', 0.18)').replace('rgb', 'rgba').replace('#', 'rgba(');
        ctx.fill();
      }

      // Highlight circle if selected or hovered
      if (isSelected || isHovered) {
        ctx.strokeStyle = nightMode ? '#ef4444' : '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, baseSize + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Star Labels
      if (showStarLabels && (star.vmag <= 2.2 || isSelected || isHovered)) {
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isSelected
          ? (nightMode ? '#fca5a5' : '#38bdf8')
          : (nightMode ? 'rgba(239, 68, 68, 0.65)' : 'rgba(226, 232, 240, 0.75)');
        ctx.textAlign = 'left';
        ctx.fillText(star.name, pt.x + baseSize + 4, pt.y + 3);
      }
    });

    // 7. Draw Planets
    planets.forEach(p => {
      if (p.altitude < -1) return;
      const pt = projectHorizontal(p.altitude, p.azimuth, projOpts);
      if (!pt.isInViewport) return;

      const isSelected = selectedObject?.id === p.id;
      const isHovered = hoveredObject?.id === p.id;
      const planetColor = nightMode ? '#f87171' : p.color;

      // Planet disk with subtle halo
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = planetColor;
      ctx.fill();

      // Saturn rings hint
      if (p.id === 'saturn') {
        ctx.strokeStyle = planetColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y, 8, 3, Math.PI / 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Selection indicator
      if (isSelected || isHovered) {
        ctx.strokeStyle = nightMode ? '#ef4444' : '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (showPlanetLabels || isSelected || isHovered) {
        ctx.font = '11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isSelected
          ? (nightMode ? '#fca5a5' : '#38bdf8')
          : (nightMode ? 'rgba(239, 68, 68, 0.85)' : '#f8fafc');
        ctx.textAlign = 'left';
        const labelName = language === 'sw' ? p.swahiliName : p.name;
        ctx.fillText(labelName, pt.x + 8, pt.y + 4);
      }
    });

    // 8. Draw Moon
    if (moon.altitude > -2) {
      const pt = projectHorizontal(moon.altitude, moon.azimuth, projOpts);
      if (pt.isInViewport) {
        const isSelected = selectedObject?.id === 'moon';
        const isHovered = hoveredObject?.id === 'moon';
        const moonRadius = 9;

        // Dark moon disk background
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, moonRadius, 0, Math.PI * 2);
        ctx.fillStyle = nightMode ? '#450a0a' : '#1e293b';
        ctx.fill();

        // Moon illuminated portion representation
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, moonRadius, 0, Math.PI * 2);
        ctx.fillStyle = nightMode ? '#fca5a5' : '#f1f5f9';
        ctx.fill();

        // Shadow terminator according to phase
        const phaseDeg = moon.phaseAngle || 0;
        const illum = moon.illuminatedFraction ?? 0.5;
        if (illum < 0.98 && illum > 0.02) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, moonRadius, Math.PI / 2, -Math.PI / 2, phaseDeg > 180);
          ctx.ellipse(pt.x, pt.y, Math.abs(moonRadius * (1 - 2 * illum)), moonRadius, 0, -Math.PI / 2, Math.PI / 2, illum > 0.5);
          ctx.fillStyle = nightMode ? '#450a0a' : '#0f172a';
          ctx.fill();
        }

        // Selection ring
        if (isSelected || isHovered) {
          ctx.strokeStyle = nightMode ? '#ef4444' : '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, moonRadius + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Moon Label
        ctx.font = '11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isSelected ? '#38bdf8' : (nightMode ? '#f87171' : '#e2e8f0');
        ctx.textAlign = 'left';
        ctx.fillText(language === 'sw' ? 'Mwezi' : 'Moon', pt.x + moonRadius + 6, pt.y + 4);
      }
    }

    // 9. Draw Sun
    if (sun.altitude > -18) {
      const pt = projectHorizontal(sun.altitude, sun.azimuth, projOpts);
      if (pt.isInViewport) {
        const isSelected = selectedObject?.id === 'sun';
        const sunRadius = 11;

        // Solar corona / atmospheric flare
        if (sun.altitude > -2) {
          const glow = ctx.createRadialGradient(pt.x, pt.y, 4, pt.x, pt.y, 45);
          glow.addColorStop(0, nightMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(254, 240, 138, 0.6)');
          glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 45, 0, Math.PI * 2);
          ctx.fill();
        }

        // Sun disk
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, sunRadius, 0, Math.PI * 2);
        ctx.fillStyle = nightMode ? '#ef4444' : '#fde047';
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, sunRadius + 5, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.font = '11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = nightMode ? '#f87171' : '#fef08a';
        ctx.textAlign = 'left';
        ctx.fillText(language === 'sw' ? 'Jua' : 'Sun', pt.x + sunRadius + 6, pt.y + 4);
      }
    }

    ctx.restore(); // Restore clipping to draw horizon boundary & cardinals

    // 10. Draw Horizon Boundary Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = nightMode ? '#b91c1c' : '#0284c7';
    ctx.stroke();

    // 11. Cardinal Directions (North, East, South, West)
    const cardinals: { nameEn: string; nameSw: string; az: number }[] = [
      { nameEn: 'N', nameSw: 'K', az: 0 },
      { nameEn: 'NE', nameSw: 'KM', az: 45 },
      { nameEn: 'E', nameSw: 'M', az: 90 },
      { nameEn: 'SE', nameSw: 'KM', az: 135 },
      { nameEn: 'S', nameSw: 'K', az: 180 },
      { nameEn: 'SW', nameSw: 'KM', az: 225 },
      { nameEn: 'W', nameSw: 'M', az: 270 },
      { nameEn: 'NW', nameSw: 'KM', az: 315 }
    ];

    cardinals.forEach(card => {
      // Position slightly outside the horizon rim
      const effAz = (card.az - headingOffset + 360) % 360;
      const azRad = (effAz * Math.PI) / 180;
      const cardDist = radius + 18;
      const cx = centerX - cardDist * Math.sin(azRad);
      const cy = centerY - cardDist * Math.cos(azRad);

      const isMain = card.az % 90 === 0;
      ctx.font = isMain ? 'bold 12px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
      ctx.fillStyle = isMain
        ? (nightMode ? '#ef4444' : '#38bdf8')
        : (nightMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(148, 163, 184, 0.6)');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const text = language === 'sw' && isMain
        ? (card.az === 0 ? 'KAS' : card.az === 90 ? 'MASH' : card.az === 180 ? 'KUS' : 'MAGH')
        : card.nameEn;
      ctx.fillText(text, cx, cy);
    });

    ctx.restore();
  }, [
    sun,
    moon,
    planets,
    stars,
    selectedObject,
    hoveredObject,
    zoom,
    pan,
    headingOffset,
    projection,
    showConstellationLines,
    showConstellationLabels,
    showStarLabels,
    showPlanetLabels,
    showGrid,
    showAtmosphere,
    nightMode,
    language
  ]);

  // Handle Resize & DPR
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      renderSky();
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [renderSky]);

  // Request Animation Frame re-render
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderSky();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderSky]);

  // Mouse interaction: Panning and Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Only left-click
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPanRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: initialPanRef.current.x + dx,
        y: initialPanRef.current.y + dy
      });
      return;
    }

    // Unproject to update live cursor altitude and azimuth readout
    const unproj = unprojectCanvasPoint(clientX, clientY, {
      width: rect.width,
      height: rect.height,
      projection,
      headingOffsetDeg: headingOffset,
      zoom,
      panX: pan.x,
      panY: pan.y
    });

    setCursorCoords({
      alt: Math.round(unproj.altitudeDeg * 10) / 10,
      az: Math.round(unproj.azimuthDeg * 10) / 10
    });

    // Object hover hit testing (radius threshold 14px)
    const allBodies: CalculatedBody[] = [sun, moon, ...planets, ...stars];
    let found: CalculatedBody | null = null;
    const threshold = 14;

    for (const b of allBodies) {
      if (b.altitude < -1) continue;
      const pt = projectHorizontal(b.altitude, b.azimuth, {
        width: rect.width,
        height: rect.height,
        projection,
        headingOffsetDeg: headingOffset,
        zoom,
        panX: pan.x,
        panY: pan.y
      });

      const dist = Math.sqrt((pt.x - clientX) ** 2 + (pt.y - clientY) ** 2);
      if (dist <= threshold) {
        found = b;
        break;
      }
    }

    setHoveredObject(found);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dist = Math.sqrt((e.clientX - dragStartRef.current.x) ** 2 + (e.clientY - dragStartRef.current.y) ** 2);
    isDraggingRef.current = false;

    // If mouse didn't move much, treat as a click selection
    if (dist < 4) {
      if (hoveredObject) {
        onSelectObject(hoveredObject);
      } else {
        onSelectObject(null);
      }
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom(prev => Math.min(Math.max(prev + delta, 0.8), 4.5));
  };

  // Reset view handler
  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setHeadingOffset(0);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden bg-[#060913]">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Floating HUD Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-100 uppercase tracking-wider">
            {language === 'sw' ? 'Anga la Kimahesabu — Wakati Halisi' : 'Calculated Sky — Current Time'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 shadow-xl">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.25, 4.0))}
            title="Zoom In"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.25, 0.8))}
            title="Zoom Out"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            title="Reset View"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
          <button
            onClick={() => setHeadingOffset(h => (h + 45) % 360)}
            title="Rotate Heading"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1 text-xs font-mono"
          >
            <Compass className="w-4 h-4" />
            <span>{headingOffset}°</span>
          </button>
        </div>

        {/* Projection Mode Selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 shadow-xl text-xs">
          <button
            onClick={() => setProjection('stereographic')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              projection === 'stereographic' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stereographic
          </button>
          <button
            onClick={() => setProjection('equidistant')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              projection === 'equidistant' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Equidistant
          </button>
        </div>
      </div>

      {/* Layer Visibility Toggles */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 shadow-xl z-10 text-xs">
        <button
          onClick={() => setShowConstellationLines(v => !v)}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            showConstellationLines ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Constellation Lines"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'sw' ? 'Mistari' : 'Lines'}</span>
        </button>

        <button
          onClick={() => setShowConstellationLabels(v => !v)}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            showConstellationLabels ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Constellation Names"
        >
          <span>{language === 'sw' ? 'Makundi' : 'Names'}</span>
        </button>

        <button
          onClick={() => setShowStarLabels(v => !v)}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            showStarLabels ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Star Labels"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{language === 'sw' ? 'Nyota' : 'Stars'}</span>
        </button>

        <button
          onClick={() => setShowGrid(v => !v)}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            showGrid ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Alt-Az Grid"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{language === 'sw' ? 'Gridi' : 'Grid'}</span>
        </button>
      </div>

      {/* Bottom Live Crosshair Probe Telemetry */}
      {cursorCoords && (
        <div className="absolute bottom-4 left-4 p-2 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs font-mono text-slate-300 pointer-events-none shadow-lg flex items-center gap-4">
          <div>
            <span className="text-slate-500 mr-1.5">ALT</span>
            <span className={cursorCoords.alt >= 0 ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>
              {cursorCoords.alt >= 0 ? `+${cursorCoords.alt.toFixed(1)}°` : `${cursorCoords.alt.toFixed(1)}°`}
            </span>
          </div>
          <div className="w-[1px] h-3 bg-slate-700" />
          <div>
            <span className="text-slate-500 mr-1.5">AZ</span>
            <span className="text-slate-200">{cursorCoords.az.toFixed(1)}°</span>
          </div>
          {hoveredObject && (
            <>
              <div className="w-[1px] h-3 bg-slate-700" />
              <div className="text-cyan-300 font-sans font-medium flex items-center gap-1">
                <span>{language === 'sw' ? hoveredObject.swahiliName : hoveredObject.name}</span>
                <span className="text-slate-500 text-[10px] font-mono">({hoveredObject.type})</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
