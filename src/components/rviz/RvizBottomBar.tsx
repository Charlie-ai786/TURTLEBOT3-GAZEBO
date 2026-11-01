import React from 'react';
import { useSimulationStore } from '../../state/simulationStore';
import { CheckCircle2, Navigation } from 'lucide-react';

export const RvizBottomBar: React.FC = () => {
  const simTime = useSimulationStore((s) => s.simTime);
  const fixedFrame = useSimulationStore((s) => s.fixedFrame);
  const navigation = useSimulationStore((s) => s.navigation);
  const robot = useSimulationStore((s) => s.robot);
  const scanData = useSimulationStore((s) => s.scanData);

  return (
    <div className="h-6 bg-[#1f1f1f] border-t border-[#111] text-[#a0a0a0] flex items-center px-3 text-[11px] font-mono justify-between select-none">
      {/* Left: Overall ROS/RViz status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1 text-emerald-400">
          <CheckCircle2 size={12} />
          <span className="font-semibold text-white">Status:</span>
          <span>Ok</span>
        </div>
        <div className="text-gray-600">|</div>
        <div>
          <span>Fixed Frame: </span>
          <span className="text-cyan-400">{fixedFrame}</span>
        </div>
        <div className="text-gray-600">|</div>
        <div>
          <span>Target: </span>
          <span className="text-gray-300">base_link</span>
        </div>
        <div className="text-gray-600">|</div>
        <div>
          <span>LDS-01: </span>
          <span className="text-yellow-400">{scanData ? `${scanData.scanFrequency.toFixed(1)} Hz` : '0 Hz'}</span>
        </div>
      </div>

      {/* Center: Navigation Status (if active) */}
      {navigation.goal && navigation.goal.active && (
        <div className="flex items-center space-x-1.5 text-sky-400 bg-sky-950/70 px-2 py-0.5 rounded border border-sky-800 text-[10px]">
          <Navigation size={11} className="animate-spin" />
          <span>
            NAV STATUS: {navigation.status.toUpperCase()} (Dist: {navigation.distanceToGoal.toFixed(2)}m)
          </span>
        </div>
      )}

      {/* Right: ROS Time & Wall FPS */}
      <div className="flex items-center space-x-3">
        <div>
          <span>ROS Time: </span>
          <span className="text-[#00e676]">{simTime.toFixed(2)}s</span>
        </div>
        <div className="text-gray-600">|</div>
        <div>
          <span>Wall Time: </span>
          <span className="text-gray-300">{(simTime * 1.002).toFixed(2)}s</span>
        </div>
        <div className="text-gray-600">|</div>
        <div>
          <span>Wall FPS: </span>
          <span className="text-white">60</span>
        </div>
      </div>
    </div>
  );
};

