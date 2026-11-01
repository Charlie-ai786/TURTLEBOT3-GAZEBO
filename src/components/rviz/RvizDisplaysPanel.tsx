import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Copy,
  Info,
} from 'lucide-react';
import { useSimulationStore, RvizDisplaySettings } from '../../state/simulationStore';

export const RvizDisplaysPanel: React.FC = () => {
  const displays = useSimulationStore((s) => s.rvizDisplays);
  const toggleDisplay = useSimulationStore((s) => s.toggleDisplay);
  const updateDisplaySetting = useSimulationStore((s) => s.updateDisplaySetting);
  const fixedFrame = useSimulationStore((s) => s.fixedFrame);
  const setFixedFrame = useSimulationStore((s) => s.setFixedFrame);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    globalOptions: true,
    grid: false,
    robotModel: false,
    tf: false,
    laserScan: true,
    map: true,
    globalCostmap: false,
    localCostmap: false,
    path: true,
    trajectory: false,
  });

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-72 bg-[#262626] border-r border-[#1a1a1a] text-[#cccccc] flex flex-col text-xs select-none h-full">
      {/* Panel Header */}
      <div className="px-3 py-1.5 bg-[#333333] border-b border-[#1f1f1f] font-semibold text-[11px] text-white flex items-center justify-between">
        <span>Displays</span>
        <span className="text-[10px] text-gray-400 font-normal">rviz/default.rviz</span>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {/* 1. Global Options */}
        <div className="border border-[#383838] rounded bg-[#2b2b2b]">
          <div
            onClick={() => toggleExpand('globalOptions')}
            className="flex items-center space-x-1.5 px-2 py-1 cursor-pointer hover:bg-[#383838] font-semibold text-white"
          >
            {expanded.globalOptions ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>Global Options</span>
          </div>

          {expanded.globalOptions && (
            <div className="pl-6 pr-2 py-1 space-y-1.5 border-t border-[#383838] text-[11px] bg-[#222222]">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Fixed Frame:</span>
                <select
                  value={fixedFrame}
                  onChange={(e) => setFixedFrame(e.target.value)}
                  className="bg-[#333] text-white border border-[#555] rounded px-1 py-0.5 text-[10px] focus:outline-none"
                >
                  <option value="map">map</option>
                  <option value="odom">odom</option>
                  <option value="base_footprint">base_footprint</option>
                  <option value="base_link">base_link</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Background:</span>
                <span className="text-gray-300 font-mono">#1a1e24</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Grid Display */}
        <div className="border border-[#383838] rounded bg-[#2b2b2b]">
          <div className="flex items-center justify-between px-2 py-1 hover:bg-[#383838]">
            <div className="flex items-center space-x-1.5">
              <button onClick={() => toggleExpand('grid')} className="text-gray-400 hover:text-white">
                {expanded.grid ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <button onClick={() => toggleDisplay('grid')} className="text-gray-300 hover:text-white">
                {displays.grid.visible ? <CheckSquare size={13} className="text-[#3498db]" /> : <Square size={13} />}
              </button>
              <span className="font-medium text-white">Grid</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Status: Ok"></span>
          </div>

          {expanded.grid && (
            <div className="pl-6 pr-2 py-1 space-y-1 border-t border-[#383838] text-[11px] bg-[#222222]">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Cell Size:</span>
                <span className="text-gray-300 font-mono">1.0 m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Plane Cell Count:</span>
                <span className="text-gray-300 font-mono">30 x 30</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. RobotModel Display */}
        <div className="border border-[#383838] rounded bg-[#2b2b2b]">
          <div className="flex items-center justify-between px-2 py-1 hover:bg-[#383838]">
            <div className="flex items-center space-x-1.5">
              <button onClick={() => toggleExpand('robotModel')} className="text-gray-400 hover:text-white">
                {expanded.robotModel ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <button onClick={() => toggleDisplay('robotModel')} className="text-gray-300 hover:text-white">
                {displays.robotModel.visible ? <CheckSquare size={13} className="text-[#3498db]" /> : <Square size={13} />}
              </button>
              <span className="font-medium text-white">RobotModel</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Status: Ok"></span>
          </div>

          {expanded.robotModel && (
            <div className="pl-6 pr-2 py-1 space-y-1 border-t border-[#383838] text-[11px] bg-[#222222]">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Robot Description:</span>
                <span className="text-gray-300">robot_description</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Alpha:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={displays.robotModel.alpha}
                  onChange={(e) => updateDisplaySetting('robotModel', 'alpha', parseFloat(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. TF Display */}
        <div className="border border-[#383838] rounded bg-[#2b2b2b]">
          <div className="flex items-center justify-between px-2 py-1 hover:bg-[#383838]">
            <div className="flex items-center space-x-1.5">
              <button onClick={() => toggleExpand('tf')} className="text-gray-400 hover:text-white">
                {expanded.tf ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <button onClick={() => toggleDisplay('tf')} className="text-gray-300 hover:text-white">
                {displays.tf.visible ? <CheckSquare size={13} className="text-[#3498db]" /> : <Square size={13} />}
              </button>
              <span className="font-medium text-white">TF (Transforms)</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Status: Ok"></span>
          </div>

          {expanded.tf && (
            <div className="pl-6 pr-2 py-1 space-y-1 border-t border-[#383838] text-[11px] bg-[#222222]">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Show Axes:</span>
                <input
                  type="checkbox"
                  checked={displays.tf.showAxes}
                  onChange={(e) => updateDisplaySetting('tf', 'showAxes', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Show Names:</span>
                <input
                  type="checkbox"
                  checked={displays.tf.showNames}
                  onChange={(e) => updateDisplaySetting('tf', 'showNames', e.target.checked)}
                />
              </div>
              <div className="text-[10px] text-gray-500">
                Frames: map, odom, base_link, base_scan
              </div>
            </div>
          )}
        </div>

        {/* 5. LaserScan Display */}
        <div className="border border-[#383838] rounded bg-[#2b2b2b]">
          <div className="flex items-center justify-between px-2 py-1 hover:bg-[#383838]">
            <div className="flex items-center space-x-1.5">
              <button onClick={() => toggleExpand('laserScan')} className="text-gray-400 hover:text-white">
                {expanded.laserScan ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <button onClick={() => toggleDisplay('laserScan')} className="text-gray-300 hover:text-white">
                {displays.laserScan.visible ? <CheckSquare size={13} className="text-[#3498db]" /> : <Square size={13} />}
              </button>
              <span className="font-medium text-white">LaserScan</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Status: Ok"></span>
          </div>

          {expanded.laserScan && (
            <div className="pl-6 pr-2 py-1 space-y-1.5 border-t border-[#383838] text-[11px] bg-[#222222]">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Topic:</span>
                <span className="text-emerald-400 font-mono text-[10px]">/scan</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Point Size:</span>
                <input
                  type="range"
                  min="0.02"
                  max="0.10"
                  step="0.01"
                  value={displays.laserScan.pointSize}
                  onChange={(e) => updateDisplaySetting('laserScan', 'pointSize', parseFloat(e.target.value))}
                  className="w-20"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Color Mode:</span>
                <select
                  value={displays.laserScan.colorMode}
                  onChange={(e) => updateDisplaySetting('laserScan', 'colorMode', e.target.value as any)}
                  className="bg-[#333] text-white border border-[#555] rounded px-1 py-0.5 text-[10px]"
                >
                  <option value="distance">Distance Rainbow</option>
                  <option value="intensity">Intensity</option>
                  <option value="flat">Flat Red</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 6. Map Display (Occupancy Grid) */}
        <div className="border border-[#383838] rounded bg-[#2b2b2b]">
          <div className="flex items-center justify-between px-2 py-1 hover:bg-[#383838]">
            <div className="flex items-center space-x-1.5">
              <button onClick={() => toggleExpand('map')} className="text-gray-400 hover:text-white">
                {expanded.map ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <button onClick={() => toggleDisplay('map')} className="text-gray-300 hover:text-white">
                {displays.map.visible ? <CheckSquare size={13} className="text-[#3498db]" /> : <Square size={13} />}
              </button>
              <span className="font-medium text-white">Map (OccupancyGrid)</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Status: Ok"></span>
          </div>

          {expanded.map && (
            <div className="pl-6 pr-2 py-1 space-y-1.5 border-t border-[#383838] text-[11px] bg-[#222222]">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Topic:</span>
                <span className="text-emerald-400 font-mono text-[10px]">/map</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Alpha:</span>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={displays.map.alpha}
                  onChange={(e) => updateDisplaySetting('map', 'alpha', parseFloat(e.target.value))}
                  className="w-20"
                />
              </div>
              <div className="text-[10px] text-gray-500">
                Resolution: 0.05 m/cell (200x200)
              </div>
            </div>
          )}
        </div>

        {/* 7. Global Costmap Display */}
        <div className="border border-[#383838] rounded bg-[#2b2b2b]">
          <div className="flex items-center justify-between px-2 py-1 hover:bg-[#383838]">
            <div className="flex items-center space-x-1.5">
              <button onClick={() => toggleExpand('globalCostmap')} className="text-gray-400 hover:text-white">
                {expanded.globalCostmap ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <button onClick={() => toggleDisplay('globalCostmap')} className="text-gray-300 hover:text-white">
                {displays.globalCostmap.visible ? <CheckSquare size={13} className="text-[#3498db]" /> : <Square size={13} />}
              </button>
              <span className="font-medium text-white">Global Costmap</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Status: Ok"></span>
          </div>

          {expanded.globalCostmap && (
            <div className="pl-6 pr-2 py-1 space-y-1 border-t border-[#383838] text-[11px] bg-[#222222]">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Inflation Radius:</span>
                <span className="text-gray-300 font-mono">0.35 m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Cost Decay:</span>
                <span className="text-gray-300">Exponential</span>
              </div>
            </div>
          )}
        </div>

        {/* 8. Path Display (Global Navigation Path) */}
        <div className="border border-[#383838] rounded bg-[#2b2b2b]">
          <div className="flex items-center justify-between px-2 py-1 hover:bg-[#383838]">
            <div className="flex items-center space-x-1.5">
              <button onClick={() => toggleExpand('path')} className="text-gray-400 hover:text-white">
                {expanded.path ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <button onClick={() => toggleDisplay('path')} className="text-gray-300 hover:text-white">
                {displays.path.visible ? <CheckSquare size={13} className="text-[#3498db]" /> : <Square size={13} />}
              </button>
              <span className="font-medium text-white">Path (A* Global Plan)</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Status: Ok"></span>
          </div>

          {expanded.path && (
            <div className="pl-6 pr-2 py-1 space-y-1.5 border-t border-[#383838] text-[11px] bg-[#222222]">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Topic:</span>
                <span className="text-emerald-400 font-mono text-[10px]">/move_base/GlobalPlanner/plan</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Color:</span>
                <span className="w-4 h-4 rounded" style={{ backgroundColor: displays.path.color }}></span>
              </div>
            </div>
          )}
        </div>

        {/* 9. Trajectory History */}
        <div className="border border-[#383838] rounded bg-[#2b2b2b]">
          <div className="flex items-center justify-between px-2 py-1 hover:bg-[#383838]">
            <div className="flex items-center space-x-1.5">
              <button onClick={() => toggleExpand('trajectory')} className="text-gray-400 hover:text-white">
                {expanded.trajectory ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <button onClick={() => toggleDisplay('trajectory')} className="text-gray-300 hover:text-white">
                {displays.trajectory.visible ? <CheckSquare size={13} className="text-[#3498db]" /> : <Square size={13} />}
              </button>
              <span className="font-medium text-white">Odometry Trajectory</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Status: Ok"></span>
          </div>

          {expanded.trajectory && (
            <div className="pl-6 pr-2 py-1 space-y-1 border-t border-[#383838] text-[11px] bg-[#222222]">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Max Points:</span>
                <span className="text-gray-300 font-mono">400</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Classic RViz bottom buttons */}
      <div className="p-2 bg-[#1f1f1f] border-t border-[#333] flex items-center justify-between space-x-1 text-[11px]">
        <button className="flex-1 py-1 bg-[#383838] hover:bg-[#484848] text-gray-200 rounded flex items-center justify-center space-x-1">
          <Plus size={11} />
          <span>Add</span>
        </button>
        <button className="flex-1 py-1 bg-[#383838] hover:bg-[#484848] text-gray-200 rounded flex items-center justify-center space-x-1">
          <Copy size={11} />
          <span>Duplicate</span>
        </button>
        <button className="flex-1 py-1 bg-[#383838] hover:bg-[#484848] text-gray-200 rounded flex items-center justify-center space-x-1">
          <Trash2 size={11} />
          <span>Remove</span>
        </button>
      </div>
    </div>
  );
};

