import React, { useState } from 'react';
import { useSimulationStore } from '../../state/simulationStore';

export const GazeboMenuBar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const resetWorld = useSimulationStore((s) => s.resetWorld);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const toggleCollisionGeometry = useSimulationStore((s) => s.toggleCollisionGeometry);
  const showCollision = useSimulationStore((s) => s.showCollisionGeometry);
  const toggleTerminal = useSimulationStore((s) => s.toggleTerminal);
  const toggleTopicMonitor = useSimulationStore((s) => s.toggleTopicMonitor);
  const togglePracticals = useSimulationStore((s) => s.togglePracticals);

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const closeMenu = () => setActiveMenu(null);

  return (
    <div className="h-6 bg-[#3c3f41] border-b border-[#2b2b2b] text-[#dcdcdc] text-xs flex items-center px-1 select-none z-50">
      {/* Gazebo Classic Title badge */}
      <div className="flex items-center space-x-1 mr-3 text-[#ff9800] font-bold text-[11px] px-1 bg-[#2b2b2b] rounded">
        <span>GAZEBO</span>
        <span className="text-[#a0a0a0] font-normal">11.14</span>
      </div>

      {/* Menu Item: File */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('file')}
          className={`px-2 py-0.5 hover:bg-[#4b5054] rounded ${activeMenu === 'file' ? 'bg-[#4b5054]' : ''}`}
        >
          File
        </button>
        {activeMenu === 'file' && (
          <div
            className="absolute top-6 left-0 w-44 bg-[#3c3f41] border border-[#555] shadow-lg py-1 z-50 text-xs"
            onMouseLeave={closeMenu}
          >
            <button
              onClick={() => {
                resetWorld();
                closeMenu();
              }}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white"
            >
              New World
            </button>
            <button
              onClick={() => {
                resetSimulation();
                closeMenu();
              }}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white"
            >
              Reset World Poses
            </button>
            <div className="border-t border-[#555] my-1"></div>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white text-red-300"
            >
              Exit Simulation
            </button>
          </div>
        )}
      </div>

      {/* Menu Item: Edit */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('edit')}
          className={`px-2 py-0.5 hover:bg-[#4b5054] rounded ${activeMenu === 'edit' ? 'bg-[#4b5054]' : ''}`}
        >
          Edit
        </button>
        {activeMenu === 'edit' && (
          <div
            className="absolute top-6 left-0 w-48 bg-[#3c3f41] border border-[#555] shadow-lg py-1 z-50 text-xs"
            onMouseLeave={closeMenu}
          >
            <button
              onClick={() => {
                resetSimulation();
                closeMenu();
              }}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white"
            >
              Reset Model Poses (Ctrl+Shift+R)
            </button>
            <button
              onClick={() => {
                resetWorld();
                closeMenu();
              }}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white"
            >
              Reset World Simulation (Ctrl+R)
            </button>
          </div>
        )}
      </div>

      {/* Menu Item: View */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('view')}
          className={`px-2 py-0.5 hover:bg-[#4b5054] rounded ${activeMenu === 'view' ? 'bg-[#4b5054]' : ''}`}
        >
          View
        </button>
        {activeMenu === 'view' && (
          <div
            className="absolute top-6 left-0 w-44 bg-[#3c3f41] border border-[#555] shadow-lg py-1 z-50 text-xs"
            onMouseLeave={closeMenu}
          >
            <button
              onClick={() => {
                toggleCollisionGeometry();
                closeMenu();
              }}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white flex justify-between"
            >
              <span>Collisions</span>
              <span>{showCollision ? '✓' : ''}</span>
            </button>
            <button
              onClick={closeMenu}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white flex justify-between"
            >
              <span>Grid Floor</span>
              <span>✓</span>
            </button>
            <button
              onClick={closeMenu}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white flex justify-between"
            >
              <span>Shadows</span>
              <span>✓</span>
            </button>
          </div>
        )}
      </div>

      {/* Menu Item: Window */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('window')}
          className={`px-2 py-0.5 hover:bg-[#4b5054] rounded ${activeMenu === 'window' ? 'bg-[#4b5054]' : ''}`}
        >
          Window
        </button>
        {activeMenu === 'window' && (
          <div
            className="absolute top-6 left-0 w-48 bg-[#3c3f41] border border-[#555] shadow-lg py-1 z-50 text-xs"
            onMouseLeave={closeMenu}
          >
            <button
              onClick={() => {
                toggleTerminal();
                closeMenu();
              }}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white flex justify-between"
            >
              <span>ROS Terminal</span>
              <span className="text-[10px] text-gray-400">Ctrl+`</span>
            </button>
            <button
              onClick={() => {
                toggleTopicMonitor();
                closeMenu();
              }}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white"
            >
              ROS Topic Monitor
            </button>
            <button
              onClick={() => {
                togglePracticals();
                closeMenu();
              }}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white font-semibold text-[#ffb74d]"
            >
              TurtleBot3 Practicals (8 Labs)
            </button>
          </div>
        )}
      </div>

      {/* Menu Item: Help */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('help')}
          className={`px-2 py-0.5 hover:bg-[#4b5054] rounded ${activeMenu === 'help' ? 'bg-[#4b5054]' : ''}`}
        >
          Help
        </button>
        {activeMenu === 'help' && (
          <div
            className="absolute top-6 left-0 w-52 bg-[#3c3f41] border border-[#555] shadow-lg py-1 z-50 text-xs"
            onMouseLeave={closeMenu}
          >
            <div className="px-3 py-1 text-gray-400 text-[11px]">
              ROS Gazebo Classic 11.14
            </div>
            <div className="px-3 py-1 text-gray-400 text-[11px]">
              TurtleBot3 Burger Simulator
            </div>
          </div>
        )}
      </div>

      <div className="flex-1"></div>

      {/* Quick Launch Buttons for Terminal & Practicals */}
      <div className="flex items-center space-x-1 mr-2">
        <button
          onClick={togglePracticals}
          className="px-2 py-0.5 bg-[#d35400] hover:bg-[#e67e22] text-white rounded text-[11px] font-bold shadow-sm"
        >
          📚 TB3 Practicals (8 Labs)
        </button>
        <button
          onClick={toggleTerminal}
          className="px-2 py-0.5 bg-[#2c3e50] hover:bg-[#34495e] text-[#1abc9c] border border-[#16a085] rounded text-[11px] font-mono shadow-sm"
        >
          $ ROS Terminal
        </button>
        <button
          onClick={toggleTopicMonitor}
          className="px-2 py-0.5 bg-[#34495e] hover:bg-[#4a6278] text-[#ecf0f1] border border-[#555] rounded text-[11px] shadow-sm"
        >
          📡 /topics
        </button>
      </div>
    </div>
  );
};

