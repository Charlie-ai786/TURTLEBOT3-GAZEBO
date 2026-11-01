import { CommandContext, CommandResult } from '../types/terminal.types';
import { CommandParser } from './CommandParser';
import { ShellInterpreter } from './ShellInterpreter';
import { ROS1Interpreter } from '../ros/ROS1Interpreter';
import { ROS2Interpreter } from '../ros/ROS2Interpreter';

export class CommandDispatcher {
  public static execute(rawInput: string, context: CommandContext): CommandResult[] {
    const rawTrimmed = rawInput.trim();
    if (!rawTrimmed) return [];

    const statements = CommandParser.splitCommands(rawTrimmed);
    const results: CommandResult[] = [];

    for (const stmt of statements) {
      const parsed = CommandParser.parse(stmt, context.env);
      if (!parsed.command) continue;

      const cmd = parsed.command;

      // 1. Check ROS 2 specific constraints
      if (context.rosDistro === 'humble' && cmd === 'roscore') {
        results.push({
          exitCode: 127,
          error:
            "Command 'roscore' not found in ROS 2. ROS 2 uses a decentralized DDS discovery architecture and does not require a roscore master.",
        });
        continue;
      }

      // 2. Check if Shell built-in
      if (ShellInterpreter.canHandle(cmd)) {
        const res = ShellInterpreter.execute(parsed, context);
        results.push(res);
        continue;
      }

      // 3. Check if ROS 1 command
      if (ROS1Interpreter.canHandle(cmd)) {
        if (context.rosDistro === 'humble') {
          results.push({
            exitCode: 127,
            error: `Command '${cmd}' is not available in ROS 2 Humble. In ROS 2, use 'ros2 ${cmd.replace('ros', '')}' or switch the terminal to ROS 1 Noetic.`,
          });
          continue;
        }
        const res = ROS1Interpreter.execute(parsed, context);
        results.push(res);
        continue;
      }

      // 4. Check if ROS 2 command
      if (ROS2Interpreter.canHandle(cmd)) {
        if (context.rosDistro === 'noetic') {
          results.push({
            exitCode: 127,
            error: `Command 'ros2' is not available in ROS 1 Noetic. Switch to ROS 2 Humble using the toolbar or run 'source /opt/ros/humble/setup.bash'.`,
          });
          continue;
        }
        const res = ROS2Interpreter.execute(parsed, context);
        results.push(res);
        continue;
      }

      // 5. Unrecognized command
      results.push({
        exitCode: 127,
        error: `bash: ${cmd}: command not found. Type "help" for valid Linux and ROS commands.`,
      });
    }

    return results;
  }
}

