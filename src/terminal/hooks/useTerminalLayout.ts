import { useState, useCallback, useRef, useEffect } from 'react';

export type TerminalPanelState = 'normal' | 'minimized' | 'maximized';

export interface TerminalLayout {
  height: number;
  width: number;
  panelState: TerminalPanelState;
  previousHeight: number;
}

const STORAGE_KEY = 'ros_terminal_layout';
const DEFAULT_HEIGHT = 350;
const MIN_HEIGHT = 150;
const MAX_HEIGHT_VH = 0.85;
const DEFAULT_WIDTH_PERCENT = 100; // docked full-width

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function loadLayout(): TerminalLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TerminalLayout>;
      return {
        height: parsed.height ?? DEFAULT_HEIGHT,
        width: parsed.width ?? DEFAULT_WIDTH_PERCENT,
        panelState: parsed.panelState === 'minimized' ? 'minimized' : 'normal',
        previousHeight: parsed.previousHeight ?? DEFAULT_HEIGHT,
      };
    }
  } catch {
    // ignore
  }
  return {
    height: DEFAULT_HEIGHT,
    width: DEFAULT_WIDTH_PERCENT,
    panelState: 'normal',
    previousHeight: DEFAULT_HEIGHT,
  };
}

function saveLayout(layout: TerminalLayout) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // ignore
  }
}

export function useTerminalLayout() {
  const [layout, setLayout] = useState<TerminalLayout>(loadLayout);

  // Persist whenever layout changes
  useEffect(() => {
    saveLayout(layout);
  }, [layout]);

  const getMaxHeight = useCallback(() => {
    return Math.floor(window.innerHeight * MAX_HEIGHT_VH);
  }, []);

  const setHeight = useCallback(
    (newHeight: number) => {
      const max = getMaxHeight();
      const clamped = clamp(newHeight, MIN_HEIGHT, max);
      setLayout((prev) => ({ ...prev, height: clamped, panelState: 'normal' }));
    },
    [getMaxHeight]
  );

  const minimize = useCallback(() => {
    setLayout((prev) => ({
      ...prev,
      previousHeight: prev.panelState !== 'minimized' ? prev.height : prev.previousHeight,
      panelState: 'minimized',
    }));
  }, []);

  const maximize = useCallback(() => {
    setLayout((prev) => ({
      ...prev,
      previousHeight: prev.panelState !== 'maximized' ? prev.height : prev.previousHeight,
      height: getMaxHeight(),
      panelState: 'maximized',
    }));
  }, [getMaxHeight]);

  const restore = useCallback(() => {
    setLayout((prev) => ({
      ...prev,
      height: prev.previousHeight || DEFAULT_HEIGHT,
      panelState: 'normal',
    }));
  }, []);

  const toggle = useCallback(() => {
    setLayout((prev) => {
      if (prev.panelState === 'minimized') {
        return { ...prev, panelState: 'normal' };
      }
      return {
        ...prev,
        previousHeight: prev.height,
        panelState: 'minimized',
      };
    });
  }, []);

  return {
    layout,
    setHeight,
    minimize,
    maximize,
    restore,
    toggle,
    MIN_HEIGHT,
    getMaxHeight,
  };
}

/**
 * Pointer-capture resize hook for vertical (top-edge) dragging.
 * Returns a ref to attach to the resize handle element.
 */
export function useVerticalResize(
  currentHeight: number,
  onHeightChange: (h: number) => void,
  minHeight: number,
  getMaxHeight: () => number
) {
  const dragStartY = useRef<number>(0);
  const dragStartHeight = useRef<number>(0);
  const rafId = useRef<number>(0);
  const pendingHeight = useRef<number>(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragStartY.current = e.clientY;
      dragStartHeight.current = currentHeight;
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    },
    [currentHeight]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!(e.buttons & 1)) return; // Only when primary button held
      const dy = dragStartY.current - e.clientY; // dragging up = positive dy = bigger terminal
      const newHeight = clamp(dragStartHeight.current + dy, minHeight, getMaxHeight());
      pendingHeight.current = newHeight;

      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        onHeightChange(pendingHeight.current);
      });
    },
    [minHeight, getMaxHeight, onHeightChange]
  );

  const handlePointerUp = useCallback(() => {
    cancelAnimationFrame(rafId.current);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}

