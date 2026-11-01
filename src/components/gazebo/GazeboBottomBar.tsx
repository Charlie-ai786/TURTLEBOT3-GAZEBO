import React from 'react';
import { useSimulationStore } from '../../state/simulationStore';
import { AlertTriangle, Activity } from 'lucide-react';

export const GazeboBottomBar: React.FC = () => {
  const simTime = useSimulationStore((s) => s.simTime);
  const iterations = useSimulationStore((s) => s.iterations);
  const robot = useSimulationStore((s) => s.robot);
  const lastCollision = useSimulationStore((s) => s.lastCollision);
  const objects = useSimulationStore((s) => s.objects);

  return (
    <div className="h-6 bg-[#252525] border-t border-[#1f1f1f] text-[#a0a0a0] flex items-center px-3 text-[11px] font-mono justify-between select-none">
      {/* Left: Physics Engine status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1 text-gray-300">
          <Activity size={12} className="text-[#3498db]" />
          <span className="font-semibold text-white">Physics:</span>
          <span>Differential Kinematics + 2D Continuous Collision</span>
        </div>
        <div className="text-gray-600">|</div>
        <div>
          <span>Gravity: </span>
          <span className="text-gray-300">[0, 0, -9.80]</span>
        </div>
        <div className="text-gray-600">|</div>
        <div>
          <span>Step: </span>
          <span className="text-gray-300">0.016s (60Hz)</span>
        </div>
      </div>

      {/* Center: Collision Warning badge if active */}
      {lastCollision ? (
        <div className="flex items-center space-x-1 text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-700 animate-pulse text-[10px]">
          <AlertTriangle size={11} />
          <span>COLLISION DETECTED (Wall/Obstacle Contact)</span>
        </div>
      ) : (
        <div className="text-emerald-500 text-[10px]">
          ● Normal Operating State
        </div>
      )}

      {/* Right: Pose & Entities */}
      <div className="flex items-center space-x-3">
        <div>
          <span>Entities: </span>
          <span className="text-white">{objects.length + 1}</span>
        </div>
        <div className="text-gray-600">|</div>
        <div>
          <span>Iterations: </span>
          <span className="text-white">{iterations}</span>
        </div>
        <div className="text-gray-600">|</div>
        <div>
          <span>Pose: </span>
          <span className="text-green-400">
            ({robot.x.toFixed(2)}, {robot.y.toFixed(2)})
          </span>
          <span className="text-gray-500 ml-1">θ:</span>
          <span className="text-yellow-400">
            {((robot.heading * 180) / Math.PI).toFixed(0)}°
          </span>
        </div>
      </div>
    </div>
  );
};

