import React from 'react';
import { GazeboWorkspace } from '../gazebo/GazeboWorkspace';
import { RvizWorkspace } from '../rviz/RvizWorkspace';

export const CombinedWorkspace: React.FC = () => {
  return (
    <div className="flex w-full h-full bg-[#181818] overflow-hidden">
      {/* Left Pane: Gazebo Simulation */}
      <div className="flex-1 flex flex-col h-full border-r-2 border-[#111] relative overflow-hidden">
        <div className="h-6 bg-[#333] border-b border-[#222] text-[#ff9800] px-3 flex items-center justify-between text-xs font-bold">
          <span>GAZEBO CLASSIC 11 — PHYSICAL SIMULATION</span>
          <span className="text-[10px] text-gray-300 font-normal">Interactive 3D Dynamics</span>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <GazeboWorkspace />
        </div>
      </div>

      {/* Right Pane: RViz Visualization */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <div className="h-6 bg-[#252525] border-b border-[#111] text-[#e74c3c] px-3 flex items-center justify-between text-xs font-bold">
          <span>RVIZ (ROS NOETIC) — SENSOR & NAVIGATION VISUALIZER</span>
          <span className="text-[10px] text-gray-300 font-normal">LiDAR / Map / Costmap / TF</span>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <RvizWorkspace />
        </div>
      </div>
    </div>
  );
};

