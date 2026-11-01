import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentManager } from '../terminal/engine/EnvironmentManager';
import { VirtualFileSystem } from '../terminal/engine/VirtualFileSystem';
import { ProcessManager } from '../terminal/engine/ProcessManager';
import { CommandDispatcher } from '../terminal/engine/CommandDispatcher';
import { CommandContext } from '../terminal/types/terminal.types';

describe('Suite 4: Terminal Integration & Version Switching', () => {
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

  describe('Cross-Version Command Isolation', () => {
    it('rejects ros2 command when in ROS 1 Noetic mode', () => {
      context.rosDistro = 'noetic';
      const res = CommandDispatcher.execute('ros2 node list', context);
      expect(res[0].exitCode).toBe(127);
      expect(res[0].error).toContain("Command 'ros2' is not available in ROS 1 Noetic");
    });

    it('rejects ROS 1 commands when in ROS 2 Humble mode', () => {
      context.setRosDistro('humble');
      const res = CommandDispatcher.execute('rostopic list', context);
      expect(res[0].exitCode).toBe(127);
      expect(res[0].error).toContain("Command 'rostopic' is not available in ROS 2 Humble");
    });
  });

  describe('Environment Variable Persistence across Switching', () => {
    it('preserves user exports and switches ROS_DISTRO and ROS_VERSION cleanly', () => {
      CommandDispatcher.execute('export EXPERIMENT_NAME="Maze Exploration" ROBOT_ID=7', context);
      expect(env.get('EXPERIMENT_NAME')).toBe('Maze Exploration');
      expect(env.get('ROBOT_ID')).toBe('7');
      expect(env.get('ROS_DISTRO')).toBe('noetic');
      expect(env.get('ROS_VERSION')).toBe('1');

      // Switch to Humble
      context.setRosDistro('humble');
      expect(env.get('ROS_DISTRO')).toBe('humble');
      expect(env.get('ROS_VERSION')).toBe('2');
      expect(env.get('ROS_DOMAIN_ID')).toBe('30');
      // User variables MUST persist
      expect(env.get('EXPERIMENT_NAME')).toBe('Maze Exploration');
      expect(env.get('ROBOT_ID')).toBe('7');

      // Switch back to Noetic
      context.setRosDistro('noetic');
      expect(env.get('ROS_DISTRO')).toBe('noetic');
      expect(env.get('ROS_VERSION')).toBe('1');
      expect(env.get('EXPERIMENT_NAME')).toBe('Maze Exploration');
      expect(env.get('ROBOT_ID')).toBe('7');
    });
  });

  describe('Sourcing Environment Scripts', () => {
    it('dynamically sources noetic and humble setup.bash', () => {
      // Source humble setup script
      const res1 = CommandDispatcher.execute('source /opt/ros/humble/setup.bash', context);
      expect(res1[0].exitCode).toBe(0);
      expect(context.rosDistro).toBe('humble');
      expect(env.get('ROS_DISTRO')).toBe('humble');

      // Source noetic setup script
      const res2 = CommandDispatcher.execute('source /opt/ros/noetic/setup.bash', context);
      expect(res2[0].exitCode).toBe(0);
      expect(context.rosDistro).toBe('noetic');
      expect(env.get('ROS_DISTRO')).toBe('noetic');
    });
  });

  describe('Path & Tab Autocompletion', () => {
    it('resolves valid filesystem autocompletions for folders and files', () => {
      const dirCompletions = fs.getCompletions('/home/ubuntu', 'cat');
      expect(dirCompletions).toContain('catkin_ws/');

      const fileCompletions = fs.getCompletions('/home/ubuntu', 'map');
      expect(fileCompletions).toContain('map.yaml');
      expect(fileCompletions).toContain('map.pgm');
    });
  });
});

