/**
 * Sky Projection Algorithms for Zanzibar SkyLab
 *
 * Implements mathematically valid celestial coordinate projections:
 * 1. Stereographic All-Sky Projection (conformal, preserves local angles and shapes)
 * 2. Azimuthal Equidistant Projection (linear radial distance relative to zenith distance)
 *
 * Celestial Orientation Convention:
 * When looking UP at the celestial sphere from Earth's surface (facing North):
 * - Zenith (altitude 90°) is at the center of the dome (r = 0).
 * - Horizon (altitude 0°) forms the boundary circle (r = R).
 * - North (azimuth 0°) is at the top.
 * - South (azimuth 180°) is at the bottom.
 * - East (azimuth 90°) is on the left.
 * - West (azimuth 270°) is on the right.
 */

export type ProjectionType = 'stereographic' | 'equidistant';

export interface ProjectorOptions {
  width: number;
  height: number;
  projection: ProjectionType;
  headingOffsetDeg?: number; // User rotation (0 = North up, 180 = South up)
  zoom?: number;              // 1.0 = full dome, > 1.0 = zoomed in
  panX?: number;              // Offset in pixels
  panY?: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  r: number;
  radius: number;
  isAboveHorizon: boolean;
  isInViewport: boolean;
}

/**
 * Projects a horizontal coordinate (altitude, azimuth) onto a 2D canvas.
 */
export function projectHorizontal(
  altitudeDeg: number,
  azimuthDeg: number,
  options: ProjectorOptions
): ProjectedPoint {
  const {
    width,
    height,
    projection,
    headingOffsetDeg = 0,
    zoom = 1.0,
    panX = 0,
    panY = 0
  } = options;

  const centerX = width / 2 + panX;
  const centerY = height / 2 + panY;
  const baseRadius = Math.min(width, height) * 0.44 * zoom;

  // Azimuth rotated by user heading offset
  const effectiveAzimuthDeg = (azimuthDeg - headingOffsetDeg + 360) % 360;
  const azimuthRad = (effectiveAzimuthDeg * Math.PI) / 180;

  // Zenith angle (0 at zenith, 90 at horizon, >90 below horizon)
  const zenithAngleDeg = 90 - altitudeDeg;

  let r = 0;
  if (projection === 'stereographic') {
    // Stereographic: r = 2 * R * tan(z / 2) / (2 * tan(45°)) = R * tan(z / 2)
    // At z = 0 (zenith, alt=90), r = 0
    // At z = 90 (horizon, alt=0), r = R * tan(45°) = R
    const zRad = (zenithAngleDeg * Math.PI) / 360; // z / 2 in radians
    r = baseRadius * Math.tan(zRad);
  } else {
    // Azimuthal Equidistant: r is strictly linear with zenith angle
    r = baseRadius * (zenithAngleDeg / 90.0);
  }

  // Celestial convention: North is -y, East is -x, South is +y, West is +x
  const x = centerX - r * Math.sin(azimuthRad);
  const y = centerY - r * Math.cos(azimuthRad);

  const isAboveHorizon = altitudeDeg >= 0;
  const isInViewport = x >= -50 && x <= width + 50 && y >= -50 && y <= height + 50;

  return {
    x,
    y,
    r,
    radius: baseRadius,
    isAboveHorizon,
    isInViewport
  };
}

/**
 * Inverts a 2D canvas coordinate back to horizontal (altitude, azimuth).
 * Useful for click inspection on arbitrary sky points.
 */
export function unprojectCanvasPoint(
  x: number,
  y: number,
  options: ProjectorOptions
): { altitudeDeg: number; azimuthDeg: number; isInsideHorizon: boolean } {
  const {
    width,
    height,
    projection,
    headingOffsetDeg = 0,
    zoom = 1.0,
    panX = 0,
    panY = 0
  } = options;

  const centerX = width / 2 + panX;
  const centerY = height / 2 + panY;
  const baseRadius = Math.min(width, height) * 0.44 * zoom;

  const dx = -(x - centerX); // Inverted because East is -x
  const dy = -(y - centerY); // Inverted because North is -y

  const r = Math.sqrt(dx * dx + dy * dy);
  let zenithAngleDeg = 0;

  if (projection === 'stereographic') {
    const halfZRad = Math.atan2(r, baseRadius);
    zenithAngleDeg = (halfZRad * 360) / Math.PI;
  } else {
    zenithAngleDeg = (r / baseRadius) * 90;
  }

  const altitudeDeg = 90 - zenithAngleDeg;

  // Azimuth angle from dx, dy
  let azRad = Math.atan2(dx, dy);
  if (azRad < 0) azRad += 2 * Math.PI;
  let azimuthDeg = (azRad * 180) / Math.PI;
  azimuthDeg = (azimuthDeg + headingOffsetDeg + 360) % 360;

  return {
    altitudeDeg,
    azimuthDeg,
    isInsideHorizon: r <= baseRadius
  };
}
