import { SimObject, WorldEnvironmentType } from '../types/simulation';

export interface WorldDefinition {
  id: WorldEnvironmentType;
  name: string;
  description: string;
  robotInitialPose: { x: number; y: number; heading: number };
  objects: SimObject[];
}

export const PREDEFINED_WORLDS: Record<WorldEnvironmentType, WorldDefinition> = {
  // 1. Classic TurtleBot3 World (Hexagonal arena with cylinder pillars)
  turtlebot3_world: {
    id: 'turtlebot3_world',
    name: 'TurtleBot3 World',
    description: 'Iconic ROS TurtleBot3 World with central obstacles and perimeter walls',
    robotInitialPose: { x: -2.0, y: -0.5, heading: 0 },
    objects: [
      // Outer Arena Hexagon/Octagon Walls
      { id: 'w_north', name: 'Wall North', type: 'wall', position: { x: 0, y: 3.5, z: 0.25 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 7.0, y: 0.15, z: 0.5 }, color: '#888888', isStatic: true },
      { id: 'w_south', name: 'Wall South', type: 'wall', position: { x: 0, y: -3.5, z: 0.25 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 7.0, y: 0.15, z: 0.5 }, color: '#888888', isStatic: true },
      { id: 'w_east', name: 'Wall East', type: 'wall', position: { x: 3.5, y: 0, z: 0.25 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.15, y: 7.0, z: 0.5 }, color: '#888888', isStatic: true },
      { id: 'w_west', name: 'Wall West', type: 'wall', position: { x: -3.5, y: 0, z: 0.25 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.15, y: 7.0, z: 0.5 }, color: '#888888', isStatic: true },

      // Nine classic TurtleBot3 World pillars (arranged in 3x3 layout)
      { id: 'cyl_1', name: 'Cylinder Pillar 1', type: 'cylinder', position: { x: -1.2, y: 1.2, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.35, y: 0.35, z: 0.6 }, color: '#9c27b0', isStatic: true },
      { id: 'cyl_2', name: 'Cylinder Pillar 2', type: 'cylinder', position: { x: 0.0, y: 1.2, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.35, y: 0.35, z: 0.6 }, color: '#3f51b5', isStatic: true },
      { id: 'cyl_3', name: 'Cylinder Pillar 3', type: 'cylinder', position: { x: 1.2, y: 1.2, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.35, y: 0.35, z: 0.6 }, color: '#009688', isStatic: true },
      
      { id: 'cyl_4', name: 'Cylinder Pillar 4', type: 'cylinder', position: { x: -1.2, y: 0.0, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.35, y: 0.35, z: 0.6 }, color: '#ff9800', isStatic: true },
      { id: 'cyl_center', name: 'Central Pillar', type: 'cylinder', position: { x: 0.0, y: 0.0, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.45, y: 0.45, z: 0.6 }, color: '#e91e63', isStatic: true },
      { id: 'cyl_6', name: 'Cylinder Pillar 6', type: 'cylinder', position: { x: 1.2, y: 0.0, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.35, y: 0.35, z: 0.6 }, color: '#4caf50', isStatic: true },

      { id: 'cyl_7', name: 'Cylinder Pillar 7', type: 'cylinder', position: { x: -1.2, y: -1.2, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.35, y: 0.35, z: 0.6 }, color: '#2196f3', isStatic: true },
      { id: 'cyl_8', name: 'Cylinder Pillar 8', type: 'cylinder', position: { x: 0.0, y: -1.2, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.35, y: 0.35, z: 0.6 }, color: '#ff5722', isStatic: true },
      { id: 'cyl_9', name: 'Cylinder Pillar 9', type: 'cylinder', position: { x: 1.2, y: -1.2, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.35, y: 0.35, z: 0.6 }, color: '#673ab7', isStatic: true },

      // Additional boxes for navigational challenge
      { id: 'box_a', name: 'Cardboard Box A', type: 'box', position: { x: 2.2, y: -2.0, z: 0.25 }, rotation: { x: 0, y: 0, z: 0.2 }, size: { x: 0.5, y: 0.5, z: 0.5 }, color: '#c49a6c', isStatic: false },
      { id: 'box_b', name: 'Cardboard Box B', type: 'box', position: { x: -2.2, y: 2.0, z: 0.25 }, rotation: { x: 0, y: 0, z: -0.4 }, size: { x: 0.6, y: 0.6, z: 0.5 }, color: '#c49a6c', isStatic: false },
    ],
  },

  // 2. TurtleBot3 House (Multiple rooms, doorways, corridors, tables)
  turtlebot3_house: {
    id: 'turtlebot3_house',
    name: 'TurtleBot3 House',
    description: 'Multi-room residential layout with doors, corridors, living room, and bedroom',
    robotInitialPose: { x: -2.0, y: -2.0, heading: 1.57 },
    objects: [
      // Outer perimeter
      { id: 'h_north', name: 'House North Wall', type: 'wall', position: { x: 0, y: 3.5, z: 0.4 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 8.0, y: 0.15, z: 0.8 }, color: '#7f8c8d', isStatic: true },
      { id: 'h_south', name: 'House South Wall', type: 'wall', position: { x: 0, y: -3.5, z: 0.4 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 8.0, y: 0.15, z: 0.8 }, color: '#7f8c8d', isStatic: true },
      { id: 'h_east', name: 'House East Wall', type: 'wall', position: { x: 4.0, y: 0, z: 0.4 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.15, y: 7.0, z: 0.8 }, color: '#7f8c8d', isStatic: true },
      { id: 'h_west', name: 'House West Wall', type: 'wall', position: { x: -4.0, y: 0, z: 0.4 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.15, y: 7.0, z: 0.8 }, color: '#7f8c8d', isStatic: true },

      // Interior dividing walls creating rooms and corridors
      { id: 'h_mid_v', name: 'Corridor Wall', type: 'wall', position: { x: 0.5, y: 1.2, z: 0.4 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.15, y: 4.5, z: 0.8 }, color: '#95a5a6', isStatic: true },
      { id: 'h_mid_h1', name: 'Room Divider West', type: 'wall', position: { x: -2.2, y: 0.0, z: 0.4 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 3.5, y: 0.15, z: 0.8 }, color: '#95a5a6', isStatic: true },
      { id: 'h_mid_h2', name: 'Room Divider East', type: 'wall', position: { x: 2.5, y: -0.8, z: 0.4 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 2.8, y: 0.15, z: 0.8 }, color: '#95a5a6', isStatic: true },

      // Furniture
      { id: 'h_table', name: 'Dining Table', type: 'table', position: { x: 2.3, y: 1.8, z: 0.25 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 1.4, y: 0.8, z: 0.5 }, color: '#8d6e63', isStatic: true },
      { id: 'h_desk', name: 'Study Desk', type: 'table', position: { x: -2.5, y: 2.3, z: 0.25 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 1.2, y: 0.6, z: 0.5 }, color: '#5d4037', isStatic: true },
      { id: 'h_sofa', name: 'Living Room Sofa', type: 'box', position: { x: 2.4, y: -2.5, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 1.6, y: 0.7, z: 0.6 }, color: '#37474f', isStatic: true },
      { id: 'h_bed', name: 'Bedroom Bed', type: 'box', position: { x: -2.4, y: -2.5, z: 0.25 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 1.5, y: 1.1, z: 0.5 }, color: '#455a64', isStatic: true },
    ],
  },

  // 3. Indoor Laboratory (Lab workbenches, equipment racks, test obstacles)
  indoor_lab: {
    id: 'indoor_lab',
    name: 'Indoor Robotics Laboratory',
    description: 'Robotics research lab with testing arena, equipment benches, and calibration beacons',
    robotInitialPose: { x: 0, y: -2.2, heading: 1.57 },
    objects: [
      // Perimeter
      { id: 'l_north', name: 'Lab North Wall', type: 'wall', position: { x: 0, y: 3.0, z: 0.35 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 7.0, y: 0.15, z: 0.7 }, color: '#607d8b', isStatic: true },
      { id: 'l_south', name: 'Lab South Wall', type: 'wall', position: { x: 0, y: -3.0, z: 0.35 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 7.0, y: 0.15, z: 0.7 }, color: '#607d8b', isStatic: true },
      { id: 'l_east', name: 'Lab East Wall', type: 'wall', position: { x: 3.5, y: 0, z: 0.35 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.15, y: 6.0, z: 0.7 }, color: '#607d8b', isStatic: true },
      { id: 'l_west', name: 'Lab West Wall', type: 'wall', position: { x: -3.5, y: 0, z: 0.35 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.15, y: 6.0, z: 0.7 }, color: '#607d8b', isStatic: true },

      // Workbenches
      { id: 'l_bench_1', name: 'Workbench Alpha', type: 'table', position: { x: -2.0, y: 1.8, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 1.8, y: 0.8, z: 0.6 }, color: '#cfd8dc', isStatic: true },
      { id: 'l_bench_2', name: 'Workbench Beta', type: 'table', position: { x: 2.0, y: 1.8, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 1.8, y: 0.8, z: 0.6 }, color: '#cfd8dc', isStatic: true },
      { id: 'l_rack', name: 'Server Rack', type: 'box', position: { x: -2.8, y: -1.0, z: 0.45 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.7, y: 0.8, z: 0.9 }, color: '#263238', isStatic: true },

      // Test Columns & Obstacles
      { id: 'l_col_1', name: 'Calibration Column 1', type: 'cylinder', position: { x: -1.0, y: -0.2, z: 0.35 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.3, y: 0.3, z: 0.7 }, color: '#00acc1', isStatic: true },
      { id: 'l_col_2', name: 'Calibration Column 2', type: 'cylinder', position: { x: 1.0, y: -0.2, z: 0.35 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.3, y: 0.3, z: 0.7 }, color: '#00acc1', isStatic: true },
      { id: 'l_col_3', name: 'Target Beacon', type: 'cylinder', position: { x: 0.0, y: 1.8, z: 0.35 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.25, y: 0.25, z: 0.7 }, color: '#e53935', isStatic: true },
    ],
  },

  // 4. Obstacle Course (Slalom cylinders, chicanes, narrow corridors for navigation testing)
  obstacle_course: {
    id: 'obstacle_course',
    name: 'Obstacle Course',
    description: 'Navigation testing track with slalom pillars, chicanes, and tight waypoints',
    robotInitialPose: { x: -3.0, y: -2.0, heading: 1.0 },
    objects: [
      // Perimeter
      { id: 'oc_north', name: 'Track North Wall', type: 'wall', position: { x: 0, y: 3.5, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 8.0, y: 0.15, z: 0.6 }, color: '#d32f2f', isStatic: true },
      { id: 'oc_south', name: 'Track South Wall', type: 'wall', position: { x: 0, y: -3.5, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 8.0, y: 0.15, z: 0.6 }, color: '#d32f2f', isStatic: true },
      { id: 'oc_east', name: 'Track East Wall', type: 'wall', position: { x: 4.0, y: 0, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.15, y: 7.0, z: 0.6 }, color: '#d32f2f', isStatic: true },
      { id: 'oc_west', name: 'Track West Wall', type: 'wall', position: { x: -4.0, y: 0, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.15, y: 7.0, z: 0.6 }, color: '#d32f2f', isStatic: true },

      // Slalom pillars
      { id: 'oc_p1', name: 'Slalom 1', type: 'cylinder', position: { x: -2.5, y: 0.0, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.25, y: 0.25, z: 0.6 }, color: '#fbc02d', isStatic: true },
      { id: 'oc_p2', name: 'Slalom 2', type: 'cylinder', position: { x: -1.5, y: 1.5, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.25, y: 0.25, z: 0.6 }, color: '#fbc02d', isStatic: true },
      { id: 'oc_p3', name: 'Slalom 3', type: 'cylinder', position: { x: -0.5, y: -1.0, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.25, y: 0.25, z: 0.6 }, color: '#fbc02d', isStatic: true },
      { id: 'oc_p4', name: 'Slalom 4', type: 'cylinder', position: { x: 0.5, y: 1.2, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.25, y: 0.25, z: 0.6 }, color: '#fbc02d', isStatic: true },
      { id: 'oc_p5', name: 'Slalom 5', type: 'cylinder', position: { x: 1.5, y: -1.2, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.25, y: 0.25, z: 0.6 }, color: '#fbc02d', isStatic: true },
      { id: 'oc_p6', name: 'Slalom 6', type: 'cylinder', position: { x: 2.5, y: 0.5, z: 0.3 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.25, y: 0.25, z: 0.6 }, color: '#fbc02d', isStatic: true },

      // Chicane baffle walls
      { id: 'oc_baffle1', name: 'Baffle Wall 1', type: 'wall', position: { x: -1.0, y: -2.5, z: 0.25 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.15, y: 1.8, z: 0.5 }, color: '#e64a19', isStatic: true },
      { id: 'oc_baffle2', name: 'Baffle Wall 2', type: 'wall', position: { x: 1.0, y: 2.5, z: 0.25 }, rotation: { x: 0, y: 0, z: 0 }, size: { x: 0.15, y: 1.8, z: 0.5 }, color: '#e64a19', isStatic: true },
    ],
  },

  // 5. Empty World (Flat ground with grid)
  empty_world: {
    id: 'empty_world',
    name: 'Empty World',
    description: 'Empty Gazebo world with ground plane and unbounded navigation area',
    robotInitialPose: { x: 0, y: 0, heading: 0 },
    objects: [],
  },
};

