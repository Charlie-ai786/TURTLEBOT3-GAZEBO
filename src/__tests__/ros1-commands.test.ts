import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentManager } from '../terminal/engine/EnvironmentManager';
import { VirtualFileSystem } from '../terminal/engine/VirtualFileSystem';
import { ProcessManager } from '../terminal/engine/ProcessManager';
import { CommandDispatcher } from '../terminal/engine/CommandDispatcher';
import { CommandContext } from '../terminal/types/terminal.types';
import { useSimulationStore } from '../state/simulationStore';

describe('Suite 2: ROS 1 Noetic Command Suite', () => {
  let env: EnvironmentManager;
  let fs: VirtualFileSystem;
  let proc: ProcessManager;
  let context: CommandContext;

  beforeEach(() => {
    env = new EnvironmentManager('noetic');
    fs = new VirtualFileSystem();
    proc = new ProcessManager();
    context = {
      env,
      fs,
      proc,
      rosDistro: 'noetic',
      setRosDistro: (d) => {
        context.rosDistro = d;
        env.syncRosDistro(d);
      },
      clearScreen: () => {},
      history: [],
    };
  });

  describe('roscore Lifecycle', () => {
    it('initializes roscore master and rejects duplicate start', () => {
      expect(proc.isRoscoreActive()).toBe(false);

      const res = CommandDispatcher.execute('roscore', context);
      expect(res[0].exitCode).toBe(0);
      expect(res[0].output).toContain('ROS_MASTER_URI=http://localhost:11311');
      expect(proc.isRoscoreActive()).toBe(true);

      // Duplicate roscore start should error gracefully
      const resDup = CommandDispatcher.execute('roscore', context);
      expect(resDup[0].exitCode).toBe(1);
      expect(resDup[0].error).toContain('already running');
    });
  });

  describe('rosnode Operations', () => {
    it('handles rosnode list, info, ping, and kill', () => {
      const listRes = CommandDispatcher.execute('rosnode list', context);
      expect(listRes[0].output).toContain('/turtlebot3_core');
      expect(listRes[0].output).toContain('/slam_gmapping');

      const infoRes = CommandDispatcher.execute('rosnode info /turtlebot3_core', context);
      expect(infoRes[0].output).toContain('/cmd_vel [geometry_msgs/Twist]');
      expect(infoRes[0].output).toContain('/odom [nav_msgs/Odometry]');

      const pingRes = CommandDispatcher.execute('rosnode ping /turtlebot3_core', context);
      expect(pingRes[0].output).toContain('xmlrpc reply');

      const killRes = CommandDispatcher.execute('rosnode kill /rosout', context);
      expect(killRes[0].output).toContain('killed [/rosout]');
    });
  });

  describe('rostopic Operations', () => {
    it('handles rostopic list, info, type, hz, and pub', () => {
      const listRes = CommandDispatcher.execute('rostopic list', context);
      expect(listRes[0].output).toContain('/cmd_vel');
      expect(listRes[0].output).toContain('/scan');

      const listVerbose = CommandDispatcher.execute('rostopic list -v', context);
      expect(listVerbose[0].output).toContain('Published topics:');
      expect(listVerbose[0].output).toContain('Subscribed topics:');

      const infoRes = CommandDispatcher.execute('rostopic info /scan', context);
      expect(infoRes[0].output).toContain('sensor_msgs/LaserScan');
      expect(infoRes[0].output).toContain('Publishers:');

      const typeRes = CommandDispatcher.execute('rostopic type /cmd_vel', context);
      expect(typeRes[0].output).toBe('geometry_msgs/Twist');

      const hzRes = CommandDispatcher.execute('rostopic hz /odom', context);
      expect(hzRes[0].output).toContain('average rate: 50.0 Hz');

      // Publish velocity and verify simulation state updates
      const pubRes = CommandDispatcher.execute(
        'rostopic pub /cmd_vel geometry_msgs/Twist "linear: {x: 0.18}, angular: {z: -0.35}"',
        context
      );
      expect(pubRes[0].exitCode).toBe(0);
      expect(useSimulationStore.getState().robot.targetLinearVelocity).toBeCloseTo(0.18);
      expect(useSimulationStore.getState().robot.targetAngularVelocity).toBeCloseTo(-0.35);
    });
  });

  describe('rosservice & rosparam & rospack', () => {
    it('handles rosservice list, type, info, and call', () => {
      const listRes = CommandDispatcher.execute('rosservice list', context);
      expect(listRes[0].output).toContain('/reset_simulation');
      expect(listRes[0].output).toContain('/gazebo/pause_physics');

      const typeRes = CommandDispatcher.execute('rosservice type /reset_simulation', context);
      expect(typeRes[0].output).toBe('std_srvs/Empty');

      const infoRes = CommandDispatcher.execute('rosservice info /reset_simulation', context);
      expect(infoRes[0].output).toContain('Type: std_srvs/Empty');

      const callRes = CommandDispatcher.execute('rosservice call /reset_simulation', context);
      expect(callRes[0].exitCode).toBe(0);
      expect(callRes[0].output).toContain('successfully');
    });

    it('handles rosparam get, set, dump, and rospack list/find', () => {
      // rosparam
      const getRes = CommandDispatcher.execute('rosparam get /turtlebot3_model', context);
      expect(getRes[0].output).toBe('burger');

      CommandDispatcher.execute('rosparam set /turtlebot3_model waffle_pi', context);
      const getRes2 = CommandDispatcher.execute('rosparam get /turtlebot3_model', context);
      expect(getRes2[0].output).toBe('waffle_pi');

      const dumpRes = CommandDispatcher.execute('rosparam dump', context);
      expect(dumpRes[0].output).toContain('turtlebot3_model');

      // rospack
      const packList = CommandDispatcher.execute('rospack list', context);
      expect(packList[0].output).toContain('turtlebot3_navigation');

      const packFind = CommandDispatcher.execute('rospack find turtlebot3_gazebo', context);
      expect(packFind[0].output).toContain('/opt/ros/noetic/share/turtlebot3_gazebo');

      // rosversion
      const verRes = CommandDispatcher.execute('rosversion -d', context);
      expect(verRes[0].output).toBe('noetic');
    });
  });

  describe('roslaunch & rosrun', () => {
    it('launches turtlebot3_world, slam, and navigation', () => {
      const launchWorld = CommandDispatcher.execute(
        'roslaunch turtlebot3_gazebo turtlebot3_world.launch',
        context
      );
      expect(launchWorld[0].output).toContain('turtlebot3_world.launch');

      const launchSlam = CommandDispatcher.execute(
        'roslaunch turtlebot3_slam turtlebot3_slam.launch',
        context
      );
      expect(launchSlam[0].output).toContain('Occupancy grid mapping is now ACTIVE');

      const launchNav = CommandDispatcher.execute(
        'roslaunch turtlebot3_navigation turtlebot3_navigation.launch',
        context
      );
      expect(launchNav[0].output).toContain('Navigation stack initialized');

      const runTeleop = CommandDispatcher.execute(
        'rosrun turtlebot3_teleop turtlebot3_teleop_key',
        context
      );
      expect(runTeleop[0].output).toContain('Control Your TurtleBot3');
    });
  });
});

