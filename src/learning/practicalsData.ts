import { Practical } from '../types/practicals';

export const TURTLEBOT3_PRACTICALS: Practical[] = [
  {
    id: 'p1',
    number: 1,
    title: 'Launch TurtleBot3 in Gazebo Simulation',
    aim: 'To simulate and launch the TurtleBot3 Burger robot in the Gazebo Classic 3D robotics simulation environment.',
    theory: `Gazebo is an open-source 3D robotics simulator capable of simulating robot populations in complex indoor and outdoor environments. In ROS, launch files (e.g., turtlebot3_world.launch) spawn the URDF (Unified Robot Description Format) model into the physics engine with defined inertial matrices, collision boundaries, and joint controllers.

The TurtleBot3 Burger is a compact differential-drive mobile robot driven by two DYNAMIXEL XL430 smart servos and supported by a rear passive caster wheel.`,
    requirements: [
      'Ubuntu 20.04 LTS with ROS Noetic (or Simulated Browser Engine)',
      'TurtleBot3 packages (turtlebot3_gazebo, turtlebot3_description)',
      'Gazebo Classic 11 simulator',
    ],
    procedure: [
      {
        stepNumber: 1,
        title: 'Set Robot Model Environment Variable',
        instruction: 'Specify the robot model architecture in the bash environment.',
        rosCommand: 'export TURTLEBOT3_MODEL=burger',
        expectedOutput: 'Environment variable TURTLEBOT3_MODEL set to "burger"',
      },
      {
        stepNumber: 2,
        title: 'Launch Gazebo World',
        instruction: 'Execute the launch file to load Gazebo physics, ground plane, and TurtleBot3 Burger.',
        rosCommand: 'roslaunch turtlebot3_gazebo turtlebot3_world.launch',
        expectedOutput: 'process[gazebo-1]: started with pid [1289]\nprocess[robot_state_publisher-2]: started with pid [1290]\nSuccessfully spawned [turtlebot3_burger]',
        autoActionText: 'Load TurtleBot3 World in Gazebo',
        actionId: 'load_world',
      },
      {
        stepNumber: 3,
        title: 'Inspect World Entities',
        instruction: 'Verify that the model and obstacles appear in the left scene tree.',
        rosCommand: 'gz model -l',
        expectedOutput: 'turtlebot3_burger\nground_plane\nwall_north\nwall_south\ncylinder_1',
      },
    ],
    rosCommands: [
      'export TURTLEBOT3_MODEL=burger',
      'roslaunch turtlebot3_gazebo turtlebot3_world.launch',
      'gz model -l',
    ],
    expectedResult:
      'The TurtleBot3 Burger is successfully spawned in the 3D physics environment with stable dynamics and resting on the ground plane.',
    vivaQuestions: [
      {
        question: 'What is the purpose of the TURTLEBOT3_MODEL environment variable?',
        answer: 'It instructs ROS launch files and node parameter servers which robot variant (Burger, Waffle, or Waffle Pi) to load URDF geometry and joint specifications for.',
      },
      {
        question: 'What physics engine is typically used by Gazebo Classic?',
        answer: 'Gazebo Classic primarily uses the Open Dynamics Engine (ODE), but also supports Bullet, DART, and Simbody.',
      },
    ],
    environment: 'turtlebot3_world',
  },
  {
    id: 'p2',
    number: 2,
    title: 'Differential Drive Keyboard Teleoperation',
    aim: 'To control the linear and angular motion of the TurtleBot3 Burger using differential drive kinematics via keyboard teleoperation.',
    theory: `Differential drive robots navigate by driving two independently powered wheels on a common axis. The motion equations are:

  Linear velocity: v = (v_right + v_left) / 2
  Angular velocity: ω = (v_right - v_left) / L

where L is the wheel baseline separation (0.160 m for TurtleBot3 Burger) and r is the wheel radius (0.033 m). The teleoperation node publishes 'geometry_msgs/Twist' messages to the /cmd_vel topic.`,
    requirements: [
      'Active Gazebo simulation',
      'turtlebot3_teleop package',
      'ROS geometry_msgs/Twist message structure',
    ],
    procedure: [
      {
        stepNumber: 1,
        title: 'Launch Teleoperation Node',
        instruction: 'Run the keyboard teleop node to capture W/A/S/D or arrow keystrokes.',
        rosCommand: 'roslaunch turtlebot3_teleop turtlebot3_teleop_key.launch',
        expectedOutput: 'Control Your TurtleBot3!\n---------------------------\nMoving around:\n   w\na  s  d\n   x\n\nw/x : increase/decrease linear velocity\na/d : increase/decrease angular velocity\nspace key, s : force stop',
        autoActionText: 'Activate Teleop Controls',
        actionId: 'focus_teleop',
      },
      {
        stepNumber: 2,
        title: 'Monitor Velocity Topic',
        instruction: 'Inspect the commanded velocity vectors published to /cmd_vel.',
        rosCommand: 'rostopic echo /cmd_vel',
        expectedOutput: 'linear:\n  x: 0.22\n  y: 0.0\n  z: 0.0\nangular:\n  x: 0.0\n  y: 0.0\n  z: 0.0',
      },
    ],
    rosCommands: [
      'roslaunch turtlebot3_teleop turtlebot3_teleop_key.launch',
      'rostopic echo /cmd_vel',
      'rostopic hz /cmd_vel',
    ],
    expectedResult:
      'The robot accelerates, decelerates, and steers in response to velocity commands, exhibiting wheel rotation and realistic friction without slipping through obstacles.',
    vivaQuestions: [
      {
        question: 'What happens when v_left = -v_right?',
        answer: 'The linear velocity is zero (v = 0) and the angular velocity is maximum (ω = 2*v_right / L). The robot turns purely in place around its vertical centroid.',
      },
      {
        question: 'Why does geometry_msgs/Twist have both linear and angular vectors with 3 components each?',
        answer: 'Twist represents full 6-DOF spatial velocity in 3D (vx, vy, vz and roll, pitch, yaw rates). For planar non-holonomic robots, only linear.x and angular.z are non-zero.',
      },
    ],
    environment: 'turtlebot3_world',
  },
  {
    id: 'p3',
    number: 3,
    title: 'Visualize LDS-01 LiDAR Data in RViz',
    aim: 'To configure and visualize 360-degree planar laser distance sensor (LiDAR) scans in RViz.',
    theory: `The TurtleBot3 Burger is equipped with a 360-degree LDS-01 (Laser Distance Sensor) LiDAR. It uses optical triangulation or time-of-flight to sample obstacle distances at 5 Hz with 360 rays (1° angular resolution) up to 3.5 meters.

The sensor driver publishes 'sensor_msgs/LaserScan' messages to the /scan topic containing ranges[], intensities[], angle_min, angle_max, and angle_increment.`,
    requirements: [
      'Gazebo simulation with LDS-01 plugin',
      'RViz 3D visualization tool',
      'sensor_msgs/LaserScan message definition',
    ],
    procedure: [
      {
        stepNumber: 1,
        title: 'Launch RViz with TurtleBot3 Configuration',
        instruction: 'Launch RViz and load the default TurtleBot3 visualization profile.',
        rosCommand: 'rosrun rviz rviz -d `rospack find turtlebot3_description`/rviz/model.rviz',
        expectedOutput: '[INFO] RViz initialized successfully. Subscribing to /scan...',
        autoActionText: 'Switch to RViz Workspace',
        actionId: 'switch_rviz',
      },
      {
        stepNumber: 2,
        title: 'Enable LaserScan Display Layer',
        instruction: 'Check the LaserScan display box and set Color Transformer to "Distance Rainbow".',
        rosCommand: 'rostopic hz /scan',
        expectedOutput: 'average rate: 5.02 Hz\nmin: 0.198s max: 0.203s std dev: 0.0018s',
      },
      {
        stepNumber: 3,
        title: 'Inspect Closest Obstacles',
        instruction: 'Observe how the laser dots shift dynamically as the robot moves near arena columns.',
        rosCommand: 'rostopic echo /scan -n 1',
        expectedOutput: 'header:\n  seq: 142\n  frame_id: "base_scan"\nangle_min: 0.0\nangle_max: 6.28318\nrange_min: 0.12\nrange_max: 3.5\nranges: [1.42, 1.41, 1.40, ...]',
      },
    ],
    rosCommands: [
      'rosrun rviz rviz',
      'rostopic echo /scan -n 1',
      'rostopic hz /scan',
    ],
    expectedResult:
      '360 LiDAR scan points are accurately cast against environment walls and pillars, colored by distance and updating at 5 Hz in RViz.',
    vivaQuestions: [
      {
        question: 'What is the frame_id of the laser scanner on TurtleBot3 Burger?',
        answer: 'The laser scanner frame is "base_scan", which is statically offset from "base_link" in the URDF description.',
      },
      {
        question: 'What does a range reading of infinity or range_max signify in a LaserScan message?',
        answer: 'It indicates that no obstacle was detected within the maximum detection range of the sensor (3.5 meters) along that particular beam angle.',
      },
    ],
    environment: 'turtlebot3_world',
  },
  {
    id: 'p4',
    number: 4,
    title: 'Understand Robot Coordinate Frames (TF Tree)',
    aim: 'To investigate the hierarchical transform tree (TF) and understand relationships between map, odom, base_footprint, base_link, and sensor frames.',
    theory: `The ROS TF (Transform) library tracks multiple coordinate frames over time in a tree structure. For autonomous mobile robots:
  - map: Global fixed world frame (SLAM drift-free reference)
  - odom: Continuous, smooth odometry frame (subject to wheel slippage drift)
  - base_footprint: 2D ground projection of robot centroid (z = 0)
  - base_link: Robot physical body origin
  - base_scan: Origin of the LDS-01 LiDAR sensor
  - wheel_left_link / wheel_right_link: Wheel rotational axes`,
    requirements: [
      'tf or tf2_tools packages',
      'robot_state_publisher node',
      'RViz TF display plugin',
    ],
    procedure: [
      {
        stepNumber: 1,
        title: 'View TF Tree Hierarchy',
        instruction: 'Generate the active transform tree visualization.',
        rosCommand: 'rosrun tf view_frames && evince frames.pdf',
        expectedOutput: 'Listening to /tf and /tf_static for 5.0 seconds...\nGenerated frames.pdf: map -> odom -> base_footprint -> base_link -> base_scan',
      },
      {
        stepNumber: 2,
        title: 'Echo Transform between base_link and map',
        instruction: 'Check the real-time spatial transform vector.',
        rosCommand: 'rosrun tf tf_echo map base_link',
        expectedOutput: 'At time 14.200\n- Translation: [-2.000, -0.500, 0.080]\n- Rotation: in Quaternion [0.000, 0.000, 0.000, 1.000]\n- Rotation: in RPY (degree) [0.000, 0.000, 0.000]',
      },
    ],
    rosCommands: [
      'rosrun tf view_frames',
      'rosrun tf tf_echo map base_link',
      'rostopic echo /tf -n 1',
    ],
    expectedResult:
      'The coordinate frames update synchronously as the robot drives, maintaining proper kinematic chains and rigid body spatial offsets.',
    vivaQuestions: [
      {
        question: 'Why is base_footprint separated from base_link?',
        answer: 'base_footprint is projected flat onto the ground plane (z = 0), allowing 2D planar navigation planners to compute obstacle footprints without 3D pitch/roll tilting complications.',
      },
      {
        question: 'What is the difference between /tf and /tf_static?',
        answer: '/tf carries dynamic high-frequency transforms that change as the robot drives (e.g., odom -> base_footprint), while /tf_static publishes immutable rigid body relationships (e.g., base_link -> base_scan) once with latched QoS.',
      },
    ],
    environment: 'turtlebot3_world',
  },
  {
    id: 'p5',
    number: 5,
    title: 'Perform SLAM Mapping (Occupancy Grid)',
    aim: 'To map an unknown environment using 2D LiDAR scans and robot odometry with an occupancy grid SLAM algorithm.',
    theory: `Simultaneous Localization and Mapping (SLAM) constructs a map of an unknown arena while concurrently estimating the robot's pose within it. 

The 2D Occupancy Grid represents the world as a grid of discrete cells:
  - Unknown: -1 (or gray)
  - Free space: 0 (white, low occupancy probability)
  - Occupied: 100 (black, obstacle detected)

Log-odds bayesian updates accumulate evidence along laser rays using Bresenham's line algorithm.`,
    requirements: [
      'gmapping or slam_toolbox ROS package',
      'Active /scan and /odom topics',
      'RViz Map display plugin',
    ],
    procedure: [
      {
        stepNumber: 1,
        title: 'Launch SLAM Node',
        instruction: 'Start the 2D occupancy grid mapping process.',
        rosCommand: 'roslaunch turtlebot3_slam turtlebot3_slam.launch slam_methods:=gmapping',
        expectedOutput: '[INFO] Started SLAM Gmapping node. Map size: 200x200 resolution: 0.05m.',
        autoActionText: 'Start Real-Time SLAM Mapping',
        actionId: 'start_slam',
      },
      {
        stepNumber: 2,
        title: 'Drive Robot to Explore Environment',
        instruction: 'Teleoperate the robot around walls and obstacles to expand the explored free space.',
        rosCommand: 'roslaunch turtlebot3_teleop turtlebot3_teleop_key.launch',
        expectedOutput: 'Mapping area updated: 42% explored...',
      },
    ],
    rosCommands: [
      'roslaunch turtlebot3_slam turtlebot3_slam.launch',
      'rostopic echo /map -n 1',
    ],
    expectedResult:
      'An accurate 2D occupancy grid map emerges in RViz, clearly delineating corridors, rooms, and solid obstacles.',
    vivaQuestions: [
      {
        question: 'What mathematical representation is used for cell occupancy values?',
        answer: 'Log-odds representation L(m) = log(P(m) / (1 - P(m))) is used to avoid numerical underflow and allow recursive additive updates.',
      },
      {
        question: 'Why does SLAM require odometry in addition to laser scans?',
        answer: 'Odometry provides initial dead-reckoning motion estimates between consecutive laser scans, which scan-matching algorithms refine to minimize cumulative drift.',
      },
    ],
    environment: 'turtlebot3_world',
  },
  {
    id: 'p6',
    number: 6,
    title: 'Save and Load 2D Maps',
    aim: 'To serialize the generated SLAM occupancy grid map into standard ROS map format (.yaml and .pgm) and reload it.',
    theory: `The ROS map_server package provides two primary utilities:
  1. map_saver: queries the /map topic and writes two files:
     - map.pgm: Portable Graymap format 8-bit image of the grid
     - map.yaml: Metadata specifying resolution (m/pixel), origin coordinates [x, y, yaw], and occupancy thresholds.
  2. map_server: loads the saved map files and publishes them as a static /map topic for localization (AMCL) and navigation.`,
    requirements: [
      'map_server package',
      'Completed SLAM occupancy map',
    ],
    procedure: [
      {
        stepNumber: 1,
        title: 'Save Map using map_saver',
        instruction: 'Execute map_saver to generate map.yaml and map.pgm.',
        rosCommand: 'rosrun map_server map_saver -f ~/map',
        expectedOutput: '[INFO] Waiting for the map...\n[INFO] Received a 200 X 200 map @ 0.050 m/pix\n[INFO] Writing map occupancy data to /home/ubuntu/map.pgm\n[INFO] Writing map metadata to /home/ubuntu/map.yaml\n[INFO] Done.',
        autoActionText: 'Export Map Files (.yaml / .pgm)',
        actionId: 'export_map',
      },
      {
        stepNumber: 2,
        title: 'Inspect map.yaml Metadata',
        instruction: 'Display the configuration parameters in the map metadata file.',
        rosCommand: 'cat ~/map.yaml',
        expectedOutput: 'image: map.pgm\nresolution: 0.050000\norigin: [-5.000000, -5.000000, 0.000000]\nnegate: 0\noccupied_thresh: 0.65\nfree_thresh: 0.196',
      },
    ],
    rosCommands: [
      'rosrun map_server map_saver -f ~/map',
      'cat ~/map.yaml',
      'rosrun map_server map_server ~/map.yaml',
    ],
    expectedResult:
      'Map files are successfully generated with correct metadata and can be loaded back into the navigation stack.',
    vivaQuestions: [
      {
        question: 'What does the resolution field in map.yaml indicate?',
        answer: 'Resolution specifies the physical size in meters represented by a single pixel in the PGM map image (e.g., 0.05 m = 5 cm per cell).',
      },
      {
        question: 'What do occupied_thresh and free_thresh control?',
        answer: 'They define the probability thresholds for classifying a pixel in the PGM image as occupied obstacle (>0.65) or free traversable space (<0.196).',
      },
    ],
    environment: 'turtlebot3_world',
  },
  {
    id: 'p7',
    number: 7,
    title: 'Autonomous Navigation with A* Global Planner',
    aim: 'To achieve autonomous point-to-point navigation using global path planning (A* algorithm) and inflated costmaps.',
    theory: `The ROS navigation stack (move_base) integrates:
  - Global Planner: Computes the shortest collision-free path across the entire known map using A* or Dijkstra search.
  - Global Costmap: Inflates obstacles by the robot's inscribed radius plus a safety clearance zone.
  - Local Planner: Tracks the global path while executing real-time velocity selection and curvature calculations.

The user sets a target destination by publishing to '/move_base_simple/goal'.`,
    requirements: [
      'move_base node',
      'Pre-built occupancy grid map',
      'RViz 2D Nav Goal tool',
    ],
    procedure: [
      {
        stepNumber: 1,
        title: 'Launch ROS Navigation Stack',
        instruction: 'Launch move_base with costmaps and A* global planner configured.',
        rosCommand: 'roslaunch turtlebot3_navigation turtlebot3_navigation.launch map_file:=$HOME/map.yaml',
        expectedOutput: '[INFO] Loaded global costmap. Inflation radius = 0.35m.\n[INFO] move_base ready. Awaiting 2D Nav Goal...',
        autoActionText: 'Switch to RViz & Enable Nav Stack',
        actionId: 'prep_nav',
      },
      {
        stepNumber: 2,
        title: 'Set 2D Nav Goal in RViz',
        instruction: 'Click the "2D Nav Goal" button in RViz and click any accessible point on the map.',
        rosCommand: 'rostopic pub /move_base_simple/goal geometry_msgs/PoseStamped ...',
        expectedOutput: '[INFO] Received new navigation goal: (x: 1.50, y: 1.20).\n[INFO] A* Global Planner generated path with 34 waypoints.\n[INFO] Robot navigating to goal...',
      },
    ],
    rosCommands: [
      'roslaunch turtlebot3_navigation turtlebot3_navigation.launch',
      'rostopic echo /move_base_simple/goal',
      'rostopic echo /move_base/GlobalPlanner/plan',
    ],
    expectedResult:
      'The A* algorithm generates a smooth green trajectory avoiding inflated obstacles, and the TurtleBot3 autonomously drives to the goal and aligns with the desired heading.',
    vivaQuestions: [
      {
        question: 'Why are obstacles inflated in the costmap?',
        answer: 'Obstacles are inflated by at least the robot radius so the planning algorithm can treat the robot as a zero-dimensional point, guaranteeing safe clearances.',
      },
      {
        question: 'How does A* differ from Dijkstra algorithm?',
        answer: 'A* uses an admissible heuristic function (such as Euclidean distance to goal) to guide the search towards the target, making it substantially faster than Dijkstra.',
      },
    ],
    environment: 'turtlebot3_world',
  },
  {
    id: 'p8',
    number: 8,
    title: 'Dynamic Obstacle Avoidance & Replanning',
    aim: 'To verify dynamic collision avoidance and online path replanning when unexpected obstacles block the planned route.',
    theory: `When an unexpected obstacle (such as a fallen box or newly placed obstacle) appears on the robot's planned path:
  1. The LDS-01 LiDAR immediately detects points within the obstacle layer.
  2. The local costmap updates at high frequency (10-20 Hz) with lethal cost cells.
  3. The local trajectory controller detects that the path is obstructed.
  4. The recovery behavior triggers the global planner to recalculate an alternative route around the obstacle.`,
    requirements: [
      'Autonomous navigation in progress',
      'Dynamic insertable obstacles in simulation',
      'Real-time costmap updater',
    ],
    procedure: [
      {
        stepNumber: 1,
        title: 'Start Navigation towards Target',
        instruction: 'Dispatch the robot towards a destination across the arena.',
        rosCommand: 'rostopic pub /move_base_simple/goal geometry_msgs/PoseStamped ...',
        expectedOutput: '[INFO] Navigating towards target (x: 2.0, y: 0.0)...',
        autoActionText: 'Set Navigation Goal to (2.0, 0.0)',
        actionId: 'set_target_p8',
      },
      {
        stepNumber: 2,
        title: 'Insert Obstacle in Robot Path',
        instruction: 'Drop a box or pillar directly in front of the moving robot.',
        rosCommand: 'gz model -m box_obstacle -s [x: 0.5, y: 0.0, z: 0.25]',
        expectedOutput: '[WARN] Imminent obstacle detected! Distance = 0.21m.\n[INFO] Path blocked! Initiating A* replan...\n[INFO] Alternative route computed around obstacle.',
        autoActionText: 'Insert Obstacle on Planned Route',
        actionId: 'insert_blocker',
      },
    ],
    rosCommands: [
      'rostopic echo /move_base/status',
      'rostopic echo /move_base/feedback',
    ],
    expectedResult:
      'Upon sensing the blocking obstacle, the robot decelerates to a stop, recalculates an alternative detour via A*, and successfully reaches the goal without collision.',
    vivaQuestions: [
      {
        question: 'What is a costmap recovery behavior in ROS navigation?',
        answer: 'If the robot becomes trapped or blocked, recovery behaviors such as clearing costmap layers or rotating in place are executed to clear potential phantom obstacles before declaring navigation failure.',
      },
      {
        question: 'What is the role of the local costmap vs the global costmap?',
        answer: 'The global costmap covers the whole map for long-distance path planning, whereas the local costmap maintains a small high-frequency window around the robot to react to dynamic obstacles.',
      },
    ],
    environment: 'turtlebot3_world',
  },
];

