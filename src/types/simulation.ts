// Simulation and Robotics Types

export type WorkspaceMode = 'gazebo' | 'rviz' | 'combined';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Transform {
  translation: Vector3D;
  rotation: Vector3D; // roll, pitch, yaw in radians
}

export interface SimObject {
  id: string;
  name: string;
  type: 'box' | 'cylinder' | 'sphere' | 'wall' | 'table' | 'obstacle' | 'ground' | 'robot';
  position: Vector3D;
  rotation: Vector3D; // radians
  size: Vector3D; // for box/wall: [w, d, h]; for cylinder: [radius, radius, height]; for sphere: [radius, radius, radius]
  color?: string;
  isStatic: boolean;
  selected?: boolean;
}

export interface RobotState {
  // Global 2D Pose
  x: number;
  y: number;
  z: number;
  heading: number; // yaw in radians

  // Differential drive velocities
  linearVelocity: number; // m/s (forward)
  angularVelocity: number; // rad/s (yaw rate)
  leftWheelVelocity: number; // rad/s
  rightWheelVelocity: number; // rad/s
  leftWheelRotation: number; // integrated radians
  rightWheelRotation: number; // integrated radians

  // Target command velocities (cmd_vel)
  targetLinearVelocity: number;
  targetAngularVelocity: number;

  // Specifications
  wheelBase: number; // distance between wheels (0.160m)
  wheelRadius: number; // wheel radius (0.033m)
  maxLinearSpeed: number; // 0.22 m/s
  maxAngularSpeed: number; // 2.84 rad/s
  linearAcceleration: number; // 1.5 m/s²
  angularAcceleration: number; // 3.2 rad/s²
  collisionRadius: number; // 0.11m
}

export interface LaserScanData {
  angleMin: number;
  angleMax: number;
  angleIncrement: number;
  timeIncrement: number;
  scanTime: number;
  rangeMin: number;
  rangeMax: number;
  ranges: number[];
  intensities: number[];
  numRays: number;
  scanFrequency: number;
  timestamp: number;
  closestDistance: number;
  closestAngle: number;
}

export interface OdometryData {
  x: number;
  y: number;
  heading: number;
  linearVelocity: number;
  angularVelocity: number;
  timestamp: number;
}

export interface MapData {
  width: number;
  height: number;
  resolution: number; // meters per cell
  originX: number; // world coord of grid (0,0)
  originY: number;
  data: Int8Array; // -1: unknown, 0: free, 100: occupied
  isMapping: boolean;
}

export interface CostmapData {
  width: number;
  height: number;
  resolution: number;
  originX: number;
  originY: number;
  data: Uint8Array; // 0-255 cost
}

export interface NavGoal {
  x: number;
  y: number;
  heading: number;
  reached: boolean;
  active: boolean;
}

export interface PathPoint {
  x: number;
  y: number;
}

export interface NavigationState {
  goal: NavGoal | null;
  globalPath: PathPoint[];
  localPath: PathPoint[];
  status: 'idle' | 'planning' | 'navigating' | 'reached' | 'blocked' | 'aborted';
  distanceToGoal: number;
  angleToGoal: number;
  replanCount: number;
}

export interface TfFrame {
  id: string;
  parentId: string | null;
  translation: Vector3D;
  rotation: Vector3D;
}

export type WorldEnvironmentType = 
  | 'turtlebot3_world'
  | 'turtlebot3_house'
  | 'indoor_lab'
  | 'obstacle_course'
  | 'empty_world';

