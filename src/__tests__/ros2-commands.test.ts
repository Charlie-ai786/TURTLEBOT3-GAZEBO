import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentManager } from '../terminal/engine/EnvironmentManager';
import { VirtualFileSystem } from '../terminal/engine/VirtualFileSystem';
import { ProcessManager } from '../terminal/engine/ProcessManager';
import { CommandDispatcher } from '../terminal/engine/CommandDispatcher';
import { CommandContext } from '../terminal/types/terminal.types';
import { useSimulationStore } from '../state/simulationStore';

describe('Suite 3: ROS 2 Humble Command Suite', () => {
  let env: EnvironmentManager;
  let fs: VirtualFileSystem;
  let proc: ProcessManager;
  let context: CommandContext;

  beforeEach(() => {
    env = new EnvironmentManager('humble');
    fs = new VirtualFileSystem();
    proc = new ProcessManager();
    context = {
      env,
      fs,
      proc,
      rosDistro: 'humble',
      setRosDistro: (d) => {
        context.rosDistro = d;
        env.syncRosDistro(d);
      },
      clearScreen: () => {},
      history: [],
    };
  });

  describe('DDS Discovery & roscore Rejection', () => {
    it('strictly forbids roscore in ROS 2 mode with decentralized discovery message', () => {
      const res = CommandDispatcher.execute('roscore', context);
      expect(res[0].exitCode).toBe(127);
      expect(res[0].error).toContain("Command 'roscore' not found in ROS 2");
      expect(res[0].error).toContain('DDS discovery architecture');
    });

    it('prints root ros2 usage on --help', () => {
      const res = CommandDispatcher.execute('ros2 --help', context);
      expect(res[0].exitCode).toBe(0);
      expect(res[0].output).toContain('usage: ros2');
      expect(res[0].output).toContain('node');
      expect(res[0].output).toContain('topic');
    });
  });

  describe('ros2 node', () => {
    it('executes ros2 node list and ros2 node info', () => {
      const listRes = CommandDispatcher.execute('ros2 node list', context);
      expect(listRes[0].output).toContain('/turtlebot3_node');
      expect(listRes[0].output).toContain('/slam_toolbox');

      const infoRes = CommandDispatcher.execute('ros2 node info /turtlebot3_node', context);
      expect(infoRes[0].output).toContain('/turtlebot3_node');
      expect(infoRes[0].output).toContain('Publishers:');
      expect(infoRes[0].output).toContain('/odom');
    });
  });

  describe('ros2 topic', () => {
    it('executes ros2 topic list, info, type, hz, and pub', () => {
      const listRes = CommandDispatcher.execute('ros2 topic list', context);
      expect(listRes[0].output).toContain('/cmd_vel');
      expect(listRes[0].output).toContain('/scan');

      const typeRes = CommandDispatcher.execute('ros2 topic type /cmd_vel', context);
      expect(typeRes[0].output).toBe('geometry_msgs/msg/Twist');

      const infoRes = CommandDispatcher.execute('ros2 topic info /scan', context);
      expect(infoRes[0].output).toContain('Type: sensor_msgs/msg/LaserScan');
      expect(infoRes[0].output).toContain('Publisher count:');

      const hzRes = CommandDispatcher.execute('ros2 topic hz /scan', context);
      expect(hzRes[0].output).toContain('average rate:');

      // Publish velocity and verify simulation velocity state updates
      const pubRes = CommandDispatcher.execute(
        'ros2 topic pub /cmd_vel geometry_msgs/msg/Twist "linear: {x: 0.12}, angular: {z: 0.3}"',
        context
      );
      expect(pubRes[0].exitCode).toBe(0);
      expect(useSimulationStore.getState().robot.targetLinearVelocity).toBeCloseTo(0.12);
      expect(useSimulationStore.getState().robot.targetAngularVelocity).toBeCloseTo(0.3);
    });
  });

  describe('ros2 service & param & pkg', () => {
    it('handles ros2 service, ros2 param, and ros2 pkg subcommands', () => {
      // service
      const srvList = CommandDispatcher.execute('ros2 service list', context);
      expect(srvList[0].output).toContain('/reset_simulation');

      const srvCall = CommandDispatcher.execute(
        'ros2 service call /reset_simulation std_srvs/srv/Empty',
        context
      );
      expect(srvCall[0].exitCode).toBe(0);

      // param
      const paramList = CommandDispatcher.execute('ros2 param list', context);
      expect(paramList[0].output).toContain('/turtlebot3_model');

      const paramGet = CommandDispatcher.execute(
        'ros2 param get /turtlebot3_node /turtlebot3_model',
        context
      );
      expect(paramGet[0].output).toBe('burger');

      const paramSet = CommandDispatcher.execute(
        'ros2 param set /turtlebot3_node /turtlebot3_model waffle',
        context
      );
      expect(paramSet[0].exitCode).toBe(0);

      // pkg
      const pkgList = CommandDispatcher.execute('ros2 pkg list', context);
      expect(pkgList[0].output).toContain('turtlebot3');

      const pkgPrefix = CommandDispatcher.execute('ros2 pkg prefix turtlebot3_gazebo', context);
      expect(pkgPrefix[0].output).toContain('/opt/ros/noetic/share/turtlebot3_gazebo');
    });
  });

  describe('ros2 run & launch', () => {
    it('executes ros2 run and ros2 launch', () => {
      const runRes = CommandDispatcher.execute(
        'ros2 run turtlebot3_teleop teleop_keyboard',
        context
      );
      expect(runRes[0].output).toContain('Control Your TurtleBot3');

      const launchRes = CommandDispatcher.execute(
        'ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py',
        context
      );
      expect(launchRes[0].output).toContain('turtlebot3_world.launch.py');
    });
  });
});

