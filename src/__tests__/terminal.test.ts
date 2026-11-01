import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentManager } from '../terminal/engine/EnvironmentManager';
import { VirtualFileSystem } from '../terminal/engine/VirtualFileSystem';
import { ProcessManager } from '../terminal/engine/ProcessManager';
import { CommandDispatcher } from '../terminal/engine/CommandDispatcher';
import { CommandContext } from '../terminal/types/terminal.types';
import { useSimulationStore } from '../state/simulationStore';

describe('ROS Terminal Re-Engineering Tests', () => {
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

  describe('TEST A: Bash Environment Variables', () => {
    it('handles export, echo $VAR, and printenv correctly', () => {
      // 1. Export custom variable
      const res1 = CommandDispatcher.execute('export TURTLEBOT3_MODEL=burger', context);
      expect(res1[0].exitCode).toBe(0);
      expect(env.get('TURTLEBOT3_MODEL')).toBe('burger');

      // 2. Echo variable expansion
      const res2 = CommandDispatcher.execute('echo $TURTLEBOT3_MODEL', context);
      expect(res2[0].exitCode).toBe(0);
      expect(res2[0].output).toBe('burger');

      // 3. Printenv single variable
      const res3 = CommandDispatcher.execute('printenv TURTLEBOT3_MODEL', context);
      expect(res3[0].exitCode).toBe(0);
      expect(res3[0].output).toBe('burger');

      // 4. Printenv full list
      const res4 = CommandDispatcher.execute('printenv', context);
      expect(res4[0].exitCode).toBe(0);
      expect(res4[0].output).toContain('TURTLEBOT3_MODEL=burger');
      expect(res4[0].output).toContain('HOME=/home/ubuntu');

      // 5. Unset variable
      const res5 = CommandDispatcher.execute('unset TURTLEBOT3_MODEL', context);
      expect(res5[0].exitCode).toBe(0);
      expect(env.get('TURTLEBOT3_MODEL')).toBeUndefined();

      // 6. Echo after unset
      const res6 = CommandDispatcher.execute('echo $TURTLEBOT3_MODEL', context);
      expect(res6[0].output).toBe('');
    });

    it('supports multiple variables and quoted values', () => {
      CommandDispatcher.execute('export ROBOT_NAME="TurtleBot 3" TEST_VAL=123', context);
      expect(env.get('ROBOT_NAME')).toBe('TurtleBot 3');
      expect(env.get('TEST_VAL')).toBe('123');

      const res = CommandDispatcher.execute('echo "Hello $ROBOT_NAME with ID $TEST_VAL"', context);
      expect(res[0].output).toBe('Hello TurtleBot 3 with ID 123');
    });
  });

  describe('TEST B: ROS 1 Noetic Commands', () => {
    it('executes roscore, rosnode list, and rostopic list', () => {
      // 1. roscore
      const res1 = CommandDispatcher.execute('roscore', context);
      expect(res1[0].exitCode).toBe(0);
      expect(res1[0].output).toContain('ROS_MASTER_URI=http://localhost:11311');
      expect(proc.isRoscoreActive()).toBe(true);

      // Subsequent roscore warns that master is already active
      const res1b = CommandDispatcher.execute('roscore', context);
      expect(res1b[0].exitCode).toBe(1);
      expect(res1b[0].error).toContain('already running');

      // 2. rosnode list
      const res2 = CommandDispatcher.execute('rosnode list', context);
      expect(res2[0].exitCode).toBe(0);
      expect(res2[0].output).toContain('/turtlebot3_core');
      expect(res2[0].output).toContain('/slam_gmapping');

      // 3. rostopic list
      const res3 = CommandDispatcher.execute('rostopic list', context);
      expect(res3[0].exitCode).toBe(0);
      expect(res3[0].output).toContain('/cmd_vel');
      expect(res3[0].output).toContain('/scan');
      expect(res3[0].output).toContain('/odom');
    });

    it('publishes to /cmd_vel and updates simulation velocity', () => {
      const res = CommandDispatcher.execute(
        'rostopic pub /cmd_vel geometry_msgs/Twist "linear: {x: 0.15}, angular: {z: 0.4}"',
        context
      );
      expect(res[0].exitCode).toBe(0);
      expect(res[0].output).toContain('publishing to /cmd_vel');

      const simState = useSimulationStore.getState().robot;
      expect(simState.targetLinearVelocity).toBeCloseTo(0.15);
      expect(simState.targetAngularVelocity).toBeCloseTo(0.4);
    });

    it('handles rospack, rosparam, and rosservice', () => {
      // rospack find
      const res1 = CommandDispatcher.execute('rospack find turtlebot3_gazebo', context);
      expect(res1[0].exitCode).toBe(0);
      expect(res1[0].output).toContain('/opt/ros/noetic/share/turtlebot3_gazebo');

      // rosparam get
      const res2 = CommandDispatcher.execute('rosparam get /turtlebot3_model', context);
      expect(res2[0].exitCode).toBe(0);
      expect(res2[0].output).toBe('burger');

      // rosservice list
      const res3 = CommandDispatcher.execute('rosservice list', context);
      expect(res3[0].exitCode).toBe(0);
      expect(res3[0].output).toContain('/reset_simulation');
      expect(res3[0].output).toContain('/gazebo/pause_physics');
    });
  });

  describe('TEST C: ROS 2 Humble Commands', () => {
    beforeEach(() => {
      context.setRosDistro('humble');
    });

    it('strictly forbids roscore and explains ROS 2 decentralized DDS architecture', () => {
      const res = CommandDispatcher.execute('roscore', context);
      expect(res[0].exitCode).toBe(127);
      expect(res[0].error).toContain("Command 'roscore' not found in ROS 2");
      expect(res[0].error).toContain('DDS discovery architecture');
    });

    it('executes ros2 node list, ros2 topic list, and ros2 topic pub', () => {
      const res1 = CommandDispatcher.execute('ros2 node list', context);
      expect(res1[0].exitCode).toBe(0);
      expect(res1[0].output).toContain('/turtlebot3_node');
      expect(res1[0].output).toContain('/slam_toolbox');

      const res2 = CommandDispatcher.execute('ros2 topic list', context);
      expect(res2[0].exitCode).toBe(0);
      expect(res2[0].output).toContain('/cmd_vel');
      expect(res2[0].output).toContain('/scan');

      const res3 = CommandDispatcher.execute(
        'ros2 topic pub /cmd_vel geometry_msgs/msg/Twist "linear: {x: 0.10}, angular: {z: 0.25}"',
        context
      );
      expect(res3[0].exitCode).toBe(0);
      expect(res3[0].output).toContain('publishing to /cmd_vel');

      const simState = useSimulationStore.getState().robot;
      expect(simState.targetLinearVelocity).toBeCloseTo(0.10);
      expect(simState.targetAngularVelocity).toBeCloseTo(0.25);
    });
  });

  describe('TEST D: Environment Variable Persistence Across ROS Distros', () => {
    it('preserves user variables when toggling between ROS 1 and ROS 2', () => {
      // In ROS 1 Noetic
      CommandDispatcher.execute('export TURTLEBOT3_MODEL=waffle MY_CUSTOM_EXP=42', context);
      expect(env.get('TURTLEBOT3_MODEL')).toBe('waffle');
      expect(env.get('MY_CUSTOM_EXP')).toBe('42');
      expect(env.get('ROS_DISTRO')).toBe('noetic');

      // Switch to ROS 2 Humble
      context.setRosDistro('humble');
      expect(env.get('ROS_DISTRO')).toBe('humble');
      expect(env.get('ROS_VERSION')).toBe('2');
      expect(env.get('ROS_DOMAIN_ID')).toBe('30');
      // Crucial: TURTLEBOT3_MODEL and MY_CUSTOM_EXP must persist!
      expect(env.get('TURTLEBOT3_MODEL')).toBe('waffle');
      expect(env.get('MY_CUSTOM_EXP')).toBe('42');

      // Switch back to ROS 1 Noetic
      context.setRosDistro('noetic');
      expect(env.get('ROS_DISTRO')).toBe('noetic');
      expect(env.get('ROS_VERSION')).toBe('1');
      expect(env.get('TURTLEBOT3_MODEL')).toBe('waffle');
      expect(env.get('MY_CUSTOM_EXP')).toBe('42');
    });
  });

  describe('TEST E: Virtual Linux Filesystem Operations', () => {
    it('supports pwd, cd, mkdir -p, touch, ls -la, and cat', () => {
      // Initial pwd
      const resPwd = CommandDispatcher.execute('pwd', context);
      expect(resPwd[0].output).toBe('/home/ubuntu');

      // Create new directory structure
      const resMkdir = CommandDispatcher.execute('mkdir -p workspace/my_pkg', context);
      expect(resMkdir[0].exitCode).toBe(0);

      // Change directory
      const resCd = CommandDispatcher.execute('cd workspace/my_pkg', context);
      expect(resCd[0].exitCode).toBe(0);
      expect(env.get('PWD')).toBe('/home/ubuntu/workspace/my_pkg');

      // Create a file
      const resTouch = CommandDispatcher.execute('touch README.md', context);
      expect(resTouch[0].exitCode).toBe(0);

      // List files with -la
      const resLs = CommandDispatcher.execute('ls -la', context);
      expect(resLs[0].exitCode).toBe(0);
      expect(resLs[0].output).toContain('README.md');

      // Write content directly and read with cat
      fs.writeFile('/home/ubuntu/workspace/my_pkg/README.md', '# TurtleBot3 Package\nAuthor: Ubuntu');
      const resCat = CommandDispatcher.execute('cat README.md', context);
      expect(resCat[0].exitCode).toBe(0);
      expect(resCat[0].output).toContain('# TurtleBot3 Package');

      // cd ~ returns home
      CommandDispatcher.execute('cd ~', context);
      expect(env.get('PWD')).toBe('/home/ubuntu');
    });

    it('returns standard bash error on invalid command', () => {
      const res = CommandDispatcher.execute('foobar_nonexistent', context);
      expect(res[0].exitCode).toBe(127);
      expect(res[0].error).toContain('bash: foobar_nonexistent: command not found');
    });
  });

  describe('TEST F: Autocompletion & Path Resolution', () => {
    it('completes paths and file names accurately', () => {
      const completions = fs.getCompletions('/home/ubuntu', 'ca');
      expect(completions).toContain('catkin_ws/');

      const mapCompletions = fs.getCompletions('/home/ubuntu', 'map.');
      expect(mapCompletions).toContain('map.yaml');
      expect(mapCompletions).toContain('map.pgm');
    });
  });
});

