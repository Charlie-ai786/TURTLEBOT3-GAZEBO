import React from 'react';
import {
  Boxes,
  Eye,
  Columns,
  Terminal,
  BookOpen,
  Activity,
  Gauge,
  RotateCcw,
} from 'lucide-react';
import { useSimulationStore } from '../../state/simulationStore';
import { WorkspaceMode } from '../../types/simulation';

export const TopNavigation: React.FC = () => {
  const workspaceMode = useSimulationStore((s) => s.workspaceMode);
  const setWorkspaceMode = useSimulationStore((s) => s.setWorkspaceMode);
  const toggleTerminal = useSimulationStore((s) => s.toggleTerminal);
  const togglePracticals = useSimulationStore((s) => s.togglePracticals);
  const toggleTopicMonitor = useSimulationStore((s) => s.toggleTopicMonitor);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);

  const tabs: Array<{ id: WorkspaceMode; label: string; icon: React.ComponentType<any> }> = [
    { id: 'gazebo', label: 'Gazebo Simulator', icon: Boxes },
    { id: 'rviz', label: 'RViz Visualization', icon: Eye },
    { id: 'combined', label: 'Combined View', icon: Columns },
  ];

  return (
    <div className="h-9 bg-[#18191c] border-b border-[#28292d] text-[#e0e0e0] flex items-center justify-between px-3 text-xs select-none z-50">
      {/* App Branding */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 font-bold tracking-tight text-white text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e67e22] animate-pulse"></span>
          <span>TurtleBot3</span>
          <span className="text-[#a0a0a0] font-normal">Gazebo & RViz Suite</span>
        </div>
      </div>

      {/* Central Workspace Switcher Tabs */}
      <div className="flex items-center bg-[#25262b] p-0.5 rounded-lg border border-[#35363c]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = workspaceMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setWorkspaceMode(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#3498db] text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-[#2e3037]'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Shortcut Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={togglePracticals}
          className="flex items-center space-x-1 px-2.5 py-1 bg-[#d35400] hover:bg-[#e67e22] text-white font-bold rounded shadow-sm text-xs"
        >
          <BookOpen size={13} />
          <span>8 Practicals</span>
        </button>

        <button
          onClick={toggleTerminal}
          className="flex items-center space-x-1 px-2.5 py-1 bg-[#2c3e50] hover:bg-[#34495e] text-[#1abc9c] border border-[#16a085] rounded font-mono shadow-sm text-xs font-bold"
        >
          <Terminal size={13} />
          <span>ROS Terminal</span>
        </button>

        <button
          onClick={toggleTopicMonitor}
          className="flex items-center space-x-1 px-2 py-1 bg-[#2b2d35] hover:bg-[#383a45] text-gray-300 border border-[#444] rounded text-xs"
        >
          <Activity size={13} className="text-cyan-400" />
          <span>Topics</span>
        </button>
      </div>
    </div>
  );
};

