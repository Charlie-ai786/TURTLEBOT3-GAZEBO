import React, { useState } from 'react';
import { useSimulationStore } from '../../state/simulationStore';

export const GazeboMenuBar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const resetWorld = useSimulationStore((s) => s.resetWorld);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const toggleCollisionGeometry = useSimulationStore((s) => s.toggleCollisionGeometry);
  const showCollision = useSimulationStore((s) => s.showCollisionGeometry);
  const showGridFloor = useSimulationStore((s) => s.showGridFloor);
  const toggleGridFloor = useSimulationStore((s) => s.toggleGridFloor);
  const showShadows = useSimulationStore((s) => s.showShadows);
  const toggleShadows = useSimulationStore((s) => s.toggleShadows);
  const toggleTerminal = useSimulationStore((s) => s.toggleTerminal);
  const toggleTopicMonitor = useSimulationStore((s) => s.toggleTopicMonitor);
  const togglePracticals = useSimulationStore((s) => s.togglePracticals);
  const toggleSettings = useSimulationStore((s) => s.toggleSettings);

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
              Reset Model Poses
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
            <div className="border-t border-[#555] my-1"></div>
            <button
              onClick={() => {
                toggleSettings();
                closeMenu();
              }}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white"
            >
              Preferences / Settings
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
              onClick={() => {
                toggleGridFloor();
                closeMenu();
              }}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white flex justify-between"
            >
              <span>Grid Floor</span>
              <span>{showGridFloor ? '✓' : ''}</span>
            </button>
            <button
              onClick={() => {
                toggleShadows();
                closeMenu();
              }}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white flex justify-between"
            >
              <span>Shadows</span>
              <span>{showShadows ? '✓' : ''}</span>
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
            <button
              onClick={() => {
                setShowAboutModal(true);
                closeMenu();
              }}
              className="w-full text-left px-3 py-1 hover:bg-[#2c5282] hover:text-white"
            >
              About Gazebo Classic & TurtleBot3
            </button>
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

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#24252a] border border-[#444] rounded-lg p-5 w-96 text-gray-200 space-y-3 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span className="text-[#ff9800]">Gazebo Classic 11.14</span>
              <span className="text-xs text-gray-400 font-normal">Browser Recreation</span>
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              This application faithfully reproduces the Gazebo Classic 11 physics simulation environment and the ROS Noetic RViz sensor visualizer for the TurtleBot3 Burger mobile robot.
            </p>
            <div className="text-[11px] text-gray-400 space-y-1 bg-[#1a1b1f] p-2.5 rounded border border-[#333]">
              <div>• Kinematics: Differential Drive (2x DYNAMIXEL XL430)</div>
              <div>• Sensors: LDS-01 360° LiDAR, Odometry, IMU</div>
              <div>• Mapping: 2D Occupancy Grid SLAM</div>
              <div>• Navigation: A* Global Planner + Local Costmaps</div>
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-1.5 bg-[#2980b9] hover:bg-[#3498db] text-white rounded font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
