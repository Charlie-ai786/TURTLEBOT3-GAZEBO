import { NavigationState, PathPoint, RobotState, LaserScanData } from '../types/simulation';

export interface FollowerOutput {
  targetLinearVelocity: number;
  targetAngularVelocity: number;
  navigationState: NavigationState;
  replanRequested: boolean;
}

export function executePathFollowing(
  robot: RobotState,
  navState: NavigationState,
  scan: LaserScanData | null
): FollowerOutput {
  if (!navState.goal || !navState.goal.active || navState.globalPath.length === 0) {
    return {
      targetLinearVelocity: 0,
      targetAngularVelocity: 0,
      navigationState: { ...navState, status: 'idle' },
      replanRequested: false,
    };
  }

  const goal = navState.goal;
  const distToGoal = Math.hypot(goal.x - robot.x, goal.y - robot.y);
  const angleToGoal = Math.atan2(goal.y - robot.y, goal.x - robot.x);

  // 1. Check if goal position reached
  const positionTolerance = 0.10; // 10 cm
  const orientationTolerance = 0.12; // ~7 degrees

  if (distToGoal <= positionTolerance) {
    // Position reached; now align to goal heading
    let yawDiff = goal.heading - robot.heading;
    while (yawDiff > Math.PI) yawDiff -= 2 * Math.PI;
    while (yawDiff < -Math.PI) yawDiff += 2 * Math.PI;

    if (Math.abs(yawDiff) <= orientationTolerance) {
      // Fully arrived!
      return {
        targetLinearVelocity: 0,
        targetAngularVelocity: 0,
        navigationState: {
          ...navState,
          status: 'reached',
          distanceToGoal: 0,
          angleToGoal: 0,
          goal: { ...goal, reached: true, active: false },
          globalPath: [],
          localPath: [],
        },
        replanRequested: false,
      };
    } else {
      // In-place rotation to goal orientation
      const targetW = Math.max(-1.0, Math.min(1.0, yawDiff * 2.0));
      return {
        targetLinearVelocity: 0,
        targetAngularVelocity: targetW,
        navigationState: {
          ...navState,
          status: 'navigating',
          distanceToGoal: distToGoal,
          angleToGoal: yawDiff,
        },
        replanRequested: false,
      };
    }
  }

  // 2. Obstacle safety check in front arc (+/- 30 degrees)
  if (scan) {
    let closestFront = 3.5;
    for (let i = 0; i < scan.ranges.length; i++) {
      let rayAngle = scan.angleMin + i * scan.angleIncrement;
      if (rayAngle > Math.PI) rayAngle -= 2 * Math.PI;

      if (Math.abs(rayAngle) < 0.5) { // ~30 deg front cone
        if (scan.ranges[i] < closestFront) {
          closestFront = scan.ranges[i];
        }
      }
    }

    if (closestFront < 0.22) { // Imminent forward collision
      return {
        targetLinearVelocity: 0,
        targetAngularVelocity: 0,
        navigationState: {
          ...navState,
          status: 'blocked',
          replanCount: navState.replanCount + 1,
        },
        replanRequested: true,
      };
    }
  }

  // 3. Find lookahead target point on path
  const lookaheadDist = 0.35; // 35 cm
  let targetPoint: PathPoint = navState.globalPath[navState.globalPath.length - 1];

  // Find point closest to robot
  let minIdx = 0;
  let minDist = Infinity;
  for (let i = 0; i < navState.globalPath.length; i++) {
    const d = Math.hypot(navState.globalPath[i].x - robot.x, navState.globalPath[i].y - robot.y);
    if (d < minDist) {
      minDist = d;
      minIdx = i;
    }
  }

  // Advance along path by lookahead distance
  let accumDist = 0;
  for (let i = minIdx; i < navState.globalPath.length - 1; i++) {
    accumDist += Math.hypot(
      navState.globalPath[i + 1].x - navState.globalPath[i].x,
      navState.globalPath[i + 1].y - navState.globalPath[i].y
    );
    if (accumDist >= lookaheadDist) {
      targetPoint = navState.globalPath[i + 1];
      break;
    }
  }

  // 4. Pure pursuit steering
  const targetAngle = Math.atan2(targetPoint.y - robot.y, targetPoint.x - robot.x);
  let alpha = targetAngle - robot.heading;
  while (alpha > Math.PI) alpha -= 2 * Math.PI;
  while (alpha < -Math.PI) alpha += 2 * Math.PI;

  let targetLinear = 0.18; // default cruising speed (m/s)
  let targetAngular = 0;

  // Decelerate when approaching goal
  if (distToGoal < 0.45) {
    targetLinear = Math.max(0.06, 0.18 * (distToGoal / 0.45));
  }

  // If orientation error is large, turn in place first
  if (Math.abs(alpha) > 0.8) {
    targetLinear = 0.02;
    targetAngular = Math.sign(alpha) * Math.min(1.5, Math.abs(alpha) * 2.5);
  } else {
    // Pure pursuit curvature
    targetAngular = (2 * Math.sin(alpha) / lookaheadDist) * targetLinear;
    // Limit angular speed
    targetAngular = Math.max(-robot.maxAngularSpeed, Math.min(robot.maxAngularSpeed, targetAngular));
  }

  return {
    targetLinearVelocity: targetLinear,
    targetAngularVelocity: targetAngular,
    navigationState: {
      ...navState,
      status: 'navigating',
      distanceToGoal: distToGoal,
      angleToGoal: alpha,
      localPath: [
        { x: robot.x, y: robot.y },
        targetPoint,
      ],
    },
    replanRequested: false,
  };
}

