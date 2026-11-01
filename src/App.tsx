import React, { useEffect } from 'react';
import { useSimulationStore } from './state/simulationStore';
import { useKeyboardTeleop } from './robot/controllers/teleopController';
import { TopNavigation } from './components/common/TopNavigation';
import { GazeboWorkspace } from './components/gazebo/GazeboWorkspace';
import { RvizWorkspace } from './components/rviz/RvizWorkspace';
import { CombinedWorkspace } from './components/common/CombinedWorkspace';
import { TeleopHud } from './components/common/TeleopHud';
import { TerminalWindow } from './terminal/components/TerminalWindow';
import { PracticalsPanel } from './components/learning/PracticalsPanel';
import { TopicMonitorModal } from './components/common/TopicMonitorModal';
import { SettingsModal } from './components/common/SettingsModal';

export function App() {
  const workspaceMode = useSimulationStore((s) => s.workspaceMode);
  const isTerminalOpen = useSimulationStore((s) => s.isTerminalOpen);
  const tick = useSimulationStore((s) => s.tick);

  useKeyboardTeleop();

  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const handleVisibilityChange = () => {
      lastTime = performance.now();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const simLoop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = rawDt > 0.1 ? 0.016 : rawDt;
      tick(dt);
      frameId = requestAnimationFrame(simLoop);
    };
    frameId = requestAnimationFrame(simLoop);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tick]);

  return (
    /*
     * Root shell: full-viewport flex column.
     * Children:
     *   1. TopNavigation  – fixed height, flex-shrink-0
     *   2. Workspace      – flex-1, min-h-0  (fills remaining space exactly)
     *   3. TerminalWindow – in-flow flex child, its own height drives shrink
     *
     * NO position:fixed on the terminal. NO paddingBottom on the workspace.
     * This is the only layout that guarantees the R3F canvas always fills its
     * parent with zero gaps regardless of terminal height.
     */
    <div
      className="flex flex-col bg-[#121214] text-white overflow-hidden select-none"
      style={{ width: '100vw', height: '100dvh' }}
    >
      {/* ① Navigation – never shrinks */}
      <TopNavigation />

      {/* ② Workspace – absorbs ALL remaining vertical space */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {workspaceMode === 'gazebo' && <GazeboWorkspace />}
        {workspaceMode === 'rviz' && <RvizWorkspace />}
        {workspaceMode === 'combined' && <CombinedWorkspace />}
      </div>

      {/* ③ Terminal – in-flow, height controlled by TerminalWindow itself */}
      {isTerminalOpen && <TerminalWindow />}

      {/* Floating overlays (do NOT affect layout) */}
      <TeleopHud />
      <PracticalsPanel />
      <TopicMonitorModal />
      <SettingsModal />
    </div>
  );
}

export default App;
