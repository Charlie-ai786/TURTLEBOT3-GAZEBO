import { RobotState, TfFrame } from '../types/simulation';
import { RosTFMessage } from '../types/ros';

export function computeTfTree(robot: RobotState, simTimeSec: number): {
  frames: TfFrame[];
  rosTfMessage: RosTFMessage;
} {
  // Quaternions for 2D yaw: q = [0, 0, sin(yaw/2), cos(yaw/2)]
  const halfYaw = robot.heading / 2;
  const qz = Math.sin(halfYaw);
  const qw = Math.cos(halfYaw);

  // LDS-01 sensor height ~0.17m above ground, base_link at ~0.08m
  const frames: TfFrame[] = [
    // 1. World / Map frame
    {
      id: 'map',
      parentId: null,
      translation: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    },
    // 2. Odom frame (in this simulation odom matches map or small drift)
    {
      id: 'odom',
      parentId: 'map',
      translation: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    },
    // 3. base_footprint (ground projection of robot center)
    {
      id: 'base_footprint',
      parentId: 'odom',
      translation: { x: robot.x, y: robot.y, z: 0 },
      rotation: { x: 0, y: 0, z: robot.heading },
    },
    // 4. base_link (structural center, 0.08m height)
    {
      id: 'base_link',
      parentId: 'base_footprint',
      translation: { x: 0, y: 0, z: 0.08 },
      rotation: { x: 0, y: 0, z: 0 },
    },
    // 5. base_scan (LDS-01 LiDAR sensor, -0.032m back, 0.092m above base_link)
    {
      id: 'base_scan',
      parentId: 'base_link',
      translation: { x: -0.032, y: 0, z: 0.092 },
      rotation: { x: 0, y: 0, z: 0 },
    },
    // 6. left_wheel_link (y = +0.08m)
    {
      id: 'wheel_left_link',
      parentId: 'base_link',
      translation: { x: 0, y: 0.08, z: -0.047 },
      rotation: { x: robot.leftWheelRotation, y: 0, z: 0 },
    },
    // 7. right_wheel_link (y = -0.08m)
    {
      id: 'wheel_right_link',
      parentId: 'base_link',
      translation: { x: 0, y: -0.08, z: -0.047 },
      rotation: { x: robot.rightWheelRotation, y: 0, z: 0 },
    },
    // 8. caster_back_link (x = -0.081m)
    {
      id: 'caster_back_link',
      parentId: 'base_link',
      translation: { x: -0.081, y: 0, z: -0.06 },
      rotation: { x: 0, y: 0, z: 0 },
    },
  ];

  const secs = Math.floor(simTimeSec);
  const nsecs = Math.floor((simTimeSec - secs) * 1e9);

  const rosTfMessage: RosTFMessage = {
    transforms: [
      {
        header: { seq: 0, stamp: { secs, nsecs }, frame_id: 'map' },
        child_frame_id: 'odom',
        transform: {
          translation: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
        },
      },
      {
        header: { seq: 0, stamp: { secs, nsecs }, frame_id: 'odom' },
        child_frame_id: 'base_footprint',
        transform: {
          translation: { x: robot.x, y: robot.y, z: 0 },
          rotation: { x: 0, y: 0, z: qz, w: qw },
        },
      },
      {
        header: { seq: 0, stamp: { secs, nsecs }, frame_id: 'base_footprint' },
        child_frame_id: 'base_link',
        transform: {
          translation: { x: 0, y: 0, z: 0.08 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
        },
      },
      {
        header: { seq: 0, stamp: { secs, nsecs }, frame_id: 'base_link' },
        child_frame_id: 'base_scan',
        transform: {
          translation: { x: -0.032, y: 0, z: 0.092 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
        },
      },
    ],
  };

  return { frames, rosTfMessage };
}

