import { CommandContext, CommandResult } from '../types/terminal.types';
import { ParsedCommandLine } from '../engine/CommandParser';
import { ROSNodeManager } from './ROSNodeManager';
import { ROSTopicManager } from './ROSTopicManager';
import { ROSServiceManager } from './ROSServiceManager';
import { ROSParameterManager } from './ROSParameterManager';
import { ROSPackageManager } from './ROSPackageManager';
import { SimulationBridge } from '../integration/SimulationBridge';

export class ROS2Interpreter {
  public static canHandle(command: string): boolean {
    return command === 'ros2' || command === 'colcon';
  }

  public static execute(parsed: ParsedCommandLine, context: CommandContext): CommandResult {
    const { positional, flags, options, raw } = parsed;
    const { env } = context;

    if (parsed.command === 'colcon') {
      const sub = positional[0];
      if (sub === 'build') {
        return {
          exitCode: 0,
          output: `Starting >>> turtlebot3_ros2
Finished <<< turtlebot3_ros2 [1.42s]

Summary: 1 package finished [1.58s]`,
        };
      }
      return { exitCode: 0, output: 'colcon: build tool for ROS 2 workspaces' };
    }

    // command === 'ros2'
    const verb = positional[0];
    const subverb = positional[1];

    if (!verb || flags.has('help') || flags.has('h') || verb === '--help' || verb === '-h') {
      return {
        exitCode: 0,
        output: `usage: ros2 [-h] Call \`ros2 <command> -h\` for more detailed usage. ...

Commands:
  node      Various node related sub-commands
  topic     Various topic related sub-commands
  service   Various service related sub-commands
  param     Various param related sub-commands
  pkg       Various package related sub-commands
  run       Run an executable from a package
  launch    Run a launch file`,
      };
    }

    switch (verb) {
      case 'node': {
        if (!subverb || subverb === 'list') {
          return {
            exitCode: 0,
            output: ROSNodeManager.listNodes('humble').join('\n'),
          };
        }

        if (subverb === 'info') {
          const nodeName = positional[2];
          if (!nodeName) return { exitCode: 1, error: 'ros2 node info: node name required' };
          const info = ROSNodeManager.getNodeInfo(nodeName, 'humble');
          if (!info) {
            return { exitCode: 1, error: `Unable to find node [${nodeName}]` };
          }
          let out = `${info.name}\n  Subscribers:\n`;
          for (const s of info.subscriptions) out += `    ${s.topic}: ${s.type}\n`;
          out += '  Publishers:\n';
          for (const p of info.publications) out += `    ${p.topic}: ${p.type}\n`;
          out += '  Service Servers:\n';
          for (const srv of info.services) out += `    ${srv}\n`;
          return { exitCode: 0, output: out.trim() };
        }

        return { exitCode: 1, error: `ros2 node: unknown command [${subverb}]` };
      }

      case 'topic': {
        if (!subverb || subverb === 'list') {
          return {
            exitCode: 0,
            output: ROSTopicManager.list(flags.has('v') || flags.has('t'), true),
          };
        }

        if (subverb === 'info') {
          const topic = positional[2];
          if (!topic) return { exitCode: 1, error: 'ros2 topic info: topic name required' };
          return { exitCode: 0, output: ROSTopicManager.info(topic, true) };
        }

        if (subverb === 'type') {
          const topic = positional[2];
          if (!topic) return { exitCode: 1, error: 'ros2 topic type: topic name required' };
          return { exitCode: 0, output: ROSTopicManager.type(topic, true) };
        }

        if (subverb === 'hz') {
          const topic = positional[2];
          if (!topic) return { exitCode: 1, error: 'ros2 topic hz: topic name required' };
          return { exitCode: 0, output: ROSTopicManager.hz(topic) };
        }

        if (subverb === 'echo') {
          const topic = positional[2];
          if (!topic) return { exitCode: 1, error: 'ros2 topic echo: topic name required' };
          const count = options.get('n') ? parseInt(options.get('n')!, 10) : undefined;
          if (context.onEchoStart) {
            context.onEchoStart(topic, count);
            return {
              exitCode: 0,
              isStreaming: true,
              output: `[ROS2] Subscribing to topic: ${topic} ... streaming live messages (Ctrl+C to stop):`,
            };
          }
          return { exitCode: 0, output: `Subscribed to ${topic}` };
        }

        if (subverb === 'pub') {
          const topicIdx = positional.findIndex((p, i) => i > 1 && p.startsWith('/'));
          if (topicIdx === -1 || topicIdx >= positional.length - 1) {
            return {
              exitCode: 1,
              error: 'Usage: ros2 topic pub <topic-name> <message-type> [data...]',
            };
          }
          const targetTopic = positional[topicIdx];
          const targetType = positional[topicIdx + 1] || 'geometry_msgs/msg/Twist';
          const dataPayload = raw.slice(raw.indexOf(targetType) + targetType.length).trim();
          const res = ROSTopicManager.publishMessage(targetTopic, targetType, dataPayload);
          return { exitCode: res.success ? 0 : 1, output: res.output };
        }

        return { exitCode: 1, error: `ros2 topic: unknown verb [${subverb}]` };
      }

      case 'service': {
        if (!subverb || subverb === 'list') {
          return {
            exitCode: 0,
            output: ROSServiceManager.list(true).join('\n'),
          };
        }

        if (subverb === 'type') {
          const srv = positional[2];
          const type = ROSServiceManager.type(srv);
          if (!type) return { exitCode: 1, error: `ERROR: Service [${srv}] not found` };
          return { exitCode: 0, output: type.replace('/', '/srv/') };
        }

        if (subverb === 'call') {
          const srv = positional[2];
          const args = positional.slice(4).join(' ');
          const res = ROSServiceManager.call(srv, args);
          return { exitCode: res.success ? 0 : 1, output: res.message };
        }

        return { exitCode: 1, error: `ros2 service: unknown verb [${subverb}]` };
      }

      case 'param': {
        if (!subverb || subverb === 'list') {
          return { exitCode: 0, output: ROSParameterManager.list().join('\n') };
        }

        if (subverb === 'get') {
          const param = positional[3] || positional[2];
          if (!param) return { exitCode: 1, error: 'ros2 param get: parameter name required' };
          const val = ROSParameterManager.get(param.startsWith('/') ? param : `/${param}`);
          if (val === null) return { exitCode: 1, error: `Parameter [${param}] not found` };
          return { exitCode: 0, output: val };
        }

        if (subverb === 'set') {
          const param = positional[3] || positional[2];
          const val = positional[4] || positional[3];
          if (!param || val === undefined) {
            return { exitCode: 1, error: 'ros2 param set: parameter name and value required' };
          }
          ROSParameterManager.set(param.startsWith('/') ? param : `/${param}`, val);
          return { exitCode: 0, output: `Set parameter successfully` };
        }

        if (subverb === 'dump') {
          return { exitCode: 0, output: ROSParameterManager.dump() };
        }

        return { exitCode: 1, error: `ros2 param: unknown verb [${subverb}]` };
      }

      case 'pkg': {
        if (!subverb || subverb === 'list') {
          const pkgs = ROSPackageManager.list().map((p) => p.name);
          return { exitCode: 0, output: pkgs.join('\n') };
        }

        if (subverb === 'prefix') {
          const pkg = positional[2];
          const path = ROSPackageManager.find(pkg);
          if (!path) return { exitCode: 1, error: `Package '${pkg}' not found` };
          return { exitCode: 0, output: path };
        }

        return { exitCode: 1, error: `ros2 pkg: unknown verb [${subverb}]` };
      }

      case 'run': {
        const pkg = positional[1];
        const exec = positional[2];
        if (!pkg || !exec) {
          return { exitCode: 1, error: 'Usage: ros2 run <package> <executable> [args...]' };
        }
        const res = SimulationBridge.handleRun(pkg, exec, positional.slice(3), env);
        return { exitCode: res.success ? 0 : 1, output: res.message };
      }

      case 'launch': {
        const pkg = positional[1];
        const launchFile = positional[2];
        if (!pkg || !launchFile) {
          return { exitCode: 1, error: 'Usage: ros2 launch <package> <launch_file> [args...]' };
        }
        const res = SimulationBridge.handleLaunch(pkg, launchFile, positional.slice(3), env);
        return { exitCode: res.success ? 0 : 1, output: res.message };
      }

      default:
        return { exitCode: 1, error: `ros2: unknown command '${verb}'` };
    }
  }
}

