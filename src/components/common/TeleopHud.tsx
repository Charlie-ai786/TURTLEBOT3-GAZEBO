import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Square,
  Compass,
  Gauge,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSimulationStore } from '../../state/simulationStore';

export const TeleopHud: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const robot = useSimulationStore((s) => s.robot);
  const setTeleopVelocity = useSimulationStore((s) => s.setTeleopVelocity);
  const emergencyStop = useSimulationStore((s) => s.emergencyStop);

  const handleDirClick = (lin: number, ang: number) => {
    setTeleopVelocity(lin, ang);
  };

  return (
    <div className="fixed bottom-8 right-4 z-40 bg-[#1e1e1e]/95 backdrop-blur-md border border-[#444] rounded-lg shadow-2xl text-white select-none w-64 overflow-hidden font-sans">
      {/* Title Bar */}
      <div className="bg-[#2d3436] px-3 py-1.5 flex items-center justify-between border-b border-[#444]">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
          <Gauge size={13} />
          <span>TurtleBot3 Teleop HUD</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white"
        >
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {!collapsed && (
        <div className="p-2.5 space-y-2.5 text-xs">
          {/* Velocity & Pose Gauges */}
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
            <div className="bg-[#121212] p-1.5 rounded border border-[#333]">
              <span className="text-[10px] text-gray-400 block">Linear Vel:</span>
              <span className="text-cyan-400 font-bold">{robot.linearVelocity.toFixed(2)} m/s</span>
            </div>
            <div className="bg-[#121212] p-1.5 rounded border border-[#333]">
              <span className="text-[10px] text-gray-400 block">Angular Vel:</span>
              <span className="text-cyan-400 font-bold">{robot.angularVelocity.toFixed(2)} rad/s</span>
            </div>
            <div className="bg-[#121212] p-1.5 rounded border border-[#333]">
              <span className="text-[10px] text-gray-400 block">Left Wheel:</span>
              <span className="text-purple-300 font-bold">{robot.leftWheelVelocity.toFixed(1)} r/s</span>
            </div>
            <div className="bg-[#121212] p-1.5 rounded border border-[#333]">
              <span className="text-[10px] text-gray-400 block">Right Wheel:</span>
              <span className="text-purple-300 font-bold">{robot.rightWheelVelocity.toFixed(1)} r/s</span>
            </div>
          </div>

          {/* Heading & Position */}
          <div className="bg-[#121212] p-1.5 rounded border border-[#333] font-mono text-[11px] flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Compass size={12} className="text-yellow-400" />
              <span>Yaw: {((robot.heading * 180) / Math.PI).toFixed(0)}°</span>
            </div>
            <div className="text-green-400">
              ({robot.x.toFixed(2)}, {robot.y.toFixed(2)})
            </div>
          </div>

          {/* On-Screen D-Pad Controller */}
          <div className="flex flex-col items-center space-y-1 pt-1">
            {/* Forward */}
            <button
              onMouseDown={() => handleDirClick(0.22, 0)}
              onMouseUp={() => handleDirClick(0, 0)}
              className="w-10 h-10 bg-[#333] hover:bg-[#444] active:bg-[#2980b9] rounded flex items-center justify-center text-white shadow border border-[#555]"
              title="Forward (W / Up)"
            >
              <ArrowUp size={16} />
            </button>

            {/* Turn Left, Stop, Turn Right */}
            <div className="flex items-center space-x-1">
              <button
                onMouseDown={() => handleDirClick(0, 1.82)}
                onMouseUp={() => handleDirClick(0, 0)}
                className="w-10 h-10 bg-[#333] hover:bg-[#444] active:bg-[#2980b9] rounded flex items-center justify-center text-white shadow border border-[#555]"
                title="Turn Left (A / Left)"
              >
                <ArrowLeft size={16} />
              </button>

              <button
                onClick={emergencyStop}
                className="w-10 h-10 bg-red-800 hover:bg-red-700 active:bg-red-900 rounded flex items-center justify-center text-white shadow border border-red-600 font-bold"
                title="Safety Stop (Space)"
              >
                <Square size={14} fill="currentColor" />
              </button>

              <button
                onMouseDown={() => handleDirClick(0, -1.82)}
                onMouseUp={() => handleDirClick(0, 0)}
                className="w-10 h-10 bg-[#333] hover:bg-[#444] active:bg-[#2980b9] rounded flex items-center justify-center text-white shadow border border-[#555]"
                title="Turn Right (D / Right)"
              >
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Backward */}
            <button
              onMouseDown={() => handleDirClick(-0.22, 0)}
              onMouseUp={() => handleDirClick(0, 0)}
              className="w-10 h-10 bg-[#333] hover:bg-[#444] active:bg-[#2980b9] rounded flex items-center justify-center text-white shadow border border-[#555]"
              title="Backward (S / Down)"
            >
              <ArrowDown size={16} />
            </button>
          </div>

          {/* Keyboard Legend */}
          <div className="text-[10px] text-gray-400 text-center border-t border-[#333] pt-1">
            Keyboard: <span className="text-white font-mono font-bold">W/A/S/D</span> or <span className="text-white font-mono font-bold">Arrows</span> | <span className="text-white font-mono font-bold">Space</span> to Stop
          </div>
        </div>
      )}
    </div>
  );
};

