import React, { useState, useRef, useEffect } from 'react';
import { Terminal, X, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import { useSimulationStore } from '../../state/simulationStore';
import { rosBus } from '../../ros/messageBus';

interface OutputLine {
  id: string;
  type: 'cmd' | 'output' | 'system' | 'error';
  text: string;
}

export const RosTerminal: React.FC = () => {
  const isTerminalOpen = useSimulationStore((s) => s.isTerminalOpen);
  const toggleTerminal = useSimulationStore((s) => s.toggleTerminal);
  const robot = useSimulationStore((s) => s.robot);
  const scanData = useSimulationStore((s) => s.scanData);

  const [rosDistro, setRosDistro] = useState<'noetic' | 'humble'>('noetic');
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isStreamingEcho, setIsStreamingEcho] = useState<string | null>(null);

  const [lines, setLines] = useState<OutputLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'Linux ubuntu-turtlebot 5.15.0-generic x86_64\nConnected to Simulated ROS Environment.',
    },
    {
      id: 'init-2',
      type: 'output',
      text: 'ROS_DISTRO=noetic | TURTLEBOT3_MODEL=burger | ROS_MASTER_URI=http://localhost:11311\nType "help" for a list of available ROS commands.',
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isTerminalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTerminalOpen]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Handle live streaming echo
  useEffect(() => {
    if (!isStreamingEcho) return;

    let count = 0;
    const unsub = rosBus.subscribeEcho(isStreamingEcho, (msgStr) => {
      count++;
      if (count > 25) {
        // Auto-pause to prevent flooding
        setIsStreamingEcho(null);
        setLines((prev) => [
          ...prev,
          { id: `stop-${Date.now()}`, type: 'system', text: `[Echo stopped after 25 samples. Press Enter or Ctrl+C]` },
        ]);
        return;
      }

      setLines((prev) => [
        ...prev,
        { id: `echo-${Date.now()}-${Math.random()}`, type: 'output', text: `---\n${msgStr}` },
      ]);
    });

    return () => unsub();
  }, [isStreamingEcho]);

  if (!isTerminalOpen) return null;

  const handleCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    const newLines: OutputLine[] = [
      ...lines,
      { id: `cmd-${Date.now()}`, type: 'cmd', text: `ubuntu@turtlebot3:~$ ${rawCmd}` },
    ];

    if (cmd === 'clear') {
      setLines([]);
      setInputVal('');
      return;
    }

    if (cmd === 'help') {
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `Simulated ROS Environment (Educational Terminal):
  ROS 1 Commands:
    roscore                      - Start ROS 1 Master node
    rosnode list                 - Display list of active ROS nodes
    rosnode info /move_base      - Detailed node publisher/subscriber info
    rostopic list                - List all active ROS topics (/cmd_vel, /scan, /odom, /tf)
    rostopic echo <topic>        - Stream live topic messages (e.g. rostopic echo /cmd_vel)
    rostopic hz <topic>          - Measure publishing frequency
    rosrun <pkg> <executable>    - Run ROS node (e.g. rosrun teleop_twist_keyboard teleop.py)
    roslaunch turtlebot3_gazebo turtlebot3_world.launch

  ROS 2 Humble Commands:
    ros2 node list               - List active ROS 2 nodes
    ros2 topic list              - List active ROS 2 topics
    ros2 topic echo <topic>      - Echo live topic messages

  Standard Shell:
    clear, uname -a, whoami, pwd, ls, help
* Note: All commands run in the browser's real-time simulation layer.`,
      });
      setLines(newLines);
      setInputVal('');
      return;
    }

    // ROS 1 commands
    if (cmd === 'roscore') {
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `... logging to /home/ubuntu/.ros/log/roscore.log
Checking log directory for disk usage... done.
started core service [/rosout]
process[master]: started with pid [1420]
ROS_MASTER_URI=http://localhost:11311
setting /run_id to f7b4e9-11ea-8000
process[rosout-1]: started with pid [1422]
started core service [/rosout]`,
      });
    } else if (cmd === 'rosnode list') {
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `/rosout\n/turtlebot3_core\n/turtlebot3_lds\n/robot_state_publisher\n/slam_gmapping\n/move_base`,
      });
    } else if (cmd === 'rostopic list') {
      const topicList = rosBus.getTopics().map((t) => `${t.name}   [${t.type}]`).join('\n');
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: topicList,
      });
    } else if (cmd.startsWith('rostopic echo ')) {
      const targetTopic = cmd.replace('rostopic echo ', '').trim();
      const topicInfo = rosBus.getTopicInfo(targetTopic);
      if (topicInfo) {
        setIsStreamingEcho(targetTopic);
        newLines.push({
          id: `out-${Date.now()}`,
          type: 'system',
          text: `Subscribing to topic: ${targetTopic} (${topicInfo.type})... streaming live messages:`,
        });
      } else {
        newLines.push({
          id: `err-${Date.now()}`,
          type: 'error',
          text: `ERROR: Topic [${targetTopic}] is not published. Use "rostopic list" to see active topics.`,
        });
      }
    } else if (cmd.startsWith('rostopic hz ')) {
      const topicName = cmd.replace('rostopic hz ', '').trim();
      const hzVal = topicName === '/scan' ? (scanData ? scanData.scanFrequency.toFixed(1) : '5.0') : '50.0';
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `subscribed to [${topicName}]\naverage rate: ${hzVal} Hz\nmin: 0.018s max: 0.022s std dev: 0.0012s window: 50`,
      });
    } else if (cmd.startsWith('rosnode info ')) {
      const nodeName = cmd.replace('rosnode info ', '').trim();
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `--------------------------------------------------------------------------------\nNode [${nodeName}]\nPublications:\n * /cmd_vel [geometry_msgs/Twist]\n * /rosout [rosgraph_msgs/Log]\n\nSubscriptions:\n * /scan [sensor_msgs/LaserScan]\n * /odom [nav_msgs/Odometry]\n\nServices:\n * ${nodeName}/get_loggers\n * ${nodeName}/set_logger_level\n\ncontacting node http://turtlebot3:45123/ ...\nPid: 2841\nConnections: active`,
      });
    } else if (cmd.includes('roslaunch turtlebot3_gazebo')) {
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `... logging to /home/ubuntu/.ros/log/turtlebot3_world.log
[turtlebot3_world.launch] is already active in your browser simulation!
Loading model: turtlebot3_burger at pose (x: -2.0, y: -0.5, z: 0.0)
Gazebo Classic 11.14 physics engine running.`,
      });
    } else if (cmd.includes('roslaunch turtlebot3_slam')) {
      useSimulationStore.getState().startMapping();
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `[turtlebot3_slam.launch] Started SLAM Gmapping node!
Subscribed to /scan and /odom.
Occupancy grid mapping is now ACTIVE! Drive the robot to build the map.`,
      });
    } else if (cmd.includes('roslaunch turtlebot3_navigation')) {
      useSimulationStore.getState().setWorkspaceMode('rviz');
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `[turtlebot3_navigation.launch] Switched to RViz workspace!
Loaded map_server, global_costmap, local_costmap, and move_base.
Set a 2D Nav Goal in RViz to navigate autonomously!`,
      });
    }
    // ROS 2 Humble commands
    else if (cmd === 'ros2 node list') {
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `/turtlebot3_node\n/turtlebot3_lds\n/robot_state_publisher\n/slam_toolbox\n/nav2_controller`,
      });
    } else if (cmd === 'ros2 topic list') {
      const topicList = rosBus.getTopics().map((t) => t.name).join('\n');
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: topicList,
      });
    } else if (cmd.startsWith('ros2 topic echo ')) {
      const targetTopic = cmd.replace('ros2 topic echo ', '').trim();
      const topicInfo = rosBus.getTopicInfo(targetTopic);
      if (topicInfo) {
        setIsStreamingEcho(targetTopic);
        newLines.push({
          id: `out-${Date.now()}`,
          type: 'system',
          text: `[ROS2] Listening to topic: ${targetTopic} ...`,
        });
      } else {
        newLines.push({
          id: `err-${Date.now()}`,
          type: 'error',
          text: `[ROS2] Could not find topic '${targetTopic}'.`,
        });
      }
    } else if (cmd === 'uname -a') {
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: 'Linux turtlebot3 5.15.0-89-generic #99-Ubuntu SMP x86_64 x86_64 GNU/Linux',
      });
    } else if (cmd === 'whoami') {
      newLines.push({ id: `out-${Date.now()}`, type: 'output', text: 'ubuntu' });
    } else if (cmd === 'pwd') {
      newLines.push({ id: `out-${Date.now()}`, type: 'output', text: '/home/ubuntu/catkin_ws' });
    } else if (cmd === 'ls') {
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: 'build  devel  src  turtlebot3_ws  map.pgm  map.yaml',
      });
    } else {
      newLines.push({
        id: `err-${Date.now()}`,
        type: 'error',
        text: `bash: ${cmd.split(' ')[0]}: command not recognized. Type "help" for valid ROS commands.`,
      });
    }

    setLines(newLines);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'c' && e.ctrlKey) {
      if (isStreamingEcho) {
        setIsStreamingEcho(null);
        setLines((prev) => [
          ...prev,
          { id: `stop-${Date.now()}`, type: 'system', text: '^C (Process terminated)' },
        ]);
        setInputVal('');
      }
      return;
    }

    if (e.key === 'Enter') {
      if (isStreamingEcho) {
        setIsStreamingEcho(null);
        return;
      }
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex + 1 < commandHistory.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIdx] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div className="fixed inset-x-8 bottom-6 top-1/2 z-50 bg-[#1e1e1e] border border-[#555] rounded-lg shadow-2xl flex flex-col overflow-hidden font-mono text-xs select-text">
      {/* Ubuntu Terminal Header */}
      <div className="bg-[#2d2d2d] px-3 py-1.5 flex items-center justify-between border-b border-[#3c3c3c] select-none">
        <div className="flex items-center space-x-2">
          {/* Traffic light window controls */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={toggleTerminal}
              className="w-3 h-3 rounded-full bg-[#e74c3c] hover:opacity-80"
              title="Close"
            ></button>
            <div className="w-3 h-3 rounded-full bg-[#f39c12]" title="Minimize"></div>
            <div className="w-3 h-3 rounded-full bg-[#27ae60]" title="Maximize"></div>
          </div>
          <div className="flex items-center space-x-1.5 text-gray-300 font-semibold ml-2">
            <Terminal size={14} className="text-[#3498db]" />
            <span>ubuntu@turtlebot3: ~/catkin_ws</span>
          </div>
        </div>

        {/* ROS 1 vs ROS 2 Distro Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-[#1a1a1a] p-0.5 rounded border border-[#444] text-[11px]">
            <button
              onClick={() => setRosDistro('noetic')}
              className={`px-2 py-0.5 rounded ${
                rosDistro === 'noetic' ? 'bg-[#2980b9] text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              ROS 1 Noetic
            </button>
            <button
              onClick={() => setRosDistro('humble')}
              className={`px-2 py-0.5 rounded ${
                rosDistro === 'humble' ? 'bg-[#2980b9] text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              ROS 2 Humble
            </button>
          </div>

          <button
            onClick={() => setLines([])}
            title="Clear Terminal Output"
            className="p-1 hover:bg-[#444] rounded text-gray-400"
          >
            <RefreshCw size={12} />
          </button>
          <button
            onClick={toggleTerminal}
            className="p-1 hover:bg-[#444] rounded text-gray-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#0c0d10] text-[#dcdcdc] leading-relaxed">
        {lines.map((line) => (
          <div key={line.id} className="whitespace-pre-wrap">
            {line.type === 'cmd' ? (
              <span className="text-[#55ff55] font-semibold">{line.text}</span>
            ) : line.type === 'system' ? (
              <span className="text-[#00bcd4] italic">{line.text}</span>
            ) : line.type === 'error' ? (
              <span className="text-[#ff5555]">{line.text}</span>
            ) : (
              <span className="text-gray-300">{line.text}</span>
            )}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Command Input Bar */}
      <div className="bg-[#121316] border-t border-[#333] px-3 py-2 flex items-center space-x-2">
        <span className="text-[#55ff55] font-bold">ubuntu@turtlebot3:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreamingEcho ? 'Streaming topic messages... Press Ctrl+C to stop' : 'Enter ROS command (e.g. rostopic list, rostopic echo /cmd_vel, help)...'}
          className="flex-1 bg-transparent text-white focus:outline-none placeholder-gray-600 font-mono text-xs"
        />
        {isStreamingEcho && (
          <button
            onClick={() => setIsStreamingEcho(null)}
            className="px-2 py-0.5 bg-red-800 text-white rounded text-[10px] font-bold"
          >
            Stop Echo
          </button>
        )}
      </div>
    </div>
  );
};

