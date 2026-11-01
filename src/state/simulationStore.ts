import { create } from 'zustand';
import {
  LaserScanData,
  MapData,
  NavigationState,
  PathPoint,
  RobotState,
  SimObject,
  TfFrame,
  WorkspaceMode,
  WorldEnvironmentType,
} from '../types/simulation';
import { PREDEFINED_WORLDS } from '../environments/worlds';
import { stepSimulation } from '../physics/engine';
import { simulateLidar, RaycastHitPoint } from '../sensors/lidar/raycaster';
import { OccupancyGridMap } from '../mapping/occupancyGrid';
import { CostmapEngine } from '../navigation/costmap';
import { planAStarPath } from '../navigation/aStarPlanner';
import { executePathFollowing } from '../navigation/pathFollower';
import { rosBus } from '../ros/messageBus';
import { computeTfTree } from '../ros/tfTree';

const INITIAL_ROBOT_STATE: RobotState = {
  x: -2.0,
  y: -0.5,
  z: 0.0,
  heading: 0,
  linearVelocity: 0,
  angularVelocity: 0,
  leftWheelVelocity: 0,
  rightWheelVelocity: 0,
  leftWheelRotation: 0,
  rightWheelRotation: 0,
  targetLinearVelocity: 0,
  targetAngularVelocity: 0,
  wheelBase: 0.160,
  wheelRadius: 0.033,
  maxLinearSpeed: 0.22,
  maxAngularSpeed: 2.84,
  linearAcceleration: 1.5,
  angularAcceleration: 3.2,
  collisionRadius: 0.11,
};

export interface RvizDisplaySettings {
  grid: { visible: boolean; cellSize: number; plane: 'xy' | 'xz'; color: string };
  robotModel: { visible: boolean; alpha: number };
  tf: { visible: boolean; showNames: boolean; showAxes: boolean; axisScale: number };
  laserScan: { visible: boolean; pointSize: number; colorMode: 'flat' | 'distance' | 'intensity'; flatColor: string };
  map: { visible: boolean; alpha: number; colorScheme: 'map' | 'costmap' };
  globalCostmap: { visible: boolean; alpha: number };
  localCostmap: { visible: boolean; alpha: number };
  path: { visible: boolean; color: string; width: number };
  trajectory: { visible: boolean; color: string; maxLength: number };
}

export interface SimulationStore {
  // Workspaces
  workspaceMode: WorkspaceMode;
  setWorkspaceMode: (mode: WorkspaceMode) => void;

  // Simulation Clock & Control
  isPaused: boolean;
  simSpeed: number;
  simTime: number; // seconds
  realTimeFactor: number;
  iterations: number;
  togglePause: () => void;
  setSimSpeed: (speed: number) => void;
  resetSimulation: () => void;
  resetWorld: () => void;

  // Environment & Objects
  currentWorld: WorldEnvironmentType;
  objects: SimObject[];
  selectedObjectId: string | null;
  activeTransformTool: 'select' | 'translate' | 'rotate';
  showCollisionGeometry: boolean;
  showGridFloor: boolean;
  showShadows: boolean;
  lowPerformanceMode: boolean;
  lidarRayCount: number;
  sensorNoise: boolean;

  setEnvironment: (world: WorldEnvironmentType) => void;
  addObject: (type: SimObject['type'], position?: { x: number; y: number; z: number }) => void;
  updateObject: (id: string, updates: Partial<SimObject>) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  setActiveTransformTool: (tool: 'select' | 'translate' | 'rotate') => void;
  toggleCollisionGeometry: () => void;
  toggleGridFloor: () => void;
  toggleShadows: () => void;
  toggleLowPerformanceMode: () => void;
  setLidarRayCount: (count: number) => void;
  toggleSensorNoise: () => void;

  // Robot State & Teleop
  robot: RobotState;
  trajectory: PathPoint[];
  lastCollision: boolean;
  setTeleopVelocity: (linear: number, angular: number) => void;
  emergencyStop: () => void;

  // Sensors & TF
  scanData: LaserScanData | null;
  scanHitPoints: RaycastHitPoint[];
  tfFrames: TfFrame[];
  fixedFrame: string;
  setFixedFrame: (frame: string) => void;

  // Mapping (SLAM)
  occupancyGridMap: OccupancyGridMap;
  mapData: MapData;
  startMapping: () => void;
  pauseMapping: () => void;
  resetMapping: () => void;

  // Costmaps & Navigation
  costmapEngine: CostmapEngine;
  navigation: NavigationState;
  setNavGoal: (x: number, y: number, heading?: number) => void;
  cancelNavGoal: () => void;
  recalculateNavPath: () => void;
  clearCostmaps: () => void;

  // RViz Displays & Tool
  rvizDisplays: RvizDisplaySettings;
  rvizTool: 'interact' | 'move_camera' | 'nav_goal' | 'pose_estimate';
  toggleDisplay: (key: keyof RvizDisplaySettings) => void;
  updateDisplaySetting: <K extends keyof RvizDisplaySettings>(
    key: K,
    prop: keyof RvizDisplaySettings[K],
    value: any
  ) => void;
  setRvizTool: (tool: 'interact' | 'move_camera' | 'nav_goal' | 'pose_estimate') => void;

  // UI Panels & Modals
  isTerminalOpen: boolean;
  isPracticalsOpen: boolean;
  isTopicMonitorOpen: boolean;
  isSettingsOpen: boolean;
  activePracticalId: string | null;
  completedPracticals: Record<string, boolean>;

  toggleTerminal: () => void;
  togglePracticals: () => void;
  toggleTopicMonitor: () => void;
  toggleSettings: () => void;
  setActivePracticalId: (id: string | null) => void;
  markPracticalCompleted: (id: string, completed: boolean) => void;

  // Main Simulation Tick (Physics + Sensors + Navigation + Mapping)
  tick: (deltaSeconds: number) => void;
}

const initialMap = new OccupancyGridMap(200, 200, 0.05, -5.0, -5.0);
const initialCostmap = new CostmapEngine(200, 200, 0.05, -5.0, -5.0);

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  workspaceMode: 'gazebo',
  setWorkspaceMode: (mode) => set({ workspaceMode: mode }),

  isPaused: false,
  simSpeed: 1.0,
  simTime: 0.0,
  realTimeFactor: 1.0,
  iterations: 0,
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setSimSpeed: (speed) => set({ simSpeed: speed }),

  resetSimulation: () => {
    const currentWorldDef = PREDEFINED_WORLDS[get().currentWorld];
    const initialPose = currentWorldDef.robotInitialPose;
    set({
      simTime: 0.0,
      iterations: 0,
      robot: {
        ...INITIAL_ROBOT_STATE,
        x: initialPose.x,
        y: initialPose.y,
        heading: initialPose.heading,
      },
      trajectory: [{ x: initialPose.x, y: initialPose.y }],
      navigation: {
        goal: null,
        globalPath: [],
        localPath: [],
        status: 'idle',
        distanceToGoal: 0,
        angleToGoal: 0,
        replanCount: 0,
      },
    });
  },

  resetWorld: () => {
    const currentWorldDef = PREDEFINED_WORLDS[get().currentWorld];
    const initialPose = currentWorldDef.robotInitialPose;
    get().occupancyGridMap.reset();
    set({
      simTime: 0.0,
      iterations: 0,
      objects: JSON.parse(JSON.stringify(currentWorldDef.objects)),
      selectedObjectId: null,
      robot: {
        ...INITIAL_ROBOT_STATE,
        x: initialPose.x,
        y: initialPose.y,
        heading: initialPose.heading,
      },
      trajectory: [{ x: initialPose.x, y: initialPose.y }],
      mapData: get().occupancyGridMap.getMapData(),
      navigation: {
        goal: null,
        globalPath: [],
        localPath: [],
        status: 'idle',
        distanceToGoal: 0,
        angleToGoal: 0,
        replanCount: 0,
      },
    });
  },

  currentWorld: 'turtlebot3_world',
  objects: JSON.parse(JSON.stringify(PREDEFINED_WORLDS.turtlebot3_world.objects)),
  selectedObjectId: null,
  activeTransformTool: 'select',
  showCollisionGeometry: false,
  showGridFloor: true,
  showShadows: true,
  lowPerformanceMode: false,
  lidarRayCount: 360,
  sensorNoise: true,

  setEnvironment: (worldKey) => {
    const worldDef = PREDEFINED_WORLDS[worldKey];
    get().occupancyGridMap.reset();
    set({
      currentWorld: worldKey,
      objects: JSON.parse(JSON.stringify(worldDef.objects)),
      selectedObjectId: null,
      robot: {
        ...INITIAL_ROBOT_STATE,
        x: worldDef.robotInitialPose.x,
        y: worldDef.robotInitialPose.y,
        heading: worldDef.robotInitialPose.heading,
      },
      trajectory: [{ x: worldDef.robotInitialPose.x, y: worldDef.robotInitialPose.y }],
      mapData: get().occupancyGridMap.getMapData(),
      navigation: {
        goal: null,
        globalPath: [],
        localPath: [],
        status: 'idle',
        distanceToGoal: 0,
        angleToGoal: 0,
        replanCount: 0,
      },
    });
  },

  addObject: (type, position) => {
    const id = `obj_${Date.now()}`;
    const defaultPos = position || { x: get().robot.x + 1.2, y: get().robot.y, z: 0.25 };
    let size = { x: 0.5, y: 0.5, z: 0.5 };
    let color = '#3498db';

    if (type === 'cylinder') {
      size = { x: 0.4, y: 0.4, z: 0.6 };
      color = '#e74c3c';
    } else if (type === 'wall') {
      size = { x: 2.0, y: 0.15, z: 0.6 };
      color = '#95a5a6';
    } else if (type === 'table') {
      size = { x: 1.2, y: 0.8, z: 0.5 };
      color = '#8d6e63';
    } else if (type === 'obstacle') {
      size = { x: 0.4, y: 0.4, z: 0.7 };
      color = '#f39c12';
    }

    const newObj: SimObject = {
      id,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${get().objects.length + 1}`,
      type,
      position: defaultPos,
      rotation: { x: 0, y: 0, z: 0 },
      size,
      color,
      isStatic: false,
    };

    set((state) => ({
      objects: [...state.objects, newObj],
      selectedObjectId: id,
    }));
  },

  updateObject: (id, updates) => {
    set((state) => ({
      objects: state.objects.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)),
    }));
  },

  removeObject: (id) => {
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
    }));
  },

  selectObject: (id) => set({ selectedObjectId: id }),
  setActiveTransformTool: (tool) => set({ activeTransformTool: tool }),
  toggleCollisionGeometry: () => set((state) => ({ showCollisionGeometry: !state.showCollisionGeometry })),
  toggleGridFloor: () => set((state) => ({ showGridFloor: !state.showGridFloor })),
  toggleShadows: () => set((state) => ({ showShadows: !state.showShadows })),
  toggleLowPerformanceMode: () =>
    set((state) => ({
      lowPerformanceMode: !state.lowPerformanceMode,
      lidarRayCount: !state.lowPerformanceMode ? 180 : 360,
      showShadows: !state.lowPerformanceMode ? false : state.showShadows,
    })),
  setLidarRayCount: (count) => set({ lidarRayCount: count }),
  toggleSensorNoise: () => set((state) => ({ sensorNoise: !state.sensorNoise })),

  robot: { ...INITIAL_ROBOT_STATE },
  trajectory: [{ x: INITIAL_ROBOT_STATE.x, y: INITIAL_ROBOT_STATE.y }],
  lastCollision: false,

  setTeleopVelocity: (linear, angular) => {
    if (get().isPaused) return; // Prevent driving when simulation is paused

    set((state) => ({
      robot: {
        ...state.robot,
        targetLinearVelocity: linear,
        targetAngularVelocity: angular,
      },
    }));

    // Publish to /cmd_vel topic
    rosBus.publish('/cmd_vel', {
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: angular },
    });
  },

  emergencyStop: () => {
    get().setTeleopVelocity(0, 0);
    get().cancelNavGoal();
  },

  scanData: null,
  scanHitPoints: [],
  tfFrames: [],
  fixedFrame: 'map',
  setFixedFrame: (frame) => set({ fixedFrame: frame }),

  occupancyGridMap: initialMap,
  mapData: initialMap.getMapData(),
  startMapping: () => {
    get().occupancyGridMap.isMapping = true;
    set({ mapData: get().occupancyGridMap.getMapData() });
  },
  pauseMapping: () => {
    get().occupancyGridMap.isMapping = false;
    set({ mapData: get().occupancyGridMap.getMapData() });
  },
  resetMapping: () => {
    get().occupancyGridMap.reset();
    set({ mapData: get().occupancyGridMap.getMapData() });
  },

  costmapEngine: initialCostmap,
  navigation: {
    goal: null,
    globalPath: [],
    localPath: [],
    status: 'idle',
    distanceToGoal: 0,
    angleToGoal: 0,
    replanCount: 0,
  },

  setNavGoal: (x, y, heading = 0) => {
    const { robot, costmapEngine } = get();

    // 1. Plan path using A*
    const path = planAStarPath(robot.x, robot.y, x, y, costmapEngine);

    const goal = { x, y, heading, reached: false, active: true };
    const dist = Math.hypot(x - robot.x, y - robot.y);

    set({
      navigation: {
        goal,
        globalPath: path,
        localPath: path.length > 0 ? [path[0]] : [],
        status: path.length > 0 ? 'navigating' : 'blocked',
        distanceToGoal: dist,
        angleToGoal: 0,
        replanCount: 0,
      },
    });

    // Publish goal to ROS bus
    rosBus.publish('/move_base_simple/goal', {
      header: { seq: 0, stamp: { secs: Math.floor(get().simTime), nsecs: 0 }, frame_id: 'map' },
      pose: {
        position: { x, y, z: 0 },
        orientation: { x: 0, y: 0, z: Math.sin(heading / 2), w: Math.cos(heading / 2) },
      },
    });

    if (path.length > 0) {
      rosBus.publish('/move_base/GlobalPlanner/plan', {
        header: { seq: 0, stamp: { secs: Math.floor(get().simTime), nsecs: 0 }, frame_id: 'map' },
        poses: path.map((pt) => ({
          header: { seq: 0, stamp: { secs: 0, nsecs: 0 }, frame_id: 'map' },
          pose: { position: { x: pt.x, y: pt.y, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } },
        })),
      });
    }
  },

  cancelNavGoal: () => {
    set((state) => ({
      navigation: {
        ...state.navigation,
        goal: null,
        globalPath: [],
        localPath: [],
        status: 'idle',
      },
    }));
    get().setTeleopVelocity(0, 0);
  },

  recalculateNavPath: () => {
    const { robot, navigation, costmapEngine } = get();
    if (!navigation.goal || !navigation.goal.active) return;

    const path = planAStarPath(robot.x, robot.y, navigation.goal.x, navigation.goal.y, costmapEngine);
    set((state) => ({
      navigation: {
        ...state.navigation,
        globalPath: path,
        status: path.length > 0 ? 'navigating' : 'blocked',
      },
    }));
  },

  clearCostmaps: () => {
    const { costmapEngine, mapData } = get();
    costmapEngine.updateGlobalCostmap(mapData);
  },

  rvizDisplays: {
    grid: { visible: true, cellSize: 1.0, plane: 'xy', color: '#555555' },
    robotModel: { visible: true, alpha: 1.0 },
    tf: { visible: true, showNames: true, showAxes: true, axisScale: 0.15 },
    laserScan: { visible: true, pointSize: 0.045, colorMode: 'distance', flatColor: '#ff2200' },
    map: { visible: true, alpha: 0.85, colorScheme: 'map' },
    globalCostmap: { visible: true, alpha: 0.45 },
    localCostmap: { visible: true, alpha: 0.55 },
    path: { visible: true, color: '#00ff88', width: 3 },
    trajectory: { visible: true, color: '#3498db', maxLength: 400 },
  },

  rvizTool: 'interact',
  toggleDisplay: (key) => {
    set((state) => ({
      rvizDisplays: {
        ...state.rvizDisplays,
        [key]: {
          ...state.rvizDisplays[key],
          visible: !state.rvizDisplays[key].visible,
        },
      },
    }));
  },

  updateDisplaySetting: (key, prop, value) => {
    set((state) => ({
      rvizDisplays: {
        ...state.rvizDisplays,
        [key]: {
          ...state.rvizDisplays[key],
          [prop]: value,
        },
      },
    }));
  },

  setRvizTool: (tool) => set({ rvizTool: tool }),

  isTerminalOpen: false,
  isPracticalsOpen: false,
  isTopicMonitorOpen: false,
  isSettingsOpen: false,
  activePracticalId: null,
  completedPracticals: {},

  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
  togglePracticals: () => set((state) => ({ isPracticalsOpen: !state.isPracticalsOpen })),
  toggleTopicMonitor: () => set((state) => ({ isTopicMonitorOpen: !state.isTopicMonitorOpen })),
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  setActivePracticalId: (id) => set({ activePracticalId: id }),
  markPracticalCompleted: (id, completed) =>
    set((state) => ({
      completedPracticals: {
        ...state.completedPracticals,
        [id]: completed,
      },
    })),

  // Simulation step tick
  tick: (dt: number) => {
    const state = get();
    if (state.isPaused) return;

    // Safety clamp dt to avoid spiral on lag / tab switch
    const effectiveDt = Math.min(dt, 0.033);

    // 1. Navigation Controller (if autonomous navigation is active)
    let effectiveRobot = state.robot;
    let nextNav = state.navigation;

    if (state.navigation.goal && state.navigation.goal.active) {
      const follower = executePathFollowing(state.robot, state.navigation, state.scanData);
      nextNav = follower.navigationState;

      if (follower.replanRequested && nextNav.replanCount < 5) {
        // Replan A*
        const newPath = planAStarPath(
          state.robot.x,
          state.robot.y,
          state.navigation.goal.x,
          state.navigation.goal.y,
          state.costmapEngine
        );
        nextNav.globalPath = newPath;
      }

      effectiveRobot = {
        ...effectiveRobot,
        targetLinearVelocity: follower.targetLinearVelocity,
        targetAngularVelocity: follower.targetAngularVelocity,
      };
    }

    // 2. Physics & Kinematics Step
    const stepRes = stepSimulation(effectiveRobot, state.objects, effectiveDt, state.simSpeed);
    const updatedRobot = stepRes.robotState;

    // 3. Sensor: LiDAR Raycasting
    // LDS-01 sensor offset on TurtleBot3 Burger: x = -0.032m
    const ldsX = updatedRobot.x - 0.032 * Math.cos(updatedRobot.heading);
    const ldsY = updatedRobot.y - 0.032 * Math.sin(updatedRobot.heading);

    const rayCount = state.lowPerformanceMode ? 180 : state.lidarRayCount;
    const { scanData, hitPoints } = simulateLidar(
      ldsX,
      ldsY,
      updatedRobot.heading,
      state.objects,
      rayCount,
      0.12,
      3.5
    );

    // 4. SLAM Occupancy Grid Update
    if (state.occupancyGridMap.isMapping) {
      state.occupancyGridMap.updateWithScan(updatedRobot, scanData);
    }
    const currentMapData = state.occupancyGridMap.getMapData();

    // 5. Costmap Updates
    state.costmapEngine.updateGlobalCostmap(currentMapData);
    state.costmapEngine.updateLocalCostmap(updatedRobot, scanData);

    // 6. TF Computation & Publishing
    const newSimTime = state.simTime + effectiveDt * state.simSpeed;
    const { frames, rosTfMessage } = computeTfTree(updatedRobot, newSimTime);

    // 7. Trajectory Breadcrumb update
    const lastPt = state.trajectory[state.trajectory.length - 1];
    let newTrajectory = state.trajectory;
    if (!lastPt || Math.hypot(updatedRobot.x - lastPt.x, updatedRobot.y - lastPt.y) > 0.05) {
      newTrajectory = [...state.trajectory, { x: updatedRobot.x, y: updatedRobot.y }].slice(-400);
    }

    // 8. Publish ROS topics
    rosBus.publish('/tf', rosTfMessage);
    rosBus.publish('/scan', {
      header: { seq: state.iterations, stamp: { secs: Math.floor(newSimTime), nsecs: 0 }, frame_id: 'base_scan' },
      angle_min: scanData.angleMin,
      angle_max: scanData.angleMax,
      angle_increment: scanData.angleIncrement,
      time_increment: scanData.timeIncrement,
      scan_time: scanData.scanTime,
      range_min: scanData.rangeMin,
      range_max: scanData.rangeMax,
      ranges: scanData.ranges,
      intensities: scanData.intensities,
    });
    rosBus.publish('/odom', {
      header: { seq: state.iterations, stamp: { secs: Math.floor(newSimTime), nsecs: 0 }, frame_id: 'odom' },
      child_frame_id: 'base_footprint',
      pose: {
        pose: {
          position: { x: updatedRobot.x, y: updatedRobot.y, z: 0 },
          orientation: {
            x: 0,
            y: 0,
            z: Math.sin(updatedRobot.heading / 2),
            w: Math.cos(updatedRobot.heading / 2),
          },
        },
        covariance: new Array(36).fill(0),
      },
      twist: {
        twist: {
          linear: { x: updatedRobot.linearVelocity, y: 0, z: 0 },
          angular: { x: 0, y: 0, z: updatedRobot.angularVelocity },
        },
        covariance: new Array(36).fill(0),
      },
    });

    // Publish /imu
    rosBus.publish('/imu', {
      header: { seq: state.iterations, stamp: { secs: Math.floor(newSimTime), nsecs: 0 }, frame_id: 'imu_link' },
      orientation: {
        x: 0,
        y: 0,
        z: Math.sin(updatedRobot.heading / 2),
        w: Math.cos(updatedRobot.heading / 2),
      },
      angular_velocity: { x: 0, y: 0, z: updatedRobot.angularVelocity },
      linear_acceleration: { x: 0, y: 0, z: 9.81 },
    });

    // Publish /map when mapping
    if (state.occupancyGridMap.isMapping && state.iterations % 5 === 0) {
      rosBus.publish('/map', {
        header: { seq: state.iterations, stamp: { secs: Math.floor(newSimTime), nsecs: 0 }, frame_id: 'map' },
        info: {
          map_load_time: { secs: Math.floor(newSimTime), nsecs: 0 },
          resolution: currentMapData.resolution,
          width: currentMapData.width,
          height: currentMapData.height,
          origin: { position: { x: currentMapData.originX, y: currentMapData.originY, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } },
        },
        data: currentMapData.data,
      });
    }

    set({
      simTime: newSimTime,
      iterations: state.iterations + 1,
      robot: updatedRobot,
      lastCollision: stepRes.collisionDetected,
      scanData,
      scanHitPoints: hitPoints,
      tfFrames: frames,
      mapData: currentMapData,
      navigation: nextNav,
      trajectory: newTrajectory,
    });
  },
}));
