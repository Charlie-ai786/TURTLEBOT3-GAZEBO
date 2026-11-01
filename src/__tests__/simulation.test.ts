import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore } from '../state/simulationStore';
import { stepSimulation } from '../physics/engine';
import { simulateLidar } from '../sensors/lidar/raycaster';
import { rosBus } from '../ros/messageBus';
import { planAStarPath } from '../navigation/aStarPlanner';
import { CostmapEngine } from '../navigation/costmap';
import { OccupancyGridMap } from '../mapping/occupancyGrid';

describe('TurtleBot3 Gazebo + RViz Simulation Suite', () => {
  beforeEach(() => {
    useSimulationStore.getState().resetWorld();
  });

  // 1. Workspace switching
  it('switches between Gazebo, RViz, and Combined workspaces', () => {
    const store = useSimulationStore.getState();
    expect(store.workspaceMode).toBe('gazebo');

    store.setWorkspaceMode('rviz');
    expect(useSimulationStore.getState().workspaceMode).toBe('rviz');

    store.setWorkspaceMode('combined');
    expect(useSimulationStore.getState().workspaceMode).toBe('combined');

    store.setWorkspaceMode('gazebo');
    expect(useSimulationStore.getState().workspaceMode).toBe('gazebo');
  });

  // 2. Play / Pause / Reset
  it('handles play, pause, and simulation reset correctly', () => {
    const store = useSimulationStore.getState();
    expect(store.isPaused).toBe(false);

    store.togglePause();
    expect(useSimulationStore.getState().isPaused).toBe(true);

    store.togglePause();
    expect(useSimulationStore.getState().isPaused).toBe(false);

    store.resetSimulation();
    expect(useSimulationStore.getState().simTime).toBe(0);
    expect(useSimulationStore.getState().iterations).toBe(0);
  });

  // 3. Robot kinematics & movement
  it('updates linear and angular velocities using differential drive kinematics', () => {
    const initialRobot = useSimulationStore.getState().robot;
    const objects = useSimulationStore.getState().objects;

    const commandState = {
      ...initialRobot,
      targetLinearVelocity: 0.2,
      targetAngularVelocity: 0.5,
    };

    const result = stepSimulation(commandState, objects, 0.1, 1.0);
    expect(result.robotState.linearVelocity).toBeGreaterThan(0);
    expect(result.robotState.leftWheelVelocity).not.toBe(0);
    expect(result.robotState.rightWheelVelocity).not.toBe(0);
  });

  // 4. Emergency stop
  it('executes emergency stop setting target velocities to zero', () => {
    const store = useSimulationStore.getState();
    store.setTeleopVelocity(0.22, 1.0);
    expect(useSimulationStore.getState().robot.targetLinearVelocity).toBe(0.22);

    store.emergencyStop();
    expect(useSimulationStore.getState().robot.targetLinearVelocity).toBe(0);
    expect(useSimulationStore.getState().robot.targetAngularVelocity).toBe(0);
  });

  // 5. Object insertion
  it('inserts new models into the simulation world', () => {
    const initialCount = useSimulationStore.getState().objects.length;
    useSimulationStore.getState().addObject('box', { x: 1, y: 1, z: 0.25 });

    const newObjects = useSimulationStore.getState().objects;
    expect(newObjects.length).toBe(initialCount + 1);
    expect(newObjects[newObjects.length - 1].type).toBe('box');
  });

  // 6. Object deletion
  it('removes models from the world by id', () => {
    useSimulationStore.getState().addObject('cylinder', { x: 2, y: 2, z: 0.3 });
    const objects = useSimulationStore.getState().objects;
    const addedId = objects[objects.length - 1].id;

    useSimulationStore.getState().removeObject(addedId);
    const updated = useSimulationStore.getState().objects;
    expect(updated.find((o) => o.id === addedId)).toBeUndefined();
  });

  // 7. LiDAR detection & raycasting
  it('performs 360-degree raycasting against environment obstacles', () => {
    const objects = useSimulationStore.getState().objects;
    const { scanData, hitPoints } = simulateLidar(-2.0, -0.5, 0, objects, 180, 0.12, 3.5);

    expect(scanData.ranges.length).toBe(180);
    expect(scanData.closestDistance).toBeLessThan(3.5);
    expect(hitPoints.length).toBeGreaterThan(0);
  });

  // 8. RViz display toggles
  it('toggles RViz display layers independently', () => {
    const store = useSimulationStore.getState();
    expect(store.rvizDisplays.laserScan.visible).toBe(true);

    store.toggleDisplay('laserScan');
    expect(useSimulationStore.getState().rvizDisplays.laserScan.visible).toBe(false);

    store.toggleDisplay('laserScan');
    expect(useSimulationStore.getState().rvizDisplays.laserScan.visible).toBe(true);
  });

  // 9. ROS Topic bus updates
  it('publishes and subscribes to /cmd_vel messages on the simulated bus', () => {
    let receivedMsg: any = null;
    const unsub = rosBus.subscribe('/cmd_vel', (msg) => {
      receivedMsg = msg;
    });

    useSimulationStore.getState().setTeleopVelocity(0.15, -0.8);
    expect(receivedMsg).not.toBeNull();
    expect(receivedMsg.linear.x).toBe(0.15);
    expect(receivedMsg.angular.z).toBe(-0.8);

    unsub();
  });

  // 10. Navigation goal selection & A* path generation
  it('generates an A* collision-free navigation path to goal', () => {
    const costmap = new CostmapEngine(200, 200, 0.05, -5.0, -5.0);
    const path = planAStarPath(-2.0, -0.5, 0.0, 2.0, costmap);

    expect(path.length).toBeGreaterThan(0);
    expect(path[0].x).toBeCloseTo(-2.0, 0.2);
    expect(path[path.length - 1].x).toBe(0.0);
    expect(path[path.length - 1].y).toBe(2.0);
  });

  // 11. Map reset & log-odds
  it('resets occupancy grid map and updates with scan', () => {
    const map = new OccupancyGridMap(100, 100, 0.05, -2.5, -2.5);
    expect(map.data[0]).toBe(-1); // Unknown

    map.reset();
    expect(map.data.every((val) => val === -1)).toBe(true);
  });

  // 12. Topic monitor info
  it('lists registered topics and types in the topic monitor', () => {
    const topics = rosBus.getTopics();
    const names = topics.map((t) => t.name);

    expect(names).toContain('/cmd_vel');
    expect(names).toContain('/scan');
    expect(names).toContain('/odom');
    expect(names).toContain('/tf');
    expect(names).toContain('/map');
  });
});

