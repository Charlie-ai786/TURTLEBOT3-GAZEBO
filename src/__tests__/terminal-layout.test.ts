import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTerminalLayout } from '../terminal/hooks/useTerminalLayout';

describe('Suite 6: VS Code-Style Terminal Layout & Resizing', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock window.innerHeight = 1000px so 85vh = 850px
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1000 });
  });

  it('initializes with default height of 350px and normal panelState', () => {
    const { result } = renderHook(() => useTerminalLayout());
    expect(result.current.layout.height).toBe(350);
    expect(result.current.layout.panelState).toBe('normal');
  });

  it('enforces minimum height of 150px when resizing downward', () => {
    const { result } = renderHook(() => useTerminalLayout());
    act(() => {
      result.current.setHeight(80); // Below 150px min
    });
    expect(result.current.layout.height).toBe(150);
  });

  it('enforces maximum height of 85vh (850px at innerHeight=1000)', () => {
    const { result } = renderHook(() => useTerminalLayout());
    act(() => {
      result.current.setHeight(950); // Above 850px max
    });
    expect(result.current.layout.height).toBe(850);
  });

  it('maximizes terminal and restores to exact previous height', () => {
    const { result } = renderHook(() => useTerminalLayout());

    // 1. Set custom height of 400px
    act(() => {
      result.current.setHeight(400);
    });
    expect(result.current.layout.height).toBe(400);

    // 2. Maximize
    act(() => {
      result.current.maximize();
    });
    expect(result.current.layout.panelState).toBe('maximized');
    expect(result.current.layout.height).toBe(850); // 85vh

    // 3. Restore
    act(() => {
      result.current.restore();
    });
    expect(result.current.layout.panelState).toBe('normal');
    expect(result.current.layout.height).toBe(400); // Exact previous height!
  });

  it('minimizes terminal and restores previous height', () => {
    const { result } = renderHook(() => useTerminalLayout());

    act(() => {
      result.current.setHeight(320);
    });

    // Minimize
    act(() => {
      result.current.minimize();
    });
    expect(result.current.layout.panelState).toBe('minimized');
    expect(result.current.layout.previousHeight).toBe(320);

    // Restore
    act(() => {
      result.current.restore();
    });
    expect(result.current.layout.panelState).toBe('normal');
    expect(result.current.layout.height).toBe(320);
  });

  it('persists layout dimensions and panel state to localStorage', () => {
    const { result } = renderHook(() => useTerminalLayout());

    act(() => {
      result.current.setHeight(480);
    });

    const stored = JSON.parse(localStorage.getItem('ros_terminal_layout') || '{}');
    expect(stored.height).toBe(480);
    expect(stored.panelState).toBe('normal');
  });
});

