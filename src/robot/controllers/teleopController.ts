import { useEffect } from 'react';
import { useSimulationStore } from '../../state/simulationStore';

export function useKeyboardTeleop() {
  const setTeleopVelocity = useSimulationStore((s) => s.setTeleopVelocity);
  const emergencyStop = useSimulationStore((s) => s.emergencyStop);
  const isTerminalOpen = useSimulationStore((s) => s.isTerminalOpen);
  const isPracticalsOpen = useSimulationStore((s) => s.isPracticalsOpen);
  const isTopicMonitorOpen = useSimulationStore((s) => s.isTopicMonitorOpen);
  const isSettingsOpen = useSimulationStore((s) => s.isSettingsOpen);
  const isPaused = useSimulationStore((s) => s.isPaused);

  useEffect(() => {
    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in terminal or an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        isTerminalOpen ||
        isPracticalsOpen ||
        isTopicMonitorOpen ||
        isSettingsOpen
      ) {
        return;
      }

      // If simulation is paused, ignore drive commands
      if (isPaused && e.key.toLowerCase() !== ' ') {
        return;
      }

      const key = e.key.toLowerCase();
      if (
        ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(
          key
        )
      ) {
        keysPressed[key] = true;
        updateVelocities();
        // Prevent page scroll on arrow/space
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keysPressed[key]) {
        keysPressed[key] = false;
        updateVelocities();
      }
    };

    const updateVelocities = () => {
      if (keysPressed[' ']) {
        emergencyStop();
        return;
      }

      let lin = 0;
      let ang = 0;

      if (keysPressed['w'] || keysPressed['arrowup']) lin += 0.22;
      if (keysPressed['s'] || keysPressed['arrowdown']) lin -= 0.22;
      if (keysPressed['a'] || keysPressed['arrowleft']) ang += 1.82;
      if (keysPressed['d'] || keysPressed['arrowright']) ang -= 1.82;

      setTeleopVelocity(lin, ang);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setTeleopVelocity, emergencyStop, isTerminalOpen, isPracticalsOpen, isTopicMonitorOpen, isSettingsOpen, isPaused]);
}
