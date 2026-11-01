import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentManager } from '../terminal/engine/EnvironmentManager';
import { VirtualFileSystem } from '../terminal/engine/VirtualFileSystem';
import { ProcessManager } from '../terminal/engine/ProcessManager';
import { CommandDispatcher } from '../terminal/engine/CommandDispatcher';
import { CommandContext } from '../terminal/types/terminal.types';

describe('Suite 1: Terminal Shell & Bash Commands', () => {
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
      history: ['ls', 'cd catkin_ws', 'roscore'],
    };
  });

  describe('A. Bash Environment Commands', () => {
    it('executes export, echo, printenv, env, and unset accurately', () => {
      // 1. export TURTLEBOT3_MODEL=burger
      const resExport = CommandDispatcher.execute('export TURTLEBOT3_MODEL=burger', context);
      expect(resExport[0].exitCode).toBe(0);
      expect(env.get('TURTLEBOT3_MODEL')).toBe('burger');

      // 2. echo $TURTLEBOT3_MODEL
      const resEcho = CommandDispatcher.execute('echo $TURTLEBOT3_MODEL', context);
      expect(resEcho[0].exitCode).toBe(0);
      expect(resEcho[0].output).toBe('burger');

      // 3. printenv TURTLEBOT3_MODEL
      const resPrintenvVar = CommandDispatcher.execute('printenv TURTLEBOT3_MODEL', context);
      expect(resPrintenvVar[0].exitCode).toBe(0);
      expect(resPrintenvVar[0].output).toBe('burger');

      // 4. env
      const resEnv = CommandDispatcher.execute('env', context);
      expect(resEnv[0].exitCode).toBe(0);
      expect(resEnv[0].output).toContain('TURTLEBOT3_MODEL=burger');
      expect(resEnv[0].output).toContain('USER=ubuntu');

      // 5. unset TURTLEBOT3_MODEL
      const resUnset = CommandDispatcher.execute('unset TURTLEBOT3_MODEL', context);
      expect(resUnset[0].exitCode).toBe(0);
      expect(env.get('TURTLEBOT3_MODEL')).toBeUndefined();

      // Verify unset reflected in echo
      const resEchoPost = CommandDispatcher.execute('echo $TURTLEBOT3_MODEL', context);
      expect(resEchoPost[0].output).toBe('');
    });

    it('verifies pwd, whoami, hostname, uname, and date', () => {
      const pwdRes = CommandDispatcher.execute('pwd', context);
      expect(pwdRes[0].output).toBe('/home/ubuntu');

      const whoamiRes = CommandDispatcher.execute('whoami', context);
      expect(whoamiRes[0].output).toBe('ubuntu');

      const hostRes = CommandDispatcher.execute('hostname', context);
      expect(hostRes[0].output).toBe('turtlebot3');

      const unameRes = CommandDispatcher.execute('uname -a', context);
      expect(unameRes[0].output).toContain('Linux turtlebot3');

      const dateRes = CommandDispatcher.execute('date', context);
      expect(dateRes[0].output).toBeDefined();
      expect(dateRes[0].output?.length).toBeGreaterThan(5);
    });
  });

  describe('B. Filesystem Commands', () => {
    it('executes ls, ls -la, cd, cd .., cd ~, and handles invalid paths', () => {
      // 1. ls initial directory
      const lsRes = CommandDispatcher.execute('ls', context);
      expect(lsRes[0].exitCode).toBe(0);
      expect(lsRes[0].output).toContain('catkin_ws');

      // 2. ls -la contains hidden files
      const lsLaRes = CommandDispatcher.execute('ls -la', context);
      expect(lsLaRes[0].exitCode).toBe(0);
      expect(lsLaRes[0].output).toContain('.bashrc');

      // 3. cd catkin_ws
      const cdRes = CommandDispatcher.execute('cd catkin_ws', context);
      expect(cdRes[0].exitCode).toBe(0);
      expect(env.get('PWD')).toBe('/home/ubuntu/catkin_ws');

      // 4. cd ..
      const cdUp = CommandDispatcher.execute('cd ..', context);
      expect(cdUp[0].exitCode).toBe(0);
      expect(env.get('PWD')).toBe('/home/ubuntu');

      // 5. cd /opt/ros/noetic
      const cdAbs = CommandDispatcher.execute('cd /opt/ros/noetic', context);
      expect(cdAbs[0].exitCode).toBe(0);
      expect(env.get('PWD')).toBe('/opt/ros/noetic');

      // 6. cd ~ returns to /home/ubuntu
      const cdHome = CommandDispatcher.execute('cd ~', context);
      expect(cdHome[0].exitCode).toBe(0);
      expect(env.get('PWD')).toBe('/home/ubuntu');

      // 7. Error on non-existent path
      const cdInvalid = CommandDispatcher.execute('cd /non_existent_folder_xyz', context);
      expect(cdInvalid[0].exitCode).toBe(1);
      expect(cdInvalid[0].error).toContain('No such file or directory');
    });

    it('creates, writes, reads, checks head/tail, and finds files', () => {
      // mkdir -p
      const mkdirRes = CommandDispatcher.execute('mkdir -p test_dir/sub', context);
      expect(mkdirRes[0].exitCode).toBe(0);

      // touch & cat
      const touchRes = CommandDispatcher.execute('touch test_dir/sub/sample.txt', context);
      expect(touchRes[0].exitCode).toBe(0);

      fs.writeFile(
        '/home/ubuntu/test_dir/sub/sample.txt',
        'line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\nline 10\nline 11'
      );

      const catRes = CommandDispatcher.execute('cat test_dir/sub/sample.txt', context);
      expect(catRes[0].output).toContain('line 1');
      expect(catRes[0].output).toContain('line 11');

      // head -n 3
      const headRes = CommandDispatcher.execute('head -n 3 test_dir/sub/sample.txt', context);
      expect(headRes[0].output).toBe('line 1\nline 2\nline 3');

      // tail -n 2
      const tailRes = CommandDispatcher.execute('tail -n 2 test_dir/sub/sample.txt', context);
      expect(tailRes[0].output).toBe('line 10\nline 11');

      // find
      const findRes = CommandDispatcher.execute('find test_dir -name sample.txt', context);
      expect(findRes[0].output).toContain('sample.txt');

      // rm
      const rmRes = CommandDispatcher.execute('rm test_dir/sub/sample.txt', context);
      expect(rmRes[0].exitCode).toBe(0);
      expect(fs.getNode('/home/ubuntu/test_dir/sub/sample.txt')).toBeNull();
    });
  });

  describe('C. Basic Shell Commands & Process Management', () => {
    it('handles clear, history, help, man, which, printf, jobs, ps, and kill', () => {
      let cleared = false;
      context.clearScreen = () => {
        cleared = true;
      };

      // clear
      CommandDispatcher.execute('clear', context);
      expect(cleared).toBe(true);

      // history
      const histRes = CommandDispatcher.execute('history', context);
      expect(histRes[0].output).toContain('roscore');

      // help
      const helpRes = CommandDispatcher.execute('help', context);
      expect(helpRes[0].output).toContain('Simulated Robotics Terminal');

      // man
      const manRes = CommandDispatcher.execute('man ls', context);
      expect(manRes[0].output).toContain('LS(1)');

      // which
      const whichRes = CommandDispatcher.execute('which roscore', context);
      expect(whichRes[0].output).toBe('/opt/ros/noetic/bin/roscore');

      // printf
      const printfRes = CommandDispatcher.execute('printf "Hello\\nWorld"', context);
      expect(printfRes[0].output).toBe('Hello\nWorld');

      // ps & jobs
      const psRes = CommandDispatcher.execute('ps', context);
      expect(psRes[0].output).toContain('PID');
      expect(psRes[0].output).toContain('bash');

      // Spawn process and kill it
      const spawned = proc.spawnProcess('sim_node', 'python3 node.py');
      const killRes = CommandDispatcher.execute(`kill ${spawned.pid}`, context);
      expect(killRes[0].exitCode).toBe(0);
    });
  });
});

