import React from 'react';
import { Settings, Trash2, X } from 'lucide-react';
import { useSimulationStore } from '../../state/simulationStore';

export const GazeboInspector: React.FC = () => {
  const selectedObjectId = useSimulationStore((s) => s.selectedObjectId);
  const selectObject = useSimulationStore((s) => s.selectObject);
  const objects = useSimulationStore((s) => s.objects);
  const updateObject = useSimulationStore((s) => s.updateObject);
  const removeObject = useSimulationStore((s) => s.removeObject);
  const robot = useSimulationStore((s) => s.robot);

  if (!selectedObjectId) return null;

  const isRobot = selectedObjectId === 'robot';
  const selectedObj = objects.find((o) => o.id === selectedObjectId);

  if (!isRobot && !selectedObj) return null;

  return (
    <div className="absolute right-3 top-12 w-72 bg-[#2b2b2b] border border-[#444] rounded shadow-2xl text-[#dcdcdc] text-xs select-none z-30">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#383838] border-b border-[#444] rounded-t font-semibold">
        <div className="flex items-center space-x-1.5">
          <Settings size={13} className="text-[#ff9800]" />
          <span>Property Inspector</span>
        </div>
        <button
          onClick={() => selectObject(null)}
          className="text-gray-400 hover:text-white"
        >
          <X size={13} />
        </button>
      </div>

      <div className="p-3 space-y-3 max-h-[80vh] overflow-y-auto">
        {isRobot ? (
          /* Robot Properties */
          <div className="space-y-2.5">
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                Model Name
              </div>
              <div className="text-sm font-semibold text-white">turtlebot3_burger</div>
            </div>

            <div className="border-t border-[#444] pt-2">
              <div className="text-[11px] font-semibold text-gray-300 mb-1.5">
                Pose (Position & Yaw)
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                <div className="bg-[#1e1e1e] p-1.5 rounded">
                  <span className="text-gray-400">X: </span>
                  <span className="text-green-400">{robot.x.toFixed(3)} m</span>
                </div>
                <div className="bg-[#1e1e1e] p-1.5 rounded">
                  <span className="text-gray-400">Y: </span>
                  <span className="text-green-400">{robot.y.toFixed(3)} m</span>
                </div>
                <div className="bg-[#1e1e1e] p-1.5 rounded">
                  <span className="text-gray-400">Yaw: </span>
                  <span className="text-yellow-400">
                    {((robot.heading * 180) / Math.PI).toFixed(1)}°
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#444] pt-2">
              <div className="text-[11px] font-semibold text-gray-300 mb-1.5">
                Differential Drive Kinematics
              </div>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                <div className="bg-[#1e1e1e] p-1.5 rounded">
                  <div className="text-[10px] text-gray-400">Linear Vel:</div>
                  <div className="text-cyan-400 font-bold">{robot.linearVelocity.toFixed(3)} m/s</div>
                </div>
                <div className="bg-[#1e1e1e] p-1.5 rounded">
                  <div className="text-[10px] text-gray-400">Angular Vel:</div>
                  <div className="text-cyan-400 font-bold">{robot.angularVelocity.toFixed(3)} rad/s</div>
                </div>
                <div className="bg-[#1e1e1e] p-1.5 rounded">
                  <div className="text-[10px] text-gray-400">Left Wheel:</div>
                  <div className="text-purple-300">{robot.leftWheelVelocity.toFixed(2)} rad/s</div>
                </div>
                <div className="bg-[#1e1e1e] p-1.5 rounded">
                  <div className="text-[10px] text-gray-400">Right Wheel:</div>
                  <div className="text-purple-300">{robot.rightWheelVelocity.toFixed(2)} rad/s</div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#444] pt-2">
              <div className="text-[11px] font-semibold text-gray-300 mb-1">
                Hardware Specs
              </div>
              <div className="text-[10px] text-gray-400 space-y-0.5">
                <div>Wheel Separation: 160 mm</div>
                <div>Wheel Radius: 33 mm</div>
                <div>LiDAR: LDS-01 360° Laser (5 Hz)</div>
                <div>Controller: OpenCR 1.0 ARM Cortex-M7</div>
              </div>
            </div>
          </div>
        ) : selectedObj ? (
          /* World Object Properties */
          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">
                Object Name
              </label>
              <input
                type="text"
                value={selectedObj.name}
                onChange={(e) => updateObject(selectedObj.id, { name: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#555] rounded px-2 py-1 text-white focus:outline-none"
              />
            </div>

            {/* Position */}
            <div className="border-t border-[#444] pt-2">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">
                Position (m)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <span className="text-[10px] text-gray-400">X:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObj.position.x}
                    onChange={(e) =>
                      updateObject(selectedObj.id, {
                        position: { ...selectedObj.position, x: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-[#555] rounded px-1.5 py-1 text-white text-[11px]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">Y:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObj.position.y}
                    onChange={(e) =>
                      updateObject(selectedObj.id, {
                        position: { ...selectedObj.position, y: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-[#555] rounded px-1.5 py-1 text-white text-[11px]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">Z:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObj.position.z}
                    onChange={(e) =>
                      updateObject(selectedObj.id, {
                        position: { ...selectedObj.position, z: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-[#555] rounded px-1.5 py-1 text-white text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Rotation Roll / Pitch / Yaw */}
            <div className="border-t border-[#444] pt-2">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">
                Rotation Roll / Pitch / Yaw (rad)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <span className="text-[10px] text-gray-400">Roll:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObj.rotation.x || 0}
                    onChange={(e) =>
                      updateObject(selectedObj.id, {
                        rotation: { ...selectedObj.rotation, x: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-[#555] rounded px-1.5 py-1 text-white text-[11px]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">Pitch:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObj.rotation.y || 0}
                    onChange={(e) =>
                      updateObject(selectedObj.id, {
                        rotation: { ...selectedObj.rotation, y: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-[#555] rounded px-1.5 py-1 text-white text-[11px]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">Yaw:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObj.rotation.z || 0}
                    onChange={(e) =>
                      updateObject(selectedObj.id, {
                        rotation: { ...selectedObj.rotation, z: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-[#555] rounded px-1.5 py-1 text-white text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="border-t border-[#444] pt-2">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">
                Dimensions / Size (m)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <span className="text-[10px] text-gray-400">W:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObj.size.x}
                    onChange={(e) =>
                      updateObject(selectedObj.id, {
                        size: { ...selectedObj.size, x: parseFloat(e.target.value) || 0.1 },
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-[#555] rounded px-1.5 py-1 text-white text-[11px]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">D:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObj.size.y}
                    onChange={(e) =>
                      updateObject(selectedObj.id, {
                        size: { ...selectedObj.size, y: parseFloat(e.target.value) || 0.1 },
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-[#555] rounded px-1.5 py-1 text-white text-[11px]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">H:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObj.size.z}
                    onChange={(e) =>
                      updateObject(selectedObj.id, {
                        size: { ...selectedObj.size, z: parseFloat(e.target.value) || 0.1 },
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-[#555] rounded px-1.5 py-1 text-white text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#444] pt-2 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Static Obstacle:</span>
              <input
                type="checkbox"
                checked={selectedObj.isStatic}
                onChange={(e) => updateObject(selectedObj.id, { isStatic: e.target.checked })}
                className="rounded"
              />
            </div>

            <div className="border-t border-[#444] pt-3">
              <button
                onClick={() => removeObject(selectedObj.id)}
                className="w-full py-1.5 bg-red-800 hover:bg-red-700 text-white rounded font-medium flex items-center justify-center space-x-1"
              >
                <Trash2 size={12} />
                <span>Delete Model</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
