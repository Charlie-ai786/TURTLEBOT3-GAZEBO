import { LaserScanData, SimObject } from '../../types/simulation';

interface LineSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface CircleObstacle {
  x: number;
  y: number;
  radius: number;
}

/**
 * Extracts 2D line segments from oriented box / wall objects
 */
function getBoxSegments(obj: SimObject): LineSegment[] {
  const w = obj.size.x / 2;
  const d = obj.size.y / 2;
  const yaw = obj.rotation.z || 0;
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const ox = obj.position.x;
  const oy = obj.position.y;

  // Four local corners
  const localCorners = [
    { x: -w, y: -d },
    { x: w, y: -d },
    { x: w, y: d },
    { x: -w, y: d },
  ];

  // Rotate and translate to world coordinates
  const worldCorners = localCorners.map((pt) => ({
    x: ox + (cosY * pt.x - sinY * pt.y),
    y: oy + (sinY * pt.x + cosY * pt.y),
  }));

  return [
    { x1: worldCorners[0].x, y1: worldCorners[0].y, x2: worldCorners[1].x, y2: worldCorners[1].y },
    { x1: worldCorners[1].x, y1: worldCorners[1].y, x2: worldCorners[2].x, y2: worldCorners[2].y },
    { x1: worldCorners[2].x, y1: worldCorners[2].y, x2: worldCorners[3].x, y2: worldCorners[3].y },
    { x1: worldCorners[3].x, y1: worldCorners[3].y, x2: worldCorners[0].x, y2: worldCorners[0].y },
  ];
}

/**
 * Ray-segment intersection
 */
function raySegmentIntersect(
  rox: number,
  roy: number,
  rdx: number,
  rdy: number,
  seg: LineSegment
): number | null {
  const sx = seg.x2 - seg.x1;
  const sy = seg.y2 - seg.y1;

  const det = rdx * sy - rdy * sx;
  if (Math.abs(det) < 1e-7) return null; // parallel

  const qx = seg.x1 - rox;
  const qy = seg.y1 - roy;

  const t = (qx * sy - qy * sx) / det;
  const u = (qx * rdy - qy * rdx) / det;

  if (t > 0.001 && u >= 0 && u <= 1) {
    return t;
  }
  return null;
}

/**
 * Ray-circle intersection
 */
function rayCircleIntersect(
  rox: number,
  roy: number,
  rdx: number,
  rdy: number,
  circle: CircleObstacle
): number | null {
  const cx = rox - circle.x;
  const cy = roy - circle.y;

  const b = cx * rdx + cy * rdy;
  const c = cx * cx + cy * cy - circle.radius * circle.radius;

  const disc = b * b - c;
  if (disc < 0) return null;

  const sqrtDisc = Math.sqrt(disc);
  const t1 = -b - sqrtDisc;
  const t2 = -b + sqrtDisc;

  if (t1 > 0.001) return t1;
  if (t2 > 0.001) return t2;
  return null;
}

export interface RaycastHitPoint {
  worldX: number;
  worldY: number;
  distance: number;
  angle: number;
  intensity: number;
}

/**
 * Simulates the LDS-01 LiDAR sensor mounted on the TurtleBot3 Burger
 */
export function simulateLidar(
  sensorX: number,
  sensorY: number,
  sensorHeading: number,
  objects: SimObject[],
  numRays: number = 360,
  rangeMin: number = 0.12,
  rangeMax: number = 3.5
): {
  scanData: LaserScanData;
  hitPoints: RaycastHitPoint[];
} {
  // Pre-extract world geometries for fast raycasting
  const segments: LineSegment[] = [];
  const circles: CircleObstacle[] = [];

  for (const obj of objects) {
    if (obj.type === 'ground' || obj.type === 'robot') continue;

    if (obj.type === 'cylinder') {
      circles.push({
        x: obj.position.x,
        y: obj.position.y,
        radius: (obj.size.x || 0.3) / 2,
      });
    } else {
      // Box, wall, table, obstacle
      const boxSegs = getBoxSegments(obj);
      segments.push(...boxSegs);
    }
  }

  const angleMin = 0;
  const angleMax = 2 * Math.PI;
  const angleIncrement = (2 * Math.PI) / numRays;

  const ranges: number[] = new Array(numRays);
  const intensities: number[] = new Array(numRays);
  const hitPoints: RaycastHitPoint[] = [];

  let closestDist = rangeMax;
  let closestAngle = 0;

  for (let i = 0; i < numRays; i++) {
    const localAngle = i * angleIncrement;
    const worldAngle = sensorHeading + localAngle;

    const rdx = Math.cos(worldAngle);
    const rdy = Math.sin(worldAngle);

    let minT = rangeMax;

    // Check line segments
    for (let s = 0; s < segments.length; s++) {
      const t = raySegmentIntersect(sensorX, sensorY, rdx, rdy, segments[s]);
      if (t !== null && t < minT && t >= rangeMin) {
        minT = t;
      }
    }

    // Check circles
    for (let c = 0; c < circles.length; c++) {
      const t = rayCircleIntersect(sensorX, sensorY, rdx, rdy, circles[c]);
      if (t !== null && t < minT && t >= rangeMin) {
        minT = t;
      }
    }

    // Small sensor noise (1-2mm) for realistic LDS-01 sensor fidelity
    const noisyDist = minT < rangeMax ? Math.max(rangeMin, minT + (Math.random() - 0.5) * 0.004) : Infinity;
    const finalDist = minT < rangeMax ? noisyDist : rangeMax;

    ranges[i] = finalDist;
    const intensity = minT < rangeMax ? Math.max(50, 255 - (finalDist / rangeMax) * 150) : 0;
    intensities[i] = intensity;

    if (finalDist < closestDist) {
      closestDist = finalDist;
      closestAngle = localAngle;
    }

    if (minT < rangeMax) {
      hitPoints.push({
        worldX: sensorX + rdx * finalDist,
        worldY: sensorY + rdy * finalDist,
        distance: finalDist,
        angle: localAngle,
        intensity: intensity,
      });
    }
  }

  const scanData: LaserScanData = {
    angleMin,
    angleMax,
    angleIncrement,
    timeIncrement: 1.0 / (5.0 * numRays), // 5 Hz LDS-01 scan rate
    scanTime: 0.2, // 5 Hz
    rangeMin,
    rangeMax,
    ranges,
    intensities,
    numRays,
    scanFrequency: 5.0,
    timestamp: performance.now(),
    closestDistance: closestDist,
    closestAngle: closestAngle,
  };

  return { scanData, hitPoints };
}

