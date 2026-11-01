import { CommandContext, CommandResult } from '../types/terminal.types';
import { ParsedCommandLine } from './CommandParser';

export class ShellInterpreter {
  public static canHandle(command: string): boolean {
    const builtins = [
      'export',
      'unset',
      'echo',
      'printf',
      'printenv',
      'env',
      'pwd',
      'cd',
      'ls',
      'mkdir',
      'touch',
      'cat',
      'head',
      'tail',
      'find',
      'rm',
      'clear',
      'history',
      'whoami',
      'hostname',
      'date',
      'uname',
      'which',
      'source',
      '.',
      'sleep',
      'help',
      'man',
      'ps',
      'jobs',
      'kill',
      'rosversion',
    ];
    return builtins.includes(command);
  }

  public static execute(parsed: ParsedCommandLine, context: CommandContext): CommandResult {
    const { command, args, flags, options, positional } = parsed;
    const { env, fs } = context;
    const cwd = env.get('PWD') || '/home/ubuntu';

    switch (command) {
      case 'export': {
        if (args.length === 0) {
          const all = env.getAll();
          const lines = Object.entries(all)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `declare -x ${k}="${v}"`);
          return { exitCode: 0, output: lines.join('\n') };
        }

        for (const arg of args) {
          if (arg.includes('=')) {
            const eqIdx = arg.indexOf('=');
            const key = arg.slice(0, eqIdx).trim();
            let val = arg.slice(eqIdx + 1).trim();
            // Strip outer quotes if any
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
              env.set(key, val);
            } else {
              return {
                exitCode: 1,
                error: `bash: export: '${arg}': not a valid identifier`,
              };
            }
          }
        }
        return { exitCode: 0 };
      }

      case 'unset': {
        if (args.length === 0) return { exitCode: 0 };
        for (const key of args) {
          env.unset(key);
        }
        return { exitCode: 0 };
      }

      case 'echo': {
        return { exitCode: 0, output: args.join(' ') };
      }

      case 'printenv': {
        if (positional.length === 0) {
          const all = env.getAll();
          const lines = Object.entries(all)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`);
          return { exitCode: 0, output: lines.join('\n') };
        }
        const key = positional[0];
        const val = env.get(key);
        if (val !== undefined) {
          return { exitCode: 0, output: val };
        }
        return { exitCode: 1 };
      }

      case 'env': {
        const all = env.getAll();
        const lines = Object.entries(all)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}=${v}`);
        return { exitCode: 0, output: lines.join('\n') };
      }

      case 'pwd': {
        return { exitCode: 0, output: cwd };
      }

      case 'cd': {
        const target = positional[0] || '~';
        const targetPath = fs.resolvePath(cwd, target);

        if (!fs.getNode(targetPath)) {
          return {
            exitCode: 1,
            error: `bash: cd: ${target}: No such file or directory`,
          };
        }

        if (!fs.isDirectory(targetPath)) {
          return {
            exitCode: 1,
            error: `bash: cd: ${target}: Not a directory`,
          };
        }

        env.set('PWD', targetPath);
        return { exitCode: 0 };
      }

      case 'ls': {
        const target = positional[0] || '.';
        const targetPath = fs.resolvePath(cwd, target);
        const node = fs.getNode(targetPath);

        if (!node) {
          return {
            exitCode: 2,
            error: `ls: cannot access '${target}': No such file or directory`,
          };
        }

        if (node.type === 'file') {
          return { exitCode: 0, output: node.name };
        }

        const items = fs.listDirectory(targetPath);
        if (!items) {
          return { exitCode: 0, output: '' };
        }

        const showAll = flags.has('a');
        const showLong = flags.has('l');

        const filtered = items.filter((item) => showAll || !item.name.startsWith('.'));

        if (!showLong) {
          const names = filtered.map((item) => (item.isDir ? `${item.name}/` : item.name));
          return { exitCode: 0, output: names.join('  ') };
        }

        // Long format
        const lines: string[] = [`total ${filtered.length * 4}`];
        for (const item of filtered) {
          const dateStr = item.updatedAt.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
          const perm = item.permissions;
          const size = String(item.size).padStart(6, ' ');
          const name = item.isDir ? `${item.name}/` : item.name;
          lines.push(`${perm} 1 ubuntu ubuntu ${size} ${dateStr} ${name}`);
        }
        return { exitCode: 0, output: lines.join('\n') };
      }

      case 'mkdir': {
        if (positional.length === 0) {
          return { exitCode: 1, error: 'mkdir: missing operand' };
        }

        const recursive = flags.has('p');
        for (const dir of positional) {
          const fullPath = fs.resolvePath(cwd, dir);
          const success = fs.createDirectory(fullPath, recursive);
          if (!success) {
            return {
              exitCode: 1,
              error: `mkdir: cannot create directory '${dir}': No such file or directory`,
            };
          }
        }
        return { exitCode: 0 };
      }

      case 'touch': {
        if (positional.length === 0) {
          return { exitCode: 1, error: 'touch: missing file operand' };
        }

        for (const file of positional) {
          const fullPath = fs.resolvePath(cwd, file);
          const existing = fs.readFile(fullPath);
          fs.writeFile(fullPath, existing !== null ? existing : '');
        }
        return { exitCode: 0 };
      }

      case 'cat': {
        if (positional.length === 0) {
          return { exitCode: 0, output: '' };
        }

        const contents: string[] = [];
        for (const file of positional) {
          const fullPath = fs.resolvePath(cwd, file);
          const node = fs.getNode(fullPath);
          if (!node) {
            return {
              exitCode: 1,
              error: `cat: ${file}: No such file or directory`,
            };
          }
          if (node.type === 'directory') {
            return {
              exitCode: 1,
              error: `cat: ${file}: Is a directory`,
            };
          }
          contents.push(node.content || '');
        }
        return { exitCode: 0, output: contents.join('\n') };
      }

      case 'head': {
        if (positional.length === 0) return { exitCode: 1, error: 'head: missing file operand' };
        const file = positional[0];
        const fullPath = fs.resolvePath(cwd, file);
        const content = fs.readFile(fullPath);
        if (content === null) {
          return { exitCode: 1, error: `head: cannot open '${file}': No such file or directory` };
        }
        const n = parseInt(options.get('n') || '10', 10);
        const lines = content.split('\n').slice(0, n);
        return { exitCode: 0, output: lines.join('\n') };
      }

      case 'tail': {
        if (positional.length === 0) return { exitCode: 1, error: 'tail: missing file operand' };
        const file = positional[0];
        const fullPath = fs.resolvePath(cwd, file);
        const content = fs.readFile(fullPath);
        if (content === null) {
          return { exitCode: 1, error: `tail: cannot open '${file}': No such file or directory` };
        }
        const n = parseInt(options.get('n') || '10', 10);
        const lines = content.split('\n');
        const slice = lines.slice(Math.max(0, lines.length - n));
        return { exitCode: 0, output: slice.join('\n') };
      }

      case 'find': {
        const start = positional[0] || '.';
        const startPath = fs.resolvePath(cwd, start);
        const namePattern = options.get('name');
        const results = fs.find(startPath, namePattern);
        return { exitCode: 0, output: results.join('\n') };
      }

      case 'rm': {
        if (positional.length === 0) return { exitCode: 1, error: 'rm: missing operand' };
        const recursive = flags.has('r') || flags.has('f');
        for (const file of positional) {
          const fullPath = fs.resolvePath(cwd, file);
          const node = fs.getNode(fullPath);
          if (!node) {
            if (!flags.has('f')) {
              return { exitCode: 1, error: `rm: cannot remove '${file}': No such file or directory` };
            }
            continue;
          }
          if (node.type === 'directory' && !recursive) {
            return { exitCode: 1, error: `rm: cannot remove '${file}': Is a directory` };
          }
          fs.remove(fullPath, recursive);
        }
        return { exitCode: 0 };
      }

      case 'clear': {
        context.clearScreen();
        return { exitCode: 0 };
      }

      case 'history': {
        if (flags.has('c')) {
          // Clear history
          return { exitCode: 0, output: '' };
        }
        const hist = context.history.map((cmd, i) => `  ${String(i + 1).padStart(4, ' ')}  ${cmd}`);
        return { exitCode: 0, output: hist.join('\n') };
      }

      case 'whoami': {
        return { exitCode: 0, output: env.get('USER') || 'ubuntu' };
      }

      case 'hostname': {
        return { exitCode: 0, output: env.get('HOSTNAME') || 'turtlebot3' };
      }

      case 'date': {
        return { exitCode: 0, output: new Date().toUTCString() };
      }

      case 'uname': {
        if (flags.has('a')) {
          return {
            exitCode: 0,
            output: 'Linux turtlebot3 5.15.0-89-generic #99-Ubuntu SMP x86_64 x86_64 GNU/Linux',
          };
        }
        if (flags.has('r')) {
          return { exitCode: 0, output: '5.15.0-89-generic' };
        }
        return { exitCode: 0, output: 'Linux' };
      }

      case 'which': {
        if (positional.length === 0) return { exitCode: 1 };
        const bin = positional[0];
        if (['roscore', 'rosnode', 'rostopic', 'rosservice', 'rosparam', 'roslaunch', 'rosrun'].includes(bin)) {
          return { exitCode: 0, output: `/opt/ros/noetic/bin/${bin}` };
        }
        if (bin === 'ros2') {
          return { exitCode: 0, output: '/opt/ros/humble/bin/ros2' };
        }
        if (['bash', 'sh', 'ls', 'cat', 'echo', 'pwd'].includes(bin)) {
          return { exitCode: 0, output: `/bin/${bin}` };
        }
        return { exitCode: 1, error: `${bin} not found in ${env.get('PATH')}` };
      }

      case 'source':
      case '.': {
        if (positional.length === 0) {
          return { exitCode: 1, error: 'bash: source: filename argument required' };
        }
        const file = positional[0];
        const fullPath = fs.resolvePath(cwd, file);

        if (fullPath.includes('noetic/setup.bash')) {
          context.setRosDistro('noetic');
          env.syncRosDistro('noetic');
          return { exitCode: 0, output: 'ROS Noetic environment loaded.' };
        } else if (fullPath.includes('humble/setup.bash')) {
          context.setRosDistro('humble');
          env.syncRosDistro('humble');
          return { exitCode: 0, output: 'ROS 2 Humble environment loaded.' };
        } else if (fullPath.includes('catkin_ws')) {
          env.set(
            'ROS_PACKAGE_PATH',
            `/home/ubuntu/catkin_ws/src:${env.get('ROS_PACKAGE_PATH') || ''}`
          );
          return { exitCode: 0, output: 'Catkin workspace environment sourced.' };
        }

        return { exitCode: 0 };
      }

      case 'sleep': {
        return { exitCode: 0 };
      }

      case 'printf': {
        // Minimal printf: replace \n \t in format and output with expanded vars
        const fmt = args[0] || '';
        const formatted = fmt
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\r/g, '');
        return { exitCode: 0, output: formatted };
      }

      case 'ps': {
        const procList = context.proc.listProcesses();
        const header = '  PID TTY          TIME CMD';
        const rows = procList.map(
          (p) =>
            `${String(p.pid).padStart(5, ' ')} pts/0    00:00:0${(p.pid % 9)} ${p.name}`
        );
        return { exitCode: 0, output: [header, ...rows].join('\n') };
      }

      case 'jobs': {
        const fg = context.proc.getForegroundProcess();
        if (!fg) return { exitCode: 0, output: '' };
        return {
          exitCode: 0,
          output: `[1]+  Running                 ${fg.command} &`,
        };
      }

      case 'kill': {
        const pid = parseInt(positional[0], 10);
        if (isNaN(pid)) {
          return { exitCode: 1, error: `kill: ${positional[0]}: arguments must be process or job IDs` };
        }
        const ok = context.proc.killProcess(pid);
        return ok
          ? { exitCode: 0 }
          : { exitCode: 1, error: `kill: (${pid}) - No such process` };
      }

      case 'rosversion': {
        const distro = env.get('ROS_DISTRO') || 'noetic';
        if (positional[0] === '-d' || flags.has('d')) {
          return { exitCode: 0, output: distro };
        }
        return {
          exitCode: 0,
          output: distro === 'noetic' ? '1.15.14' : '0.10.9',
        };
      }

      case 'man': {
        if (positional.length === 0) {
          return { exitCode: 1, error: 'What manual page do you want?' };
        }
        const target = positional[0];
        const manPages: Record<string, string> = {
          ls: 'LS(1) - List directory contents\nUsage: ls [-l] [-a] [FILE]...',
          cd: 'CD(1) - Change the shell working directory\nUsage: cd [DIR]',
          cat: 'CAT(1) - Concatenate files and print on standard output\nUsage: cat [FILE]...',
          export: 'EXPORT(1) - Set export attribute for shell variables\nUsage: export [NAME[=VALUE]...]',
          roscore: 'ROSCORE(1) - ROS core services collection (master, rosout, parameter server)',
          rostopic: 'ROSTOPIC(1) - Command-line tool for displaying and publishing ROS topics',
          rosnode: 'ROSNODE(1) - Command-line tool for displaying ROS node info',
          ros2: 'ROS2(1) - The ROS 2 CLI tools command line runner',
        };
        return {
          exitCode: 0,
          output:
            manPages[target] ||
            `${target.toUpperCase()}(1) - Linux reference manual page for ${target}`,
        };
      }

      case 'help': {
        return {
          exitCode: 0,
          output: `Simulated Robotics Terminal (ROS 1 Noetic & ROS 2 Humble)

Linux / Bash Commands:
  export KEY=VAL             Set persistent environment variable (e.g. export TURTLEBOT3_MODEL=burger)
  echo $KEY                  Expand and display variable value
  printenv [KEY] / env       Display environment variables
  unset KEY                  Remove an environment variable
  pwd, cd <dir>, ls [-la]    Navigate virtual Linux filesystem
  mkdir [-p], touch, rm      Directory and file operations
  cat, head, tail, find      Read and search file contents
  whoami, hostname, date     System identity and info
  uname -a, which <cmd>      Kernel and binary path details
  clear (or Ctrl+L)          Clear terminal screen
  history [-c]               View or clear command history

ROS 1 Noetic Commands:
  roscore                    Start ROS 1 Master node
  rosnode list / info <node> List active nodes or node details
  rostopic list [-v]         List active ROS topics
  rostopic echo <topic>      Stream real-time topic messages (e.g. rostopic echo /cmd_vel)
  rostopic hz <topic>        Measure publishing frequency
  rostopic pub <topic> <type> <args>  Publish message to simulation
  rosservice list / call     List or call simulated ROS services
  rosparam list / get / set  Inspect or modify ROS parameters
  rospack list / find <pkg>  List or find ROS packages
  roslaunch <pkg> <file>     Launch robot nodes, SLAM, or navigation

ROS 2 Humble Commands:
  ros2 node list / info      List or inspect ROS 2 nodes
  ros2 topic list [-t]       List active ROS 2 topics
  ros2 topic echo <topic>    Stream real-time topic messages
  ros2 topic hz <topic>      Measure publishing frequency
  ros2 topic pub <topic>     Publish message to simulation
  ros2 service list / call   List or invoke ROS 2 services
  ros2 param list / get / set Parameter management
  ros2 pkg list / prefix     Package discovery
  ros2 launch <pkg> <file>   Launch ROS 2 launch scripts`,
        };
      }

      default:
        return { exitCode: 127, error: `bash: ${command}: command not found` };
    }
  }
}

