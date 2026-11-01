import React, { useEffect } from 'react';
import { useSimulationStore } from './state/simulationStore';
import { useKeyboardTeleop } from './robot/controllers/teleopController';
import { TopNavigation } from './components/common/TopNavigation';
import { GazeboWorkspace } from './components/gazebo/GazeboWorkspace';
import { RvizWorkspace } from './components/rviz/RvizWorkspace';
import { CombinedWorkspace } from './components/common/CombinedWorkspace';
import { TeleopHud } from './components/common/TeleopHud';
import { RosTerminal } from './components/terminal/RosTerminal';
import { PracticalsPanel } from './components/learning/PracticalsPanel';
import { TopicMonitorModal } from './components/common/TopicMonitorModal';

export function App() {
  const workspaceMode = useSimulationStore((s) => s.workspaceMode);
  const tick = useSimulationStore((s) => s.tick);

  // Activate keyboard teleoperation (W/A/S/D, Arrows, Space)
  useKeyboardTeleop();

  // High-performance fixed/adaptive simulation update loop (60 FPS)
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const simLoop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Advance physics, raycasting LiDAR, SLAM mapping, and navigation controllers
      tick(dt);

      frameId = requestAnimationFrame(simLoop);
    };

    frameId = requestAnimationFrame(simLoop);
    return () => cancelAnimationFrame(frameId);
  }, [tick]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#121214] text-white overflow-hidden select-none">
      {/* 1. Global Navigation Bar */}
      <TopNavigation />

      {/* 2. Active Workspace Router */}
      <div className="flex-1 relative overflow-hidden">
        {workspaceMode === 'gazebo' && <GazeboWorkspace />}
        {workspaceMode === 'rviz' && <RvizWorkspace />}
        {workspaceMode === 'combined' && <CombinedWorkspace />}
      </div>

      {/* 3. Floating Overlays & Utilities */}
      <TeleopHud />
      <RosTerminal />
      <PracticalsPanel />
      <TopicMonitorModal />
    </div>
  );
}

export default App;
