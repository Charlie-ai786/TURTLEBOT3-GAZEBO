import React from 'react';
import { Settings, X, Cpu, Eye, Zap, RefreshCw } from 'lucide-react';
import { useSimulationStore } from '../../state/simulationStore';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useSimulationStore((s) => s.isSettingsOpen);
  const toggleSettings = useSimulationStore((s) => s.toggleSettings);
  const lowPerformanceMode = useSimulationStore((s) => s.lowPerformanceMode);
  const toggleLowPerformanceMode = useSimulationStore((s) => s.toggleLowPerformanceMode);
  const showShadows = useSimulationStore((s) => s.showShadows);
  const toggleShadows = useSimulationStore((s) => s.toggleShadows);
  const showGridFloor = useSimulationStore((s) => s.showGridFloor);
  const toggleGridFloor = useSimulationStore((s) => s.toggleGridFloor);
  const showCollision = useSimulationStore((s) => s.showCollisionGeometry);
  const toggleCollisionGeometry = useSimulationStore((s) => s.toggleCollisionGeometry);
  const lidarRayCount = useSimulationStore((s) => s.lidarRayCount);
  const setLidarRayCount = useSimulationStore((s) => s.setLidarRayCount);
  const sensorNoise = useSimulationStore((s) => s.sensorNoise);
  const toggleSensorNoise = useSimulationStore((s) => s.toggleSensorNoise);
  const resetWorld = useSimulationStore((s) => s.resetWorld);

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-[#1e1e1e] border border-[#444] rounded-xl shadow-2xl w-[480px] overflow-hidden text-xs text-[#dcdcdc] font-sans">
        {/* Header */}
        <div className="bg-[#2c3e50] px-4 py-3 flex items-center justify-between border-b border-[#34495e]">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Settings size={18} className="text-cyan-400" />
            <span>Simulation & Graphics Settings</span>
          </div>
          <button
            onClick={toggleSettings}
            className="p-1 hover:bg-[#34495e] rounded text-gray-300 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 1. Low Performance Graphics Mode */}
          <div className="bg-[#24252a] p-3 rounded-lg border border-[#333] flex items-center justify-between">
            <div className="space-y-0.5 pr-3">
              <div className="flex items-center space-x-1.5 font-bold text-white">
                <Cpu size={14} className="text-amber-400" />
                <span>Low-Performance Mode</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Optimized for Intel Core i7 5th Gen (HD 5500) integrated graphics. Disables shadows and drops LiDAR ray count to 180 for solid 30+ FPS.
              </p>
            </div>
            <input
              type="checkbox"
              checked={lowPerformanceMode}
              onChange={toggleLowPerformanceMode}
              className="w-5 h-5 rounded cursor-pointer accent-[#27ae60]"
            />
          </div>

          {/* 2. Visual & Rendering Options */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase text-gray-400 tracking-wider flex items-center space-x-1">
              <Eye size={12} />
              <span>3D Rendering & Display</span>
            </div>

            <div className="bg-[#24252a] rounded-lg border border-[#333] divide-y divide-[#333]">
              <div className="p-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Shadow Maps</div>
                  <div className="text-[10px] text-gray-400">Realistic directional lighting shadows</div>
                </div>
                <input
                  type="checkbox"
                  checked={showShadows}
                  onChange={toggleShadows}
                  className="w-4 h-4 rounded cursor-pointer accent-[#27ae60]"
                />
              </div>

              <div className="p-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Grid Floor</div>
                  <div className="text-[10px] text-gray-400">Gazebo 1m reference grid overlay</div>
                </div>
                <input
                  type="checkbox"
                  checked={showGridFloor}
                  onChange={toggleGridFloor}
                  className="w-4 h-4 rounded cursor-pointer accent-[#27ae60]"
                />
              </div>

              <div className="p-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Collision Wireframes</div>
                  <div className="text-[10px] text-gray-400">Display physical bounding shapes</div>
                </div>
                <input
                  type="checkbox"
                  checked={showCollision}
                  onChange={toggleCollisionGeometry}
                  className="w-4 h-4 rounded cursor-pointer accent-[#27ae60]"
                />
              </div>
            </div>
          </div>

          {/* 3. Sensor Fidelity */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase text-gray-400 tracking-wider flex items-center space-x-1">
              <Zap size={12} />
              <span>Sensor Fidelity & Noise</span>
            </div>

            <div className="bg-[#24252a] rounded-lg border border-[#333] divide-y divide-[#333]">
              <div className="p-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">LiDAR Ray Count</div>
                  <div className="text-[10px] text-gray-400">Angular resolution for LDS-01 sensor</div>
                </div>
                <select
                  value={lidarRayCount}
                  onChange={(e) => setLidarRayCount(parseInt(e.target.value))}
                  className="bg-[#333] text-white border border-[#555] rounded px-2 py-1 text-xs"
                >
                  <option value={180}>180 Rays (2° step - Fast)</option>
                  <option value={360}>360 Rays (1° step - High Fidelity)</option>
                </select>
              </div>

              <div className="p-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Sensor Noise Simulation</div>
                  <div className="text-[10px] text-gray-400">Realistic ±2mm Gaussian variance on distance</div>
                </div>
                <input
                  type="checkbox"
                  checked={sensorNoise}
                  onChange={toggleSensorNoise}
                  className="w-4 h-4 rounded cursor-pointer accent-[#27ae60]"
                />
              </div>
            </div>
          </div>

          {/* 4. Reset & Factory Default */}
          <div className="pt-2">
            <button
              onClick={() => {
                resetWorld();
                toggleSettings();
              }}
              className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-white rounded font-semibold flex items-center justify-center space-x-1.5"
            >
              <RefreshCw size={14} />
              <span>Reset Entire World to Defaults</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

