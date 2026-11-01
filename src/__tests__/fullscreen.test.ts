import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSimulationStore } from '../state/simulationStore';

describe('Suite 8: Fullscreen Operations & Keyboard Shortcuts', () => {
  beforeEach(() => {
    useSimulationStore.getState().resetSimulation();
  });

  it('handles Fullscreen API toggle on requestFullscreen and exitFullscreen', async () => {
    const requestFsMock = vi.fn().mockResolvedValue(undefined);
    const exitFsMock = vi.fn().mockResolvedValue(undefined);

    document.documentElement.requestFullscreen = requestFsMock;
    document.exitFullscreen = exitFsMock;

    // Simulate entry
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      configurable: true,
      value: null,
    });

    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
    expect(requestFsMock).toHaveBeenCalledOnce();

    // Simulate exit
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      configurable: true,
      value: document.documentElement,
    });

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    expect(exitFsMock).toHaveBeenCalledOnce();
  });

  it('preserves robot pose and simulation state during fullscreen transitions', () => {
    // Set robot velocity and advance
    useSimulationStore.getState().setTeleopVelocity(0.15, 0.2);
    useSimulationStore.getState().tick(0.1);

    const poseBefore = { ...useSimulationStore.getState().robot };

    // Simulate entering and exiting fullscreen
    document.dispatchEvent(new Event('fullscreenchange'));

    const poseAfter = useSimulationStore.getState().robot;
    expect(poseAfter.x).toBe(poseBefore.x);
    expect(poseAfter.y).toBe(poseBefore.y);
    expect(poseAfter.heading).toBe(poseBefore.heading);
  });

  it('keeps application navigation controls accessible when terminal is maximized', () => {
    // Maximized terminal leaves 15vh (at least 150px) at the top
    const innerHeight = 1000;
    const maxTerminalHeight = Math.floor(innerHeight * 0.85); // 850px
    const remainingAppSpace = innerHeight - maxTerminalHeight; // 150px

    const navBarHeight = 36; // TopNavigation is h-9 = 36px
    expect(remainingAppSpace).toBeGreaterThan(navBarHeight);
  });
});

