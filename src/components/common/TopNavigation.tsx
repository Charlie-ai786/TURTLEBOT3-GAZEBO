import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Eye,
  Columns,
  Terminal,
  BookOpen,
  Activity,
  Play,
  Pause,
  Square,
  RotateCcw,
  Maximize,
  Minimize,
  Settings,
} from 'lucide-react';
import { useSimulationStore } from '../../state/simulationStore';
import { WorkspaceMode } from '../../types/simulation';

export const TopNavigation: React.FC = () => {
  const workspaceMode = useSimulationStore((s) => s.workspaceMode);
  const setWorkspaceMode = useSimulationStore((s) => s.setWorkspaceMode);
  const isPaused = useSimulationStore((s) => s.isPaused);
  const togglePause = useSimulationStore((s) => s.togglePause);
  const emergencyStop = useSimulationStore((s) => s.emergencyStop);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const simSpeed = useSimulationStore((s) => s.simSpeed);
  const setSimSpeed = useSimulationStore((s) => s.setSimSpeed);
  const toggleTerminal = useSimulationStore((s) => s.toggleTerminal);
  const togglePracticals = useSimulationStore((s) => s.togglePracticals);
  const toggleTopicMonitor = useSimulationStore((s) => s.toggleTopicMonitor);
  const toggleSettings = useSimulationStore((s) => s.toggleSettings);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const tabs: Array<{ id: WorkspaceMode; label: string; icon: React.ComponentType<any> }> = [
    { id: 'gazebo', label: 'Gazebo Simulator', icon: Boxes },
    { id: 'rviz', label: 'RViz Visualization', icon: Eye },
    { id: 'combined', label: 'Combined View', icon: Columns },
  ];

  return (
    <div className="h-9 bg-[#18191c] border-b border-[#28292d] text-[#e0e0e0] flex items-center justify-between px-3 text-xs select-none z-50">
      {/* 1. App Branding & Simulation Play/Pause/Stop/Reset */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 font-bold tracking-tight text-white text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e67e22] animate-pulse"></span>
          <span>TurtleBot3</span>
          <span className="text-[#a0a0a0] font-normal hidden sm:inline">Suite</span>
        </div>

        {/* Global Simulation Master Controls */}
        <div className="flex items-center space-x-1 bg-[#25262b] p-0.5 rounded border border-[#35363c]">
          <button
            onClick={togglePause}
            title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            className={`p-1 rounded flex items-center justify-center ${
              isPaused ? 'bg-[#27ae60] text-white' : 'bg-[#e74c3c] text-white'
            }`}
          >
            {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
          </button>

          <button
            onClick={emergencyStop}
            title="Stop Robot (v=0, ω=0)"
            className="p-1 rounded hover:bg-[#3e4048] text-amber-300"
          >
            <Square size={12} fill="currentColor" />
          </button>

          <button
            onClick={resetSimulation}
            title="Reset Simulation Poses"
            className="p-1 rounded hover:bg-[#3e4048] text-gray-300"
          >
            <RotateCcw size={12} />
          </button>

          {/* Speed Selector */}
          <select
            value={simSpeed}
            onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
            className="bg-[#1e1f23] text-white border border-[#444] rounded px-1 py-0.5 text-[10px] focus:outline-none"
            title="Simulation Speed Multiplier"
          >
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="1.0">1.0x</option>
            <option value="2.0">2.0x</option>
            <option value="4.0">4.0x</option>
          </select>
        </div>
      </div>

      {/* 2. Central Workspace Switcher Tabs */}
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

      {/* 3. Utility Modals, Fullscreen & Settings */}
      <div className="flex items-center space-x-1.5">
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
          title="ROS Topics Inspector"
        >
          <Activity size={13} className="text-cyan-400" />
          <span className="hidden sm:inline">Topics</span>
        </button>

        <div className="h-4 w-[1px] bg-[#3a3a40]"></div>

        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-1.5 hover:bg-[#2e3037] rounded text-gray-300 hover:text-white"
        >
          {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
        </button>

        {/* Settings Button */}
        <button
          onClick={toggleSettings}
          title="Simulation & Graphics Settings"
          className="p-1.5 hover:bg-[#2e3037] rounded text-gray-300 hover:text-white"
        >
          <Settings size={13} />
        </button>
      </div>
    </div>
  );
};
