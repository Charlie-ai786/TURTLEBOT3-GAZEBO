import { RobotState, SimObject } from '../types/simulation';
import { resolveRobotCollisions } from './collision';

export interface StepResult {
  robotState: RobotState;
  collisionDetected: boolean;
  actualLinearVelocity: number;
  actualAngularVelocity: number;
}

export function stepSimulation(
  currentState: RobotState,
  objects: SimObject[],
  dt: number,
  speedMultiplier: number = 1.0
): StepResult {
  const effectiveDt = Math.min(dt * speedMultiplier, 0.05); // Prevent spiral on lag

  // 1. Accelerate / Decelerate towards target velocities
  const maxLinAcc = currentState.linearAcceleration * effectiveDt;
  const maxAngAcc = currentState.angularAcceleration * effectiveDt;

  let newLinVel = currentState.linearVelocity;
  let newAngVel = currentState.angularVelocity;

  const linDiff = currentState.targetLinearVelocity - currentState.linearVelocity;
  if (Math.abs(linDiff) <= maxLinAcc) {
    newLinVel = currentState.targetLinearVelocity;
  } else {
    newLinVel += Math.sign(linDiff) * maxLinAcc;
  }

  const angDiff = currentState.targetAngularVelocity - currentState.angularVelocity;
  if (Math.abs(angDiff) <= maxAngAcc) {
    newAngVel = currentState.targetAngularVelocity;
  } else {
    newAngVel += Math.sign(angDiff) * maxAngAcc;
  }

  // Enforce velocity limits
  newLinVel = Math.max(-currentState.maxLinearSpeed, Math.min(currentState.maxLinearSpeed, newLinVel));
  newAngVel = Math.max(-currentState.maxAngularSpeed, Math.min(currentState.maxAngularSpeed, newAngVel));

  // 2. Differential Drive Wheel Kinematics
  // v_right = v + (omega * L) / 2
  // v_left  = v - (omega * L) / 2
  const halfWheelBase = currentState.wheelBase / 2;
  const vRight = newLinVel + newAngVel * halfWheelBase;
  const vLeft = newLinVel - newAngVel * halfWheelBase;

  // Convert linear wheel speeds to wheel rotational velocities in rad/s
  const leftRotVel = vLeft / currentState.wheelRadius;
  const rightRotVel = vRight / currentState.wheelRadius;

  // Integrate wheel rotations for visualization
  const newLeftRot = currentState.leftWheelRotation + leftRotVel * effectiveDt;
  const newRightRot = currentState.rightWheelRotation + rightRotVel * effectiveDt;

  // 3. Pose integration
  let newHeading = currentState.heading + newAngVel * effectiveDt;
  // Normalize heading to [-PI, PI]
  while (newHeading > Math.PI) newHeading -= 2 * Math.PI;
  while (newHeading < -Math.PI) newHeading += 2 * Math.PI;

  const midHeading = currentState.heading + (newAngVel * effectiveDt) / 2;
  const tentativeX = currentState.x + newLinVel * Math.cos(midHeading) * effectiveDt;
  const tentativeY = currentState.y + newLinVel * Math.sin(midHeading) * effectiveDt;

  // 4. Solid Collision Detection and Sliding Resolution
  const colRes = resolveRobotCollisions(
    tentativeX,
    tentativeY,
    currentState.collisionRadius,
    objects
  );

  let finalX = colRes.newX;
  let finalY = colRes.newY;

  // If hard collision, dampen velocity
  if (colRes.collided) {
    newLinVel *= 0.5;
  }

  return {
    robotState: {
      ...currentState,
      x: finalX,
      y: finalY,
      heading: newHeading,
      linearVelocity: newLinVel,
      angularVelocity: newAngVel,
      leftWheelVelocity: leftRotVel,
      rightWheelVelocity: rightRotVel,
      leftWheelRotation: newLeftRot,
      rightWheelRotation: newRightRot,
    },
    collisionDetected: colRes.collided,
    actualLinearVelocity: newLinVel,
    actualAngularVelocity: newAngVel,
  };
}

