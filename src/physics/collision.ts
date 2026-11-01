import { SimObject } from '../types/simulation';

export interface CollisionResult {
  hasCollision: boolean;
  penetration: number;
  normalX: number;
  normalY: number;
  collidedWith?: SimObject;
}

/**
 * Checks circle-circle collision (e.g. Robot vs Cylinder)
 */
export function checkCircleCircle(
  cx1: number,
  cy1: number,
  r1: number,
  cx2: number,
  cy2: number,
  r2: number
): CollisionResult {
  const dx = cx1 - cx2;
  const dy = cy1 - cy2;
  const distSq = dx * dx + dy * dy;
  const minDist = r1 + r2;

  if (distSq < minDist * minDist) {
    const dist = Math.sqrt(distSq);
    if (dist < 0.0001) {
      return {
        hasCollision: true,
        penetration: minDist,
        normalX: 1,
        normalY: 0,
      };
    }
    return {
      hasCollision: true,
      penetration: minDist - dist,
      normalX: dx / dist,
      normalY: dy / dist,
    };
  }

  return { hasCollision: false, penetration: 0, normalX: 0, normalY: 0 };
}

/**
 * Checks circle-box collision with arbitrary orientation
 */
export function checkCircleOrientedBox(
  cx: number,
  cy: number,
  radius: number,
  boxX: number,
  boxY: number,
  boxW: number,
  boxD: number,
  boxYaw: number
): CollisionResult {
  // Transform circle center into box local coordinate system
  const cosY = Math.cos(-boxYaw);
  const sinY = Math.sin(-boxYaw);
  const relX = cx - boxX;
  const relY = cy - boxY;

  const localX = cosY * relX - sinY * relY;
  const localY = sinY * relX + cosY * relY;

  const halfW = boxW / 2;
  const halfD = boxD / 2;

  // Closest point in local space
  const clampedX = Math.max(-halfW, Math.min(halfW, localX));
  const clampedY = Math.max(-halfD, Math.min(halfD, localY));

  const diffX = localX - clampedX;
  const diffY = localY - clampedY;
  const distSq = diffX * diffX + diffY * diffY;

  if (distSq < radius * radius) {
    let localNormX = 0;
    let localNormY = 0;
    let dist = Math.sqrt(distSq);

    // If circle center is strictly inside box
    if (dist < 0.0001) {
      const distToEdgeX = halfW - Math.abs(localX);
      const distToEdgeY = halfD - Math.abs(localY);
      if (distToEdgeX < distToEdgeY) {
        localNormX = localX >= 0 ? 1 : -1;
        dist = distToEdgeX + radius;
      } else {
        localNormY = localY >= 0 ? 1 : -1;
        dist = distToEdgeY + radius;
      }
    } else {
      localNormX = diffX / dist;
      localNormY = diffY / dist;
    }

    // Transform normal back to world coordinates
    const cosWorld = Math.cos(boxYaw);
    const sinWorld = Math.sin(boxYaw);
    const worldNormX = cosWorld * localNormX - sinWorld * localNormY;
    const worldNormY = sinWorld * localNormX + cosWorld * localNormY;

    const penetration = radius - (distSq > 0 ? Math.sqrt(distSq) : 0);

    return {
      hasCollision: true,
      penetration: Math.max(0.001, penetration),
      normalX: worldNormX,
      normalY: worldNormY,
    };
  }

  return { hasCollision: false, penetration: 0, normalX: 0, normalY: 0 };
}

/**
 * Checks robot collision against all objects in the environment
 */
export function resolveRobotCollisions(
  robotX: number,
  robotY: number,
  robotRadius: number,
  objects: SimObject[]
): { newX: number; newY: number; collided: boolean } {
  let currX = robotX;
  let currY = robotY;
  let hasAnyCollision = false;

  // Run up to 3 iterative passes to handle corner pinches cleanly
  for (let iter = 0; iter < 3; iter++) {
    let collisionOccurredInPass = false;

    for (const obj of objects) {
      if (obj.type === 'ground' || obj.type === 'robot') continue;

      let result: CollisionResult = { hasCollision: false, penetration: 0, normalX: 0, normalY: 0 };

      if (obj.type === 'cylinder') {
        const cylRadius = (obj.size.x || 0.3) / 2;
        result = checkCircleCircle(currX, currY, robotRadius, obj.position.x, obj.position.y, cylRadius);
      } else {
        // Box, wall, table, obstacle
        const width = obj.size.x;
        const depth = obj.size.y;
        const yaw = obj.rotation.z || 0;
        result = checkCircleOrientedBox(currX, currY, robotRadius, obj.position.x, obj.position.y, width, depth, yaw);
      }

      if (result.hasCollision && result.penetration > 0.0001) {
        currX += result.normalX * (result.penetration + 0.002);
        currY += result.normalY * (result.penetration + 0.002);
        hasAnyCollision = true;
        collisionOccurredInPass = true;
      }
    }

    if (!collisionOccurredInPass) break;
  }

  return { newX: currX, newY: currY, collided: hasAnyCollision };
}

