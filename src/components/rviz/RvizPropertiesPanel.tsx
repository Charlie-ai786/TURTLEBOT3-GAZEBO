import React from 'react';
import { Eye, Navigation, Layers, Compass, Crosshair } from 'lucide-react';
import { useSimulationStore } from '../../state/simulationStore';

export const RvizPropertiesPanel: React.FC = () => {
  const robot = useSimulationStore((s) => s.robot);
  const navigation = useSimulationStore((s) => s.navigation);
  const cancelNavGoal = useSimulationStore((s) => s.cancelNavGoal);
  const recalculateNavPath = useSimulationStore((s) => s.recalculateNavPath);
  const clearCostmaps = useSimulationStore((s) => s.clearCostmaps);
  const rvizTool = useSimulationStore((s) => s.rvizTool);
  const setRvizTool = useSimulationStore((s) => s.setRvizTool);

  return (
    <div className="w-64 bg-[#262626] border-l border-[#1a1a1a] text-[#cccccc] flex flex-col text-xs select-none h-full">
      {/* Views / Navigation Properties Header */}
      <div className="px-3 py-1.5 bg-[#333333] border-b border-[#1f1f1f] font-semibold text-[11px] text-white flex items-center space-x-1.5">
        <Eye size={12} className="text-[#3498db]" />
        <span>Views & Navigation</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Camera Views Preset */}
        <div className="border border-[#383838] rounded bg-[#2b2b2b] p-2 space-y-2">
          <div className="text-[11px] font-semibold text-white flex items-center space-x-1">
            <Compass size={12} className="text-[#e67e22]" />
            <span>Camera View (Type)</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Target Frame:</span>
              <span className="font-mono text-cyan-400">base_link</span>
            </div>
            <div className="grid grid-cols-2 gap-1 pt-1">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('rviz-camera-preset', { detail: 'orbit' }));
                }}
                className="py-1 px-1.5 bg-[#383838] hover:bg-[#484848] text-white rounded text-[10px] text-center"
              >
                Orbit 3D
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('rviz-camera-preset', { detail: 'top' }));
                }}
                className="py-1 px-1.5 bg-[#383838] hover:bg-[#484848] text-white rounded text-[10px] text-center"
              >
                Top-Down (2D)
              </button>
            </div>
          </div>
        </div>

        {/* 2D Nav Goal Controller */}
        <div className="border border-[#383838] rounded bg-[#2b2b2b] p-2 space-y-2">
          <div className="text-[11px] font-semibold text-white flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Crosshair size={12} className="text-rose-400" />
              <span>2D Navigation Goal</span>
            </div>
            <button
              onClick={() => setRvizTool('nav_goal')}
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                rvizTool === 'nav_goal' ? 'bg-red-600 text-white font-bold' : 'bg-[#444] text-gray-300'
              }`}
            >
              {rvizTool === 'nav_goal' ? 'Click Map...' : 'Set Goal'}
            </button>
          </div>

          {navigation.goal && navigation.goal.active ? (
            <div className="space-y-1.5 text-[11px] bg-[#1f1f1f] p-2 rounded border border-[#333]">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Goal Target:</span>
                <span className="font-mono text-emerald-400">
                  ({navigation.goal.x.toFixed(2)}, {navigation.goal.y.toFixed(2)})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Remaining Dist:</span>
                <span className="font-mono text-yellow-400">{navigation.distanceToGoal.toFixed(2)} m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Waypoints:</span>
                <span className="font-mono text-cyan-400">{navigation.globalPath.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status:</span>
                <span
                  className={`font-bold ${
                    navigation.status === 'navigating'
                      ? 'text-cyan-400'
                      : navigation.status === 'reached'
                      ? 'text-emerald-400'
                      : navigation.status === 'blocked'
                      ? 'text-red-400'
                      : 'text-gray-300'
                  }`}
                >
                  {navigation.status.toUpperCase()}
                </span>
              </div>

              <div className="pt-1.5 space-y-1">
                <button
                  onClick={recalculateNavPath}
                  className="w-full py-1 bg-[#2980b9] hover:bg-[#3498db] text-white rounded text-[10px] font-semibold"
                >
                  Recalculate A* Path
                </button>
                <button
                  onClick={cancelNavGoal}
                  className="w-full py-1 bg-red-800 hover:bg-red-700 text-white rounded text-[10px] font-semibold"
                >
                  Cancel Navigation Goal
                </button>
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-gray-400 bg-[#1f1f1f] p-2 rounded text-center">
              Click &quot;2D Nav Goal&quot; in the top bar or above, then click anywhere on the RViz map to set an autonomous destination!
            </div>
          )}
        </div>

        {/* Costmaps Management */}
        <div className="border border-[#383838] rounded bg-[#2b2b2b] p-2 space-y-2">
          <div className="text-[11px] font-semibold text-white flex items-center space-x-1">
            <Layers size={12} className="text-purple-400" />
            <span>Costmap Stack</span>
          </div>
          <div className="text-[10px] text-gray-400">
            Inflation: 0.35m radius with lethal center and exponential decay layer.
          </div>
          <button
            onClick={clearCostmaps}
            className="w-full py-1 bg-[#383838] hover:bg-[#484848] text-gray-200 rounded text-[10px] border border-[#555]"
          >
            Clear / Re-inflate Costmaps
          </button>
        </div>

        {/* Odometry & Kinematics Monitor */}
        <div className="border border-[#383838] rounded bg-[#2b2b2b] p-2 space-y-1.5 text-[11px]">
          <div className="text-[11px] font-semibold text-white flex items-center space-x-1">
            <Navigation size={12} className="text-green-400" />
            <span>Robot Odometry Pose</span>
          </div>
          <div className="grid grid-cols-2 gap-1 font-mono text-[10px] pt-1">
            <div className="bg-[#1e1e1e] p-1 rounded">
              <span className="text-gray-400">X: </span>
              <span className="text-green-400">{robot.x.toFixed(3)} m</span>
            </div>
            <div className="bg-[#1e1e1e] p-1 rounded">
              <span className="text-gray-400">Y: </span>
              <span className="text-green-400">{robot.y.toFixed(3)} m</span>
            </div>
            <div className="bg-[#1e1e1e] p-1 rounded">
              <span className="text-gray-400">Yaw: </span>
              <span className="text-yellow-400">
                {((robot.heading * 180) / Math.PI).toFixed(1)}°
              </span>
            </div>
            <div className="bg-[#1e1e1e] p-1 rounded">
              <span className="text-gray-400">Vel: </span>
              <span className="text-cyan-400">{robot.linearVelocity.toFixed(2)} m/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

