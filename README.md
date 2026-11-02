# TurtleBot3 Gazebo Classic & RViz Web Simulation Suite

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r187-black.svg)](https://threejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-62%20passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

A high-fidelity, browser-based recreation of the **TurtleBot3 Burger** robotics simulation environment, authentic to the desktop workflows of **ROS Gazebo Classic 11** and **RViz (ROS 1 Noetic)**.

This software runs entirely client-side in standard modern web browsers (Chrome, Edge, Firefox) without requiring an Ubuntu Linux installation, ROS middleware, Gazebo, or physical hardware.

---

## Table of Contents

- [1. Overview & Visual Design](#1-overview--visual-design)
- [2. System Architecture](#2-system-architecture)
  - [Workspace A: Gazebo Classic Simulator](#workspace-a-gazebo-classic-simulator)
  - [Workspace B: RViz Visualizer](#workspace-b-rviz-visualizer)
  - [Workspace C: Combined View](#workspace-c-combined-view)
- [3. Robot Specifications & Differential Drive Kinematics](#3-robot-specifications--differential-drive-kinematics)
- [4. Sensors & Coordinate Frames (TF Tree)](#4-sensors--coordinate-frames-tf-tree)
- [5. 2D SLAM Mapping & Autonomous Navigation Stack](#5-2d-slam-mapping--autonomous-navigation-stack)
- [6. VS Code-Style Resizable ROS Terminal](#6-vs-code-style-resizable-ros-terminal)
- [7. Complete ROS 1 & ROS 2 Command Reference](#7-complete-ros-1--ros-2-command-reference)
- [8. Predefined 3D Simulation Environments](#8-predefined-3d-simulation-environments)
- [9. Hands-On Educational Practicals (8 Labs)](#9-hands-on-educational-practicals-8-labs)
- [10. Project Directory Structure](#10-project-directory-structure)
- [11. Technology Stack](#11-technology-stack)
- [12. Installation & Getting Started](#12-installation--getting-started)
- [13. Automated Test Verification](#13-automated-test-verification)
- [14. Keyboard Shortcuts & Controls](#14-keyboard-shortcuts--controls)

---

## 1. Overview & Visual Design

The application intentionally avoids generic SaaS dashboard aesthetics, bright gradients, or decorative cards. It strictly adheres to the traditional desktop engineering interface language of **Gazebo Classic 11** and **RViz Noetic**:
- Traditional neutral grey palettes (`#2b2b2b`, `#1e1e1e`, `#121214`).
- Compact toolbars with native icons, coordinate readouts, and simulation metrics.
- Large primary 3D viewport with unobstructed camera manipulation (Orbit, Pan, Zoom, Top, Front, Perspective).
- Dockable and resizable panels with zero-gap CSS Flexbox layout (`height: 100dvh; min-height: 0;`).
- Native Three.js `ResizeObserver` synchronization ensuring zero black bars or view distortions during window or terminal resizing.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Bar                              │
│ [Workspaces: Gazebo | RViz | Combined] [Sim Controls: ▶ ⏸ ⏹ ↺] [Distro] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                       Active 3D Workspace                              │
│                                                                        │
│   ┌──────────────────────────────┬─────────────────────────────────┐   │
│   │      Gazebo Simulator        │        RViz Visualizer          │   │
│   │  - Physics & Dynamics Engine │  - LDS-01 LaserScan point cloud │   │
│   │  - 3D Collision Mesh & Ray   │  - 2D Occupancy Grid Map Layer  │   │
│   │  - Model Insertion & Gizmos  │  - Local & Global Costmaps      │   │
│   │  - Lighting & Ground Planes  │  - A* Planned Path & Trajectory │   │
│   │  - Camera Preset Positions   │  - TF Coordinate Axes & Frames  │   │
│   └──────────────────────────────┴─────────────────────────────────┘   │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│               VS Code-Style Resizable ROS Terminal                     │
│  - Stateful Linux Bash / In-Memory Filesystem / ROS 1 & ROS 2 Engine   │
│  - Live Message Bus (rosBus) streaming /pub, /echo, /odom, /scan, /cmd │
└────────────────────────────────────────────────────────────────────────┘
```

### Workspace A: Gazebo Classic Simulator
- **Physics Engine:** Differential drive kinematics with wheel slip prevention, velocity ramp acceleration limiting, and bounding-circle collision resolution.
- **Model Insertion:** Spawn boxes, cylinders, spheres, barrier walls, and custom obstacle configurations.
- **Interactive Transform Gizmos:** Translate and rotate objects dynamically using Drei TransformControls.
- **Entity Inspector:** Real-time inspector displaying coordinate positions, Euler rotations, dimensions, and static attributes.
- **Camera Controls:** Instant perspective switching: Top-down ($Z=8\text{m}$), Perspective isometric, Front view, and Left view.

### Workspace B: RViz Visualizer
- **LaserScan Layer:** Flat, distance-based, or intensity-colored 360-degree point clouds sampled from physical raycasting.
- **Occupancy Grid Map:** Dynamic black/white/gray grayscale tile rendering of explored, free, and occupied spaces.
- **Global & Local Costmaps:** Color-coded inflation layers with lethal obstacle centers, inscribed buffers, and decay gradients.
- **TF Coordinate Hierarchy:** Visual RGB 3D axes ($X=\text{Red}$, $Y=\text{Green}$, $Z=\text{Blue}$) for all active frames.
- **Interactive 2D Nav Goal:** Click-and-drag waypoint placement on the ground plane triggering autonomous A* path generation.
- **Robot Model:** Transparent URDF-accurate CAD footprint of the TurtleBot3 Burger.

### Workspace C: Combined View
- Side-by-side synchronized display with Gazebo Classic physical simulation on the left and RViz sensor visualization on the right.
- Shared clock, physics state, kinematics, and message bus.

---

## 3. Robot Specifications & Differential Drive Kinematics

The simulated robot is modeled precisely after the physical **ROBOTIS TurtleBot3 Burger**:

| Parameter | Specification | Simulation Implementation |
|---|---|---|
| **Robot Type** | Differential Drive Mobile Base | Non-holonomic unicycle kinematics |
| **Wheel Base ($L$)** | $160\text{ mm}$ ($0.160\text{ m}$) | Inter-wheel spacing for yaw rate calculation |
| **Wheel Radius ($R$)** | $33\text{ mm}$ ($0.033\text{ m}$) | Wheel circumference rotation calculations |
| **Max Linear Velocity ($v_{\max}$)** | $0.22\text{ m/s}$ | Velocity limiter clamped with acceleration slope |
| **Max Angular Velocity ($\omega_{\max}$)** | $2.84\text{ rad/s}$ ($\approx 162.7^\circ/\text{s}$) | Yaw turn rate clamped with slope |
| **Linear Acceleration** | $1.5\text{ m/s}^2$ | Smooth velocity ramp modeling inertia |
| **Angular Acceleration** | $3.2\text{ rad/s}^2$ | Smooth rotational rate transition |
| **Collision Radius** | $0.11\text{ m}$ | Circle collision geometry against static walls/obstacles |

### Kinematic Equations
$$\begin{cases}
\dot{x} = v \cos(\theta) \\
\dot{y} = v \sin(\theta) \\
\dot{\theta} = \omega
\end{cases}
\qquad
\begin{cases}
v_L = v - \dfrac{\omega \cdot L}{2} \\
v_R = v + \dfrac{\omega \cdot L}{2}
\end{cases}$$

---

## 4. Sensors & Coordinate Frames (TF Tree)

### LDS-01 360° LiDAR Sensor
- **Ray Density:** Configurable 90, 180, or 360 rays per revolution.
- **Scan Range:** $0.12\text{ m}$ minimum to $3.5\text{ m}$ maximum detection range.
- **Scan Frequency:** $5.0\text{ Hz}$ standard LDS rotation frequency.
- **Sensor Noise Model:** Optional Gaussian noise ($\sigma = 0.015\text{ m}$) simulating real optical measurement variance.
- **Raycasting:** High-performance geometric 2D line-segment intersection against all static obstacles and bounding boxes.

### TF Tree Frame Structure
```
map
 └── odom
      └── base_footprint
           └── base_link
                ├── base_scan (LiDAR LDS-01 sensor origin)
                ├── wheel_left_link
                └── wheel_right_link
```

---

## 5. 2D SLAM Mapping & Autonomous Navigation Stack

### 1. Bayesian Occupancy Grid Mapping (SLAM)
- Log-odds evidence accumulation:
  $$l_{t}(m_i) = l_{t-1}(m_i) + \text{inv\_sensor\_model}(m_i, z_t) - l_0$$
- Bresenham line ray-tracing marks traversed cells as free space ($l_{\text{free}} = -0.4$) and endpoint collision cells as occupied ($l_{\text{occ}} = +0.85$).
- Dynamic resolution: $0.05\text{ m}$ per cell across a $200 \times 200$ grid ($10\text{m} \times 10\text{m}$ area).

### 2. Layered Costmaps (Global & Local)
- **Obstacle Layer:** Direct mapping of occupied LiDAR return cells.
- **Inflation Layer:** Exponential decay cost calculation based on robot collision footprint:
  $$\text{cost} = \text{LETHAL} \cdot \exp\left(-\alpha \cdot (d - r_{\text{inscribed}})\right)$$

### 3. A* Global Path Planning
- 8-connected grid search minimizing $f(n) = g(n) + h(n)$ with Euclidean distance heuristic and costmap inflation weighting.
- Automatic path pruning and linear string-pulling smoothing.

### 4. Path Follower (Pure Pursuit Controller)
- Dynamic lookahead distance ($0.25\text{ m}$ to $0.45\text{ m}$) following generated waypoints.
- Proportional steering control with automatic speed deceleration near the target pose.

---

## 6. VS Code-Style Resizable ROS Terminal

The bottom-docked terminal functions identically to Visual Studio Code's integrated terminal panel:
- **Vertical Resizing:** Drag the top border upward or downward using mouse pointer events with continuous `requestAnimationFrame` updates.
- **Dimension Clamping:** Enforces strict limits: Minimum $150\text{ px}$, Maximum $85\text{ vh}$ (leaving the top menu accessible), Default $350\text{ px}$.
- **Window Controls:**
  - **Minimize ($\mathbf{-}$):** Collapses terminal to a $34\text{ px}$ toolbar row, instantly restoring full viewport height.
  - **Maximize ($\mathbf{\square}$):** Expands terminal to $85\text{ vh}$ while preserving header navigation.
  - **Restore ($\mathbf{\square\hspace{-4pt}\square}$):** Restores exact previous dimensions.
  - **Close ($\mathbf{\times}$):** Hides panel without stopping running ROS nodes or physics.
- **Persistence:** Layout dimensions and minimize/maximize state are preserved in `localStorage` across reloads.
- **Interactive Shell Features:**
  - `Tab` command and filesystem autocompletion.
  - `↑` / `↓` Bash command history navigation.
  - `Ctrl + C` halts streaming topics and kills foreground processes.
  - `Ctrl + L` clears terminal output.
  - Prompt dynamically reflects working directory (`ubuntu@turtlebot3:~/catkin_ws$`).

---

## 7. Complete ROS 1 & ROS 2 Command Reference

### ROS 1 (Noetic) Command Set
| Command | Usage Example | Function |
|---|---|---|
| `roscore` | `roscore` | Starts master coordinator, param server, and `/rosout` |
| `rosnode list` | `rosnode list` | Lists all registered nodes |
| `rosnode info` | `rosnode info /turtlebot3_core` | Shows publishers, subscribers, services, and PID |
| `rosnode ping` | `rosnode ping /turtlebot3_core` | Measures XML-RPC round-trip latency |
| `rosnode kill` | `rosnode kill /slam_gmapping` | Terminates a running node |
| `rostopic list` | `rostopic list -v` | Lists all active topics (verbose shows pub/sub breakdown) |
| `rostopic echo` | `rostopic echo /scan -n 1` | Streams live topic messages (supports `-n <count>`) |
| `rostopic hz` | `rostopic hz /odom` | Measures publishing rate in Hz |
| `rostopic type` | `rostopic type /cmd_vel` | Displays message type (`geometry_msgs/Twist`) |
| `rostopic info` | `rostopic info /scan` | Shows topic type and connecting nodes |
| `rostopic pub` | `rostopic pub -1 /cmd_vel geometry_msgs/Twist "linear: {x: 0.2}"` | Publishes directly to simulation physics! |
| `rosservice list` | `rosservice list` | Lists services (`/reset_simulation`, `/gazebo/pause_physics`) |
| `rosservice type` | `rosservice type /reset_simulation` | Prints service type (`std_srvs/Empty`) |
| `rosservice call` | `rosservice call /reset_simulation` | Executes simulation actions |
| `rosparam get` | `rosparam get /turtlebot3_model` | Reads parameter value (`burger`) |
| `rosparam set` | `rosparam set /turtlebot3_model waffle` | Sets parameter value |
| `rospack find` | `rospack find turtlebot3_gazebo` | Locates package filesystem path |
| `roslaunch` | `roslaunch turtlebot3_gazebo turtlebot3_world.launch` | Spawns world, SLAM, or navigation stack |
| `rosrun` | `rosrun turtlebot3_teleop turtlebot3_teleop_key` | Runs standalone node executable |
| `rosversion` | `rosversion -d` | Outputs `noetic` |

### ROS 2 (Humble) Command Set
| Command | Usage Example | Function |
|---|---|---|
| `roscore` | `roscore` | **Rejected with error:** Explains decentralized DDS architecture |
| `ros2 --help` | `ros2 --help` | Displays command verb reference |
| `ros2 node list` | `ros2 node list` | Lists discoverable ROS 2 nodes |
| `ros2 node info` | `ros2 node info /turtlebot3_node` | Shows publishers, subscribers, and service servers |
| `ros2 topic list` | `ros2 topic list -t` | Lists active topics with message types |
| `ros2 topic echo` | `ros2 topic echo /odom -n 5` | Streams live DDS topic messages |
| `ros2 topic hz` | `ros2 topic hz /scan` | Measures topic frequency |
| `ros2 topic type` | `ros2 topic type /cmd_vel` | Displays type (`geometry_msgs/msg/Twist`) |
| `ros2 topic pub` | `ros2 topic pub /cmd_vel geometry_msgs/msg/Twist "linear: {x: 0.1}"` | Publishes velocity to 3D robot |
| `ros2 service list` | `ros2 service list` | Lists ROS 2 service endpoints |
| `ros2 service call` | `ros2 service call /reset_simulation std_srvs/srv/Empty` | Calls service synchronously |
| `ros2 param get` | `ros2 param get /turtlebot3_node /turtlebot3_model` | Reads node parameter |
| `ros2 param set` | `ros2 param set /turtlebot3_node /turtlebot3_model waffle` | Writes node parameter |
| `ros2 pkg prefix` | `ros2 pkg prefix turtlebot3_gazebo` | Prints install prefix directory |
| `ros2 launch` | `ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py` | Runs Python launch scripts |

### Supported Linux Bash Commands
- **Environment:** `export KEY=VAL`, `echo $KEY`, `printenv [KEY]`, `env`, `unset KEY`, `source <script>`
- **Filesystem:** `pwd`, `cd [dir]`, `ls [-la]`, `mkdir [-p]`, `touch`, `cat`, `head [-n]`, `tail [-n]`, `find`, `rm [-rf]`
- **System Utilities:** `whoami`, `hostname`, `uname [-a, -r]`, `date`, `which`, `printf`, `ps`, `jobs`, `kill <pid>`, `clear`, `history [-c]`, `man <cmd>`, `help`

---

## 8. Predefined 3D Simulation Environments

1. **`turtlebot3_world` (Official 9-Pillar World):** Classic Gazebo evaluation map featuring 9 cylindrical columns arranged in a $3 \times 3$ grid enclosed by bounding walls.
2. **`turtlebot3_house` (Multi-Room Residential Layout):** Complex layout with interior rooms, doorways, corridors, and tables designed for SLAM and local path planning.
3. **`indoor_lab` (Robotics Research Laboratory):** Laboratory setting with test benches, computer server racks, and calibration columns.
4. **`obstacle_course` (Dynamic Navigation Track):** High-difficulty slalom obstacle track with staggered pylons and baffle walls for dynamic replanning tests.
5. **`empty_world` (Open Ground Plane):** Pure planar floor for precision odometry calibration and open-loop kinematics validation.

---

## 9. Hands-On Educational Practicals (8 Labs)

The built-in **Practicals Panel** provides guided step-by-step laboratories with theoretical explanations, procedures, interactive commands, and viva questions:

1. **Lab 1: Launch TurtleBot3 in Gazebo Simulation:** Setting `TURTLEBOT3_MODEL=burger`, starting physics, inspecting world coordinate axes.
2. **Lab 2: Differential Drive Keyboard Teleoperation:** Driving the robot with W/A/S/D keys, understanding linear/angular velocities, monitoring `/cmd_vel`.
3. **Lab 3: Visualize LDS-01 LiDAR Data in RViz:** Configuring `LaserScan` displays, understanding distance threshold coloring, measuring blind spots.
4. **Lab 4: Understand Robot Coordinate Frames (TF Tree):** Visualizing transformation links (`map` $\to$ `odom` $\to$ `base_footprint` $\to$ `base_scan`).
5. **Lab 5: Perform SLAM Mapping (Occupancy Grid):** Teleoperating the robot through unknown rooms to generate a 2D occupancy grid map via log-odds updates.
6. **Lab 6: Save and Load 2D Maps:** Exporting occupancy data to standard `map.yaml` and `map.pgm` formats.
7. **Lab 7: Autonomous Navigation with A* Global Planner:** Setting 2D Nav Goals, calculating obstacle-free paths, pure pursuit trajectory tracking.
8. **Lab 8: Dynamic Obstacle Avoidance & Replanning:** Inserting obstacles directly in front of the robot during transit and observing local costmap inflation and real-time path deviation.

---

## 10. Project Directory Structure

```
E:/Robotic_ESE/
├── src/
│   ├── App.tsx                          # Root responsive flex layout shell
│   ├── main.tsx                         # React 19 entry point
│   ├── index.css                        # Tailwind v4 imports & Qt scrollbars
│   ├── components/
│   │   ├── common/
│   │   │   ├── TopNavigation.tsx        # Workspaces tabs, sim controls, F11 fullscreen
│   │   │   ├── CombinedWorkspace.tsx    # Split-screen Gazebo + RViz view
│   │   │   ├── TeleopHud.tsx            # Floating joystick & keyboard control HUD
│   │   │   ├── TopicMonitorModal.tsx    # Real-time ROS topic diagnostic monitor
│   │   │   ├── SettingsModal.tsx        # Shadows, ray count, performance toggles
│   │   │   └── ResponsiveCanvasManager.tsx # Real-time Canvas ResizeObserver adapter
│   │   ├── gazebo/                      # Gazebo Classic 11 interface components
│   │   │   ├── GazeboWorkspace.tsx
│   │   │   ├── GazeboViewport.tsx       # Three.js physical simulation canvas
│   │   │   ├── GazeboToolbar.tsx        # Play, pause, step, reset, camera modes
│   │   │   ├── GazeboLeftPanel.tsx      # World entities tree & model insertion
│   │   │   ├── GazeboInspector.tsx      # Selected entity properties inspector
│   │   │   ├── GazeboMenuBar.tsx        # File, Edit, View, Window menus
│   │   │   └── GazeboBottomBar.tsx      # Real-time factor, sim time, iterations
│   │   ├── rviz/                        # RViz Noetic interface components
│   │   │   ├── RvizWorkspace.tsx
│   │   │   ├── RvizViewport.tsx         # Sensor visualizer & 2D Nav Goal raycasting
│   │   │   ├── RvizTopBar.tsx           # 2D Nav Goal, Pose Estimate, interact tools
│   │   │   ├── RvizDisplaysPanel.tsx    # Layer checkboxes (LaserScan, TF, Map, Costmap)
│   │   │   ├── RvizPropertiesPanel.tsx  # Display layer alpha/point size properties
│   │   │   ├── RvizLayers.tsx           # Point clouds, grid tiles, path geometry
│   │   │   └── RvizBottomBar.tsx        # Fixed frame selection & diagnostic state
│   │   └── learning/
│   │       └── PracticalsPanel.tsx      # Interactive 8 practical laboratory guide
│   ├── terminal/                        # VS Code-Style Resizable Terminal
│   │   ├── components/
│   │   │   ├── TerminalWindow.tsx       # Main in-flow flex terminal container
│   │   │   ├── TerminalToolbar.tsx      # Window buttons, ROS 1/2 switcher, interrupt
│   │   │   ├── TerminalOutput.tsx       # Syntax-colored scrolling output
│   │   │   ├── TerminalInput.tsx        # Prompt, history navigation, tab completion
│   │   │   └── ResizeHandle.tsx         # Top divider drag grip with ns-resize cursor
│   │   ├── engine/
│   │   │   ├── CommandDispatcher.ts     # Master router between Shell, ROS 1, ROS 2
│   │   │   ├── CommandParser.ts         # POSIX quote, escape, and token splitter
│   │   │   ├── EnvironmentManager.ts    # Persistent environment variables ($VAR)
│   │   │   ├── VirtualFileSystem.ts     # In-memory Linux filesystem tree
│   │   │   ├── ProcessManager.ts        # Background PID lifecycle and Ctrl+C signals
│   │   │   ├── ShellInterpreter.ts      # Standard Linux built-in commands
│   │   │   └── CommandHistory.ts        # Up/Down history tracking
│   │   ├── hooks/
│   │   │   └── useTerminalLayout.ts     # Resizing hook, height clamping, localStorage
│   │   ├── ros/
│   │   │   ├── ROS1Interpreter.ts       # Noetic commands (roscore, rostopic, etc.)
│   │   │   ├── ROS2Interpreter.ts       # Humble commands (ros2 node, topic, etc.)
│   │   │   ├── ROSNodeManager.ts        # Node graph registry
│   │   │   ├── ROSTopicManager.ts       # Topic introspection & publisher engine
│   │   │   ├── ROSServiceManager.ts     # Service handler connected to simulation
│   │   │   ├── ROSParameterManager.ts   # Parameter server storage
│   │   │   └── ROSPackageManager.ts     # Package discovery database
│   │   └── integration/
│   │       └── SimulationBridge.ts      # Links terminal actions directly to physics
│   ├── robot/
│   │   ├── controllers/
│   │   │   └── teleopController.ts      # Keyboard event listeners (W/A/S/D/Arrows/Space)
│   │   └── models/
│   │       ├── TurtleBot3Burger.tsx     # CAD-accurate Three.js robot meshes
│   │       └── WorldObjects.tsx         # Bounding boxes, cylinders, walls, floors
│   ├── physics/
│   │   └── engine.ts                    # Differential drive kinematics & collision
│   ├── sensors/
│   │   └── lidar/raycaster.ts           # 360-degree LDS-01 LiDAR raycasting
│   ├── mapping/
│   │   └── occupancyGrid.ts             # Log-odds 2D SLAM grid mapping
│   ├── navigation/
│   │   ├── aStarPlanner.ts              # A* global grid path planning
│   │   ├── costmap.ts                   # Layered obstacle inflation costmaps
│   │   └── pathFollower.ts              # Pure pursuit trajectory follower
│   ├── ros/
│   │   ├── messageBus.ts                # Real-time ROS topic message bus (rosBus)
│   │   └── tfTree.ts                    # Coordinate frame transform math
│   ├── state/
│   │   └── simulationStore.ts           # Central Zustand store (60 FPS tick loop)
│   └── __tests__/                       # Automated Vitest test suites (10 files)
├── package.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 11. Technology Stack

- **Framework:** React 19 + TypeScript 5 (Strict Mode)
- **3D Graphics & WebGL:** Three.js (r187), `@react-three/fiber` v9, `@react-three/drei` v10
- **State Management:** Zustand v5 (Reactive, zero-overhead simulation store)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons:** Lucide React
- **Build Tool:** Vite 8
- **Linter:** Oxlint (High-performance Rust-based linter)
- **Testing:** Vitest v5 + `@testing-library/react` + JSDOM

---

## 12. Installation & Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9.0.0 or higher
- A modern WebGL-compatible browser (Google Chrome, Microsoft Edge, Mozilla Firefox)

### Setup & Launch
```bash
# 1. Clone repository (or navigate to workspace directory)
cd E:/Robotic_ESE

# 2. Install dependencies
npm install

# 3. Start local development server with Hot Module Replacement (HMR)
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

### Production Build & Linting
```bash
# Run strict TypeScript check and build production distribution
npm run build

# Run Oxlint across all 76+ source files
npm run lint

# Run all 10 automated test suites
npm test
```

---

## 13. Automated Test Verification

The application includes 10 automated Vitest suites covering 62 unit and integration tests:

```bash
npm test
```

```
✓ src/__tests__/terminal-shell.test.ts (5 tests)
✓ src/__tests__/terminal.test.ts (11 tests)
✓ src/__tests__/simulation-topics.test.ts (5 tests)
✓ src/__tests__/terminal-integration.test.ts (5 tests)
✓ src/__tests__/simulation.test.ts (12 tests)
✓ src/__tests__/terminal-layout.test.ts (6 tests)
✓ src/__tests__/ros2-commands.test.ts (6 tests)
✓ src/__tests__/fullscreen.test.ts (3 tests)
✓ src/__tests__/viewport-resize.test.ts (3 tests)
✓ src/__tests__/ros1-commands.test.ts (6 tests)

Test Files  10 passed (10)
     Tests  62 passed (62)
```

---

## 14. Keyboard Shortcuts & Controls

### Robot Teleoperation
- `W` / `↑`: Accelerate forward ($+0.05\text{ m/s}$)
- `X` / `↓`: Accelerate backward ($-0.05\text{ m/s}$)
- `A` / `←`: Turn left ($+0.2\text{ rad/s}$)
- `D` / `→`: Turn right ($-0.2\text{ rad/s}$)
- `S` / `Space`: Emergency Stop ($v = 0\text{ m/s},\ \omega = 0\text{ rad/s}$)

### Simulation Viewport Camera
- **Left Mouse Click + Drag:** Orbit / Rotate camera view
- **Right Mouse Click + Drag:** Pan camera horizontally / vertically
- **Mouse Scroll Wheel:** Zoom in / out
- **Transform Gizmo:** Click any spawned entity, then drag red/green/blue axes to translate or rings to rotate

### Terminal & Application Shortcuts
- `Tab`: Autocomplete commands, package names, and directory paths
- `↑` / `↓`: Navigate previous bash command history
- `Ctrl + C`: Interrupt active streaming process (`rostopic echo`) or cancel command line
- `Ctrl + L`: Clear terminal screen output
- `F11`: Toggle browser Fullscreen mode
- **Terminal Top Border:** Click and drag upward/downward to resize the terminal panel height smoothly

---

## License

This educational recreation is distributed under the [MIT License](LICENSE). 
TurtleBot3 is a registered trademark of ROBOTIS Co., Ltd. ROS is a trademark of Open Robotics.
