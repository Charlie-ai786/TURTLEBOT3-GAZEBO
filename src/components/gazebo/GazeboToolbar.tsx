import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  MousePointer,
  Move,
  RotateCw,
  Box,
  Circle,
  Eye,
  Camera,
} from 'lucide-react';
import { useSimulationStore } from '../../state/simulationStore';

export const GazeboToolbar: React.FC = () => {
  const isPaused = useSimulationStore((s) => s.isPaused);
  const togglePause = useSimulationStore((s) => s.togglePause);
  const simSpeed = useSimulationStore((s) => s.simSpeed);
  const setSimSpeed = useSimulationStore((s) => s.setSimSpeed);
  const simTime = useSimulationStore((s) => s.simTime);
  const realTimeFactor = useSimulationStore((s) => s.realTimeFactor);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const resetWorld = useSimulationStore((s) => s.resetWorld);
  const activeTransformTool = useSimulationStore((s) => s.activeTransformTool);
  const setActiveTransformTool = useSimulationStore((s) => s.setActiveTransformTool);
  const addObject = useSimulationStore((s) => s.addObject);

  const formatSimTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 1000);
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  return (
    <div className="h-9 bg-[#2b2b2b] border-b border-[#1f1f1f] text-[#dcdcdc] flex items-center px-2 space-x-2 text-xs select-none">
      {/* 1. Simulation Controls (Play / Pause / Step / Reset) */}
      <div className="flex items-center space-x-1 bg-[#3a3a3a] p-0.5 rounded border border-[#4a4a4a]">
        <button
          onClick={togglePause}
          title={isPaused ? 'Play Simulation (Space)' : 'Pause Simulation (Space)'}
          className={`p-1.5 rounded flex items-center justify-center ${
            isPaused ? 'bg-[#27ae60] text-white' : 'bg-[#e74c3c] text-white'
          } hover:opacity-90`}
        >
          {isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
        </button>

        <button
          onClick={() => {
            if (isPaused) {
              useSimulationStore.getState().tick(0.016);
            }
          }}
          title="Step Simulation (1 frame)"
          disabled={!isPaused}
          className="p-1.5 rounded hover:bg-[#555] text-gray-300 disabled:opacity-40"
        >
          <RotateCw size={13} />
        </button>

        <button
          onClick={resetSimulation}
          title="Reset Model Poses"
          className="p-1.5 rounded hover:bg-[#555] text-gray-300"
        >
          <RotateCcw size={13} />
        </button>

        <button
          onClick={resetWorld}
          title="Reset World to Initial State"
          className="p-1.5 rounded hover:bg-[#555] text-orange-400"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      <div className="h-5 w-[1px] bg-[#444]"></div>

      {/* 2. Simulation Clocks & RTF */}
      <div className="flex items-center space-x-3 bg-[#1e1e1e] px-2.5 py-1 rounded border border-[#333] font-mono text-[11px]">
        <div>
          <span className="text-gray-400 mr-1.5">Sim:</span>
          <span className="text-[#00e676] font-semibold">{formatSimTime(simTime)}</span>
        </div>
        <div className="text-gray-500">|</div>
        <div>
          <span className="text-gray-400 mr-1.5">RTF:</span>
          <span className="text-[#64b5f6] font-semibold">{(realTimeFactor * simSpeed).toFixed(2)}x</span>
        </div>
        <div className="text-gray-500">|</div>
        <div className="flex items-center space-x-1">
          <span className="text-gray-400 mr-1">Speed:</span>
          <select
            value={simSpeed}
            onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
            className="bg-[#2a2a2a] text-white border border-[#444] rounded px-1 py-0.5 text-[11px] focus:outline-none"
          >
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="1.0">1.0x</option>
            <option value="2.0">2.0x</option>
            <option value="4.0">4.0x</option>
          </select>
        </div>
      </div>

      <div className="h-5 w-[1px] bg-[#444]"></div>

      {/* 3. Transform & Selection Tools */}
      <div className="flex items-center space-x-1 bg-[#3a3a3a] p-0.5 rounded border border-[#4a4a4a]">
        <button
          onClick={() => setActiveTransformTool('select')}
          title="Select Mode"
          className={`p-1.5 rounded ${
            activeTransformTool === 'select' ? 'bg-[#2980b9] text-white' : 'text-gray-300 hover:bg-[#555]'
          }`}
        >
          <MousePointer size={13} />
        </button>
        <button
          onClick={() => setActiveTransformTool('translate')}
          title="Translate Mode"
          className={`p-1.5 rounded ${
            activeTransformTool === 'translate' ? 'bg-[#2980b9] text-white' : 'text-gray-300 hover:bg-[#555]'
          }`}
        >
          <Move size={13} />
        </button>
        <button
          onClick={() => setActiveTransformTool('rotate')}
          title="Rotate Mode"
          className={`p-1.5 rounded ${
            activeTransformTool === 'rotate' ? 'bg-[#2980b9] text-white' : 'text-gray-300 hover:bg-[#555]'
          }`}
        >
          <RotateCw size={13} />
        </button>
      </div>

      <div className="h-5 w-[1px] bg-[#444]"></div>

      {/* 4. Quick Insert Basic Geometries */}
      <div className="flex items-center space-x-1 bg-[#3a3a3a] p-0.5 rounded border border-[#4a4a4a]">
        <button
          onClick={() => addObject('box')}
          title="Insert Box into Simulation"
          className="p-1.5 rounded hover:bg-[#555] text-amber-300 flex items-center space-x-1"
        >
          <Box size={13} />
          <span className="text-[10px]">Box</span>
        </button>
        <button
          onClick={() => addObject('cylinder')}
          title="Insert Cylinder into Simulation"
          className="p-1.5 rounded hover:bg-[#555] text-rose-400 flex items-center space-x-1"
        >
          <Circle size={13} />
          <span className="text-[10px]">Cyl</span>
        </button>
        <button
          onClick={() => addObject('obstacle')}
          title="Insert Barrier Obstacle"
          className="p-1.5 rounded hover:bg-[#555] text-orange-300 flex items-center space-x-1"
        >
          <Eye size={13} />
          <span className="text-[10px]">Pillar</span>
        </button>
      </div>

      <div className="flex-1"></div>

      {/* 5. Viewport Camera Presets (Perspective, Top, Front, Left, Right) */}
      <div className="flex items-center space-x-1 text-[11px] text-gray-400">
        <Camera size={13} />
        <span>View:</span>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('gazebo-camera-preset', { detail: 'perspective' }));
          }}
          className="px-1.5 py-0.5 hover:bg-[#444] rounded text-gray-300"
        >
          Perspective
        </button>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('gazebo-camera-preset', { detail: 'top' }));
          }}
          className="px-1.5 py-0.5 hover:bg-[#444] rounded text-gray-300"
        >
          Top
        </button>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('gazebo-camera-preset', { detail: 'front' }));
          }}
          className="px-1.5 py-0.5 hover:bg-[#444] rounded text-gray-300"
        >
          Front
        </button>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('gazebo-camera-preset', { detail: 'left' }));
          }}
          className="px-1.5 py-0.5 hover:bg-[#444] rounded text-gray-300"
        >
          Left
        </button>
      </div>
    </div>
  );
};
