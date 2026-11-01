import { PathPoint } from '../types/simulation';
import { CostmapEngine } from './costmap';

interface Node {
  gx: number;
  gy: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export function planAStarPath(
  startX: number,
  startY: number,
  goalX: number,
  goalY: number,
  costmap: CostmapEngine
): PathPoint[] {
  // Convert start and goal to grid coordinates
  const startGx = Math.floor((startX - costmap.originX) / costmap.resolution);
  const startGy = Math.floor((startY - costmap.originY) / costmap.resolution);
  const goalGx = Math.floor((goalX - costmap.originX) / costmap.resolution);
  const goalGy = Math.floor((goalY - costmap.originY) / costmap.resolution);

  // If start or goal is out of bounds or in lethal obstacle
  if (
    startGx < 0 || startGx >= costmap.width || startGy < 0 || startGy >= costmap.height ||
    goalGx < 0 || goalGx >= costmap.width || goalGy < 0 || goalGy >= costmap.height
  ) {
    return [];
  }

  // If goal is inside obstacle, search immediate neighbor for accessible cell
  let effectiveGoalGx = goalGx;
  let effectiveGoalGy = goalGy;
  if (!costmap.isFree(goalGx, goalGy)) {
    let foundFree = false;
    for (let r = 1; r <= 5; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (costmap.isFree(goalGx + dx, goalGy + dy)) {
            effectiveGoalGx = goalGx + dx;
            effectiveGoalGy = goalGy + dy;
            foundFree = true;
            break;
          }
        }
        if (foundFree) break;
      }
      if (foundFree) break;
    }
    if (!foundFree) return [];
  }

  const openList: Node[] = [];
  const closedSet = new Uint8Array(costmap.width * costmap.height);

  const startH = Math.hypot(effectiveGoalGx - startGx, effectiveGoalGy - startGy);
  const startNode: Node = {
    gx: startGx,
    gy: startGy,
    g: 0,
    h: startH,
    f: startH,
    parent: null,
  };

  openList.push(startNode);

  const directions = [
    { dx: 1, dy: 0, cost: 1.0 },
    { dx: -1, dy: 0, cost: 1.0 },
    { dx: 0, dy: 1, cost: 1.0 },
    { dx: 0, dy: -1, cost: 1.0 },
    { dx: 1, dy: 1, cost: 1.414 },
    { dx: -1, dy: 1, cost: 1.414 },
    { dx: 1, dy: -1, cost: 1.414 },
    { dx: -1, dy: -1, cost: 1.414 },
  ];

  let iterations = 0;
  const maxIterations = 8000;

  while (openList.length > 0 && iterations++ < maxIterations) {
    // Pick node with lowest f
    let bestIdx = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[bestIdx].f) {
        bestIdx = i;
      }
    }

    const current = openList.splice(bestIdx, 1)[0];
    const currIdx = current.gy * costmap.width + current.gx;

    if (closedSet[currIdx]) continue;
    closedSet[currIdx] = 1;

    // Goal reached check
    if (Math.hypot(current.gx - effectiveGoalGx, current.gy - effectiveGoalGy) <= 1.5) {
      // Reconstruct raw path
      const rawPoints: PathPoint[] = [];
      let curr: Node | null = current;
      while (curr) {
        rawPoints.push({
          x: costmap.originX + (curr.gx + 0.5) * costmap.resolution,
          y: costmap.originY + (curr.gy + 0.5) * costmap.resolution,
        });
        curr = curr.parent;
      }
      rawPoints.reverse();

      // Append exact goal
      rawPoints.push({ x: goalX, y: goalY });

      // Path smoothing
      return smoothPath(rawPoints, costmap);
    }

    // Expand 8 neighbors
    for (const dir of directions) {
      const nx = current.gx + dir.dx;
      const ny = current.gy + dir.dy;

      if (nx < 0 || nx >= costmap.width || ny < 0 || ny >= costmap.height) continue;
      const nIdx = ny * costmap.width + nx;
      if (closedSet[nIdx]) continue;

      const cellCost = costmap.getGlobalCost(nx, ny);
      if (cellCost >= 200) continue; // Inscribed or lethal obstacle

      // Cost function includes cell inflation cost to prefer open paths
      const stepCost = dir.cost + (cellCost / 255.0) * 3.0;
      const gScore = current.g + stepCost;
      const hScore = Math.hypot(effectiveGoalGx - nx, effectiveGoalGy - ny);

      openList.push({
        gx: nx,
        gy: ny,
        g: gScore,
        h: hScore,
        f: gScore + hScore,
        parent: current,
      });
    }
  }

  return [];
}

/**
 * Line of sight check to simplify path into natural straight lines
 */
function hasLineOfSight(p1: PathPoint, p2: PathPoint, costmap: CostmapEngine): boolean {
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const steps = Math.ceil(dist / (costmap.resolution * 0.8));

  for (let s = 1; s < steps; s++) {
    const t = s / steps;
    const wx = p1.x + (p2.x - p1.x) * t;
    const wy = p1.y + (p2.y - p1.y) * t;

    const gx = Math.floor((wx - costmap.originX) / costmap.resolution);
    const gy = Math.floor((wy - costmap.originY) / costmap.resolution);

    if (costmap.getGlobalCost(gx, gy) >= 150) {
      return false;
    }
  }
  return true;
}

function smoothPath(rawPoints: PathPoint[], costmap: CostmapEngine): PathPoint[] {
  if (rawPoints.length <= 2) return rawPoints;

  const smoothed: PathPoint[] = [rawPoints[0]];
  let currentIdx = 0;

  while (currentIdx < rawPoints.length - 1) {
    let farthestIdx = currentIdx + 1;

    for (let testIdx = rawPoints.length - 1; testIdx > currentIdx + 1; testIdx--) {
      if (hasLineOfSight(rawPoints[currentIdx], rawPoints[testIdx], costmap)) {
        farthestIdx = testIdx;
        break;
      }
    }

    smoothed.push(rawPoints[farthestIdx]);
    currentIdx = farthestIdx;
  }

  // Interpolate waypoints with max spacing of 0.15m so follower has continuous guidance
  const densePath: PathPoint[] = [smoothed[0]];
  for (let i = 0; i < smoothed.length - 1; i++) {
    const pA = smoothed[i];
    const pB = smoothed[i + 1];
    const segDist = Math.hypot(pB.x - pA.x, pB.y - pA.y);
    const numSub = Math.max(1, Math.ceil(segDist / 0.15));

    for (let s = 1; s <= numSub; s++) {
      const t = s / numSub;
      densePath.push({
        x: pA.x + (pB.x - pA.x) * t,
        y: pA.y + (pB.y - pA.y) * t,
      });
    }
  }

  return densePath;
}

