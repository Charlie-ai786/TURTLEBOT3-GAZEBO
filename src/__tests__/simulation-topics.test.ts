import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore } from '../state/simulationStore';
import { rosBus } from '../ros/messageBus';

describe('Suite 5: Live Simulation Topics & Message Bus Connectivity', () => {
  beforeEach(() => {
    useSimulationStore.getState().resetSimulation();
  });

  it('publishes and subscribes to /cmd_vel during teleop velocity changes', () => {
    let receivedCmdVel: any = null;
    const unsub = rosBus.subscribe('/cmd_vel', (msg) => {
      receivedCmdVel = msg;
    });

    useSimulationStore.getState().setTeleopVelocity(0.2, 0.5);
    expect(receivedCmdVel).toBeDefined();
    expect(receivedCmdVel.linear.x).toBeCloseTo(0.2);
    expect(receivedCmdVel.angular.z).toBeCloseTo(0.5);

    unsub();
  });

  it('publishes /odom, /scan, /tf, and /imu on simulation physics tick', () => {
    let receivedOdom: any = null;
    let receivedScan: any = null;
    let receivedTf: any = null;
    let receivedImu: any = null;

    const unsubs = [
      rosBus.subscribe('/odom', (msg) => (receivedOdom = msg)),
      rosBus.subscribe('/scan', (msg) => (receivedScan = msg)),
      rosBus.subscribe('/tf', (msg) => (receivedTf = msg)),
      rosBus.subscribe('/imu', (msg) => (receivedImu = msg)),
    ];

    // Move robot and advance tick
    useSimulationStore.getState().setTeleopVelocity(0.2, 0.0);
    useSimulationStore.getState().tick(0.05);

    expect(receivedOdom).toBeDefined();
    expect(receivedOdom.child_frame_id).toBe('base_footprint');
    expect(receivedOdom.twist.twist.linear.x).toBeGreaterThan(0);

    expect(receivedScan).toBeDefined();
    expect(receivedScan.header.frame_id).toBe('base_scan');
    expect(receivedScan.ranges.length).toBeGreaterThan(0);

    expect(receivedTf).toBeDefined();
    expect(receivedTf.transforms.length).toBeGreaterThan(0);

    expect(receivedImu).toBeDefined();
    expect(receivedImu.header.frame_id).toBe('imu_link');
    expect(receivedImu.linear_acceleration.z).toBeCloseTo(9.81);

    unsubs.forEach((u) => u());
  });

  it('publishes /map when SLAM mapping is activated', () => {
    let receivedMap: any = null;
    const unsub = rosBus.subscribe('/map', (msg) => (receivedMap = msg));

    useSimulationStore.getState().startMapping();
    // Advance 10 ticks so modulo fires
    for (let i = 0; i < 10; i++) {
      useSimulationStore.getState().tick(0.05);
    }

    expect(receivedMap).toBeDefined();
    expect(receivedMap.header.frame_id).toBe('map');
    expect(receivedMap.info.resolution).toBe(0.05);
    expect(receivedMap.data.length).toBeGreaterThan(0);

    unsub();
  });

  it('publishes /move_base_simple/goal and /move_base/GlobalPlanner/plan on navigation goal', () => {
    let receivedGoal: any = null;
    let receivedPlan: any = null;

    const unsubs = [
      rosBus.subscribe('/move_base_simple/goal', (msg) => (receivedGoal = msg)),
      rosBus.subscribe('/move_base/GlobalPlanner/plan', (msg) => (receivedPlan = msg)),
    ];

    useSimulationStore.getState().setNavGoal(1.5, 1.0, 0);

    expect(receivedGoal).toBeDefined();
    expect(receivedGoal.pose.position.x).toBeCloseTo(1.5);
    expect(receivedGoal.pose.position.y).toBeCloseTo(1.0);

    expect(receivedPlan).toBeDefined();
    expect(receivedPlan.poses.length).toBeGreaterThan(0);

    unsubs.forEach((u) => u());
  });

  it('verifies standard registered topics list in rosBus', () => {
    const topics = rosBus.getTopics().map((t) => t.name);
    expect(topics).toContain('/cmd_vel');
    expect(topics).toContain('/scan');
    expect(topics).toContain('/odom');
    expect(topics).toContain('/tf');
    expect(topics).toContain('/tf_static');
    expect(topics).toContain('/map');
    expect(topics).toContain('/imu');
    expect(topics).toContain('/robot_description');
    expect(topics).toContain('/move_base_simple/goal');
    expect(topics).toContain('/move_base/GlobalPlanner/plan');
  });
});

