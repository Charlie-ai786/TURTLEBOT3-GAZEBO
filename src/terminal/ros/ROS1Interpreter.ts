import { CommandContext, CommandResult } from '../types/terminal.types';
import { ParsedCommandLine } from '../engine/CommandParser';
import { ROSPackageManager } from './ROSPackageManager';
import { ROSNodeManager } from './ROSNodeManager';
import { ROSTopicManager } from './ROSTopicManager';
import { ROSServiceManager } from './ROSServiceManager';
import { ROSParameterManager } from './ROSParameterManager';
import { SimulationBridge } from '../integration/SimulationBridge';

export class ROS1Interpreter {
  public static canHandle(command: string): boolean {
    return [
      'roscore',
      'rosnode',
      'rostopic',
      'rosservice',
      'rosparam',
      'rospack',
      'rosrun',
      'roslaunch',
    ].includes(command);
  }

  public static execute(parsed: ParsedCommandLine, context: CommandContext): CommandResult {
    const { command, positional, flags, options, raw } = parsed;
    const { proc, env } = context;

    switch (command) {
      case 'roscore': {
        if (proc.isRoscoreActive()) {
          return {
            exitCode: 1,
            error: 'roscore is already running! [master process active]',
          };
        }
        const master = proc.startRoscore();
        return {
          exitCode: 0,
          output: `... logging to /home/ubuntu/.ros/log/roscore-${master.pid}.log
Checking log directory for disk usage... done.
started core service [/rosout]
process[master]: started with pid [${master.pid}]
ROS_MASTER_URI=http://localhost:11311
setting /run_id to d7e34b92-b4ea-11ef-8000-080027b4e9f1
process[rosout-1]: started with pid [${master.pid + 2}]
started core service [/rosout]`,
        };
      }

      case 'rosnode': {
        const sub = positional[0];
        if (!sub || sub === 'list') {
          return {
            exitCode: 0,
            output: ROSNodeManager.listNodes('noetic').join('\n'),
          };
        }

        if (sub === 'info') {
          const nodeName = positional[1];
          if (!nodeName) return { exitCode: 1, error: 'rosnode info: node name required' };
          const info = ROSNodeManager.getNodeInfo(nodeName, 'noetic');
          if (!info) {
            return { exitCode: 1, error: `ERROR: Cannot contact [${nodeName}]: unknown node` };
          }
          let out = `--------------------------------------------------------------------------------\nNode [${info.name}]\nPublications:\n`;
          for (const p of info.publications) out += ` * ${p.topic} [${p.type}]\n`;
          out += '\nSubscriptions:\n';
          for (const s of info.subscriptions) out += ` * ${s.topic} [${s.type}]\n`;
          out += '\nServices:\n';
          for (const srv of info.services) out += ` * ${srv}\n`;
          out += `\ncontacting node http://turtlebot3:45123/ ...\nPid: ${info.pid}\nConnections: active`;
          return { exitCode: 0, output: out };
        }

        if (sub === 'ping') {
          const nodeName = positional[1];
          if (!nodeName) return { exitCode: 1, error: 'rosnode ping: node name required' };
          return {
            exitCode: 0,
            output: `rosnode: pinging [${nodeName}] ...\nxmlrpc reply from http://turtlebot3:45123/ time=1.145ms\nxmlrpc reply from http://turtlebot3:45123/ time=0.982ms\nping average: 1.063ms`,
          };
        }

        if (sub === 'kill') {
          const nodeName = positional[1];
          return { exitCode: 0, output: `killed [${nodeName}]` };
        }

        return { exitCode: 1, error: `rosnode: unknown command [${sub}]` };
      }

      case 'rostopic': {
        const sub = positional[0];
        if (!sub || sub === 'list') {
          return {
            exitCode: 0,
            output: ROSTopicManager.list(flags.has('v'), false),
          };
        }

        if (sub === 'info') {
          const topic = positional[1];
          if (!topic) return { exitCode: 1, error: 'rostopic info: topic name required' };
          return { exitCode: 0, output: ROSTopicManager.info(topic, false) };
        }

        if (sub === 'type') {
          const topic = positional[1];
          if (!topic) return { exitCode: 1, error: 'rostopic type: topic name required' };
          return { exitCode: 0, output: ROSTopicManager.type(topic, false) };
        }

        if (sub === 'hz') {
          const topic = positional[1];
          if (!topic) return { exitCode: 1, error: 'rostopic hz: topic name required' };
          return { exitCode: 0, output: ROSTopicManager.hz(topic) };
        }

        if (sub === 'echo') {
          const topic = positional[1];
          if (!topic) return { exitCode: 1, error: 'rostopic echo: topic name required' };
          const count = options.get('n') ? parseInt(options.get('n')!, 10) : undefined;
          if (context.onEchoStart) {
            context.onEchoStart(topic, count);
            return {
              exitCode: 0,
              isStreaming: true,
              output: `Subscribing to topic: ${topic} ... streaming live messages (Ctrl+C to stop):`,
            };
          }
          return { exitCode: 0, output: `Subscribed to ${topic}` };
        }

        if (sub === 'pub') {
          // rostopic pub [-1, -r rate] /topic type data
          // find topic
          const topicIdx = positional.findIndex((p, i) => i > 0 && p.startsWith('/'));
          if (topicIdx === -1 || topicIdx >= positional.length - 1) {
            return {
              exitCode: 1,
              error: 'Usage: rostopic pub [-1] <topic-name> <topic-type> [data...]',
            };
          }
          const targetTopic = positional[topicIdx];
          const targetType = positional[topicIdx + 1] || 'geometry_msgs/Twist';
          // Find rest of command for data payload
          const dataPayload = raw.slice(raw.indexOf(targetType) + targetType.length).trim();
          const res = ROSTopicManager.publishMessage(targetTopic, targetType, dataPayload);
          return { exitCode: res.success ? 0 : 1, output: res.output };
        }

        return { exitCode: 1, error: `rostopic: unknown command [${sub}]` };
      }

      case 'rosservice': {
        const sub = positional[0];
        if (!sub || sub === 'list') {
          return {
            exitCode: 0,
            output: ROSServiceManager.list(false).join('\n'),
          };
        }

        if (sub === 'type') {
          const srv = positional[1];
          const type = ROSServiceManager.type(srv);
          if (!type) return { exitCode: 1, error: `ERROR: Service [${srv}] not found` };
          return { exitCode: 0, output: type };
        }

        if (sub === 'info') {
          const srv = positional[1];
          if (!srv) return { exitCode: 1, error: 'rosservice info: service name required' };
          const type = ROSServiceManager.type(srv);
          if (!type) return { exitCode: 1, error: `ERROR: Service [${srv}] not found` };
          return {
            exitCode: 0,
            output: `Node: /turtlebot3_core\nURI: rosrpc://turtlebot3:45123\nType: ${type}\nArgs: `,
          };
        }

        if (sub === 'call') {
          const srv = positional[1];
          const args = positional.slice(2).join(' ');
          const res = ROSServiceManager.call(srv, args);
          return {
            exitCode: res.success ? 0 : 1,
            output: res.message,
          };
        }

        return { exitCode: 1, error: `rosservice: unknown command [${sub}]` };
      }

      case 'rosparam': {
        const sub = positional[0];
        if (!sub || sub === 'list') {
          return { exitCode: 0, output: ROSParameterManager.list().join('\n') };
        }

        if (sub === 'get') {
          const param = positional[1];
          if (!param) return { exitCode: 1, error: 'rosparam get: parameter name required' };
          const val = ROSParameterManager.get(param);
          if (val === null) return { exitCode: 1, error: `ERROR: Parameter [${param}] not set` };
          return { exitCode: 0, output: val };
        }

        if (sub === 'set') {
          const param = positional[1];
          const val = positional[2];
          if (!param || val === undefined) {
            return { exitCode: 1, error: 'rosparam set: parameter name and value required' };
          }
          ROSParameterManager.set(param, val);
          return { exitCode: 0 };
        }

        if (sub === 'dump') {
          return { exitCode: 0, output: ROSParameterManager.dump() };
        }

        return { exitCode: 1, error: `rosparam: unknown command [${sub}]` };
      }

      case 'rospack': {
        const sub = positional[0];
        if (!sub || sub === 'list') {
          const list = ROSPackageManager.list().map((p) => `${p.name} ${p.path}`);
          return { exitCode: 0, output: list.join('\n') };
        }

        if (sub === 'find') {
          const pkg = positional[1];
          const path = ROSPackageManager.find(pkg);
          if (!path) return { exitCode: 1, error: `[rospack] Error: package '${pkg}' not found` };
          return { exitCode: 0, output: path };
        }

        return { exitCode: 1, error: `rospack: unknown command [${sub}]` };
      }

      case 'rosrun': {
        const pkg = positional[0];
        const exec = positional[1];
        if (!pkg || !exec) {
          return { exitCode: 1, error: 'Usage: rosrun <package> <executable> [args...]' };
        }
        const res = SimulationBridge.handleRun(pkg, exec, positional.slice(2), env);
        return { exitCode: res.success ? 0 : 1, output: res.message };
      }

      case 'roslaunch': {
        const pkg = positional[0];
        const launchFile = positional[1];
        if (!pkg || !launchFile) {
          return { exitCode: 1, error: 'Usage: roslaunch <package> <launch_file> [args...]' };
        }
        const res = SimulationBridge.handleLaunch(pkg, launchFile, positional.slice(2), env);
        return { exitCode: res.success ? 0 : 1, output: res.message };
      }

      default:
        return { exitCode: 127, error: `ROS 1: Unknown command [${command}]` };
    }
  }
}

