import React from 'react';
import {
  Hand,
  Camera,
  Navigation2,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import { useSimulationStore } from '../../state/simulationStore';

export const RvizTopBar: React.FC = () => {
  const rvizTool = useSimulationStore((s) => s.rvizTool);
  const setRvizTool = useSimulationStore((s) => s.setRvizTool);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const cancelNavGoal = useSimulationStore((s) => s.cancelNavGoal);
  const navigation = useSimulationStore((s) => s.navigation);
  const toggleTerminal = useSimulationStore((s) => s.toggleTerminal);
  const togglePracticals = useSimulationStore((s) => s.togglePracticals);
  const toggleTopicMonitor = useSimulationStore((s) => s.toggleTopicMonitor);

  return (
    <div className="h-9 bg-[#2b2b2b] border-b border-[#1c1c1c] text-[#dcdcdc] flex items-center px-2 space-x-2 text-xs select-none">
      {/* RViz Noetic Logo/Badge */}
      <div className="flex items-center space-x-1.5 mr-2 bg-[#1f1f1f] px-2 py-1 rounded border border-[#3a3a3a]">
        <span className="font-bold text-[#e74c3c] text-[11px] tracking-wide">RVIZ</span>
        <span className="text-[10px] text-gray-400">ROS Noetic</span>
      </div>

      {/* RViz Primary Tools */}
      <div className="flex items-center space-x-1 bg-[#383838] p-0.5 rounded border border-[#484848]">
        <button
          onClick={() => setRvizTool('interact')}
          title="Interact"
          className={`px-2 py-1 rounded flex items-center space-x-1 ${
            rvizTool === 'interact' ? 'bg-[#2980b9] text-white font-medium' : 'text-gray-300 hover:bg-[#4a4a4a]'
          }`}
        >
          <Hand size={12} />
          <span className="text-[11px]">Interact</span>
        </button>

        <button
          onClick={() => setRvizTool('move_camera')}
          title="Move Camera (Orbit/Pan/Zoom)"
          className={`px-2 py-1 rounded flex items-center space-x-1 ${
            rvizTool === 'move_camera' ? 'bg-[#2980b9] text-white font-medium' : 'text-gray-300 hover:bg-[#4a4a4a]'
          }`}
        >
          <Camera size={12} />
          <span className="text-[11px]">Move Camera</span>
        </button>

        <button
          onClick={() => setRvizTool('pose_estimate')}
          title="2D Pose Estimate (/initialpose)"
          className={`px-2 py-1 rounded flex items-center space-x-1 ${
            rvizTool === 'pose_estimate' ? 'bg-[#27ae60] text-white font-medium' : 'text-gray-300 hover:bg-[#4a4a4a]'
          }`}
        >
          <Navigation2 size={12} className="rotate-45" />
          <span className="text-[11px]">2D Pose Estimate</span>
        </button>

        <button
          onClick={() => setRvizTool('nav_goal')}
          title="2D Nav Goal (Click map to plan autonomous A* route)"
          className={`px-2 py-1 rounded flex items-center space-x-1 ${
            rvizTool === 'nav_goal'
              ? 'bg-[#e74c3c] text-white font-bold animate-pulse'
              : 'text-rose-300 hover:bg-[#4a4a4a]'
          }`}
        >
          <MapPin size={12} />
          <span className="text-[11px]">2D Nav Goal</span>
        </button>
      </div>

      {/* Cancel Goal Button (if navigating) */}
      {navigation.goal && navigation.goal.active && (
        <button
          onClick={cancelNavGoal}
          className="px-2 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-[11px] font-semibold flex items-center space-x-1"
        >
          <span>Cancel Goal</span>
        </button>
      )}

      <div className="h-5 w-[1px] bg-[#444]"></div>

      {/* Reset Tool */}
      <button
        onClick={resetSimulation}
        title="Reset Time & Robot Pose"
        className="px-2 py-1 rounded bg-[#383838] hover:bg-[#484848] text-gray-300 flex items-center space-x-1 border border-[#484848]"
      >
        <RotateCcw size={12} />
        <span className="text-[11px]">Reset</span>
      </button>

      <div className="flex-1"></div>

      {/* Navigation & Status Shortcuts */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={togglePracticals}
          className="px-2 py-1 bg-[#d35400] hover:bg-[#e67e22] text-white rounded text-[11px] font-bold shadow-sm"
        >
          📚 Practicals
        </button>
        <button
          onClick={toggleTerminal}
          className="px-2 py-1 bg-[#2c3e50] hover:bg-[#34495e] text-[#1abc9c] border border-[#16a085] rounded text-[11px] font-mono shadow-sm"
        >
          $ Terminal
        </button>
        <button
          onClick={toggleTopicMonitor}
          className="px-2 py-1 bg-[#34495e] hover:bg-[#4a6278] text-[#ecf0f1] border border-[#555] rounded text-[11px] shadow-sm"
        >
          📡 /topics
        </button>
      </div>
    </div>
  );
};

