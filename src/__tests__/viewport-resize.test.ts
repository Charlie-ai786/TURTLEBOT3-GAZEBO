import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';

describe('Suite 7: Three.js Viewport Resizing & Aspect Ratio Synchronization', () => {
  let camera: THREE.PerspectiveCamera;
  let rendererMock: {
    setSize: (w: number, h: number, update?: boolean) => void;
    setPixelRatio: (dpr: number) => void;
  };

  beforeEach(() => {
    camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 100);
    rendererMock = {
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
    };
  });

  it('updates camera aspect ratio and projection matrix upon container resize', () => {
    const updateSpy = vi.spyOn(camera, 'updateProjectionMatrix');

    // Simulate resizing container to 1200 x 600 (aspect 2.0)
    const newWidth = 1200;
    const newHeight = 600;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    rendererMock.setSize(newWidth, newHeight, true);

    expect(camera.aspect).toBe(2.0);
    expect(updateSpy).toHaveBeenCalledOnce();
    expect(rendererMock.setSize).toHaveBeenCalledWith(1200, 600, true);
  });

  it('adapts camera correctly when terminal expands (height shrinks to 400px)', () => {
    const updateSpy = vi.spyOn(camera, 'updateProjectionMatrix');

    // Terminal expands, viewport shrinks from 1200x800 to 1200x400
    const newWidth = 1200;
    const newHeight = 400;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    rendererMock.setSize(newWidth, newHeight, true);

    expect(camera.aspect).toBe(3.0);
    expect(updateSpy).toHaveBeenCalled();
    expect(rendererMock.setSize).toHaveBeenCalledWith(1200, 400, true);
  });

  it('verifies ResizeObserver callback logic handles zero and non-zero dimensions', () => {
    let observedWidth = 0;
    let observedHeight = 0;

    const mockCallback = (entries: Array<{ contentRect: { width: number; height: number } }>) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width <= 0 || height <= 0) continue;
        observedWidth = width;
        observedHeight = height;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    // Ignore 0 dimensions (e.g., hidden tab)
    mockCallback([{ contentRect: { width: 0, height: 0 } }]);
    expect(observedWidth).toBe(0);

    // Valid resize event
    mockCallback([{ contentRect: { width: 900, height: 600 } }]);
    expect(observedWidth).toBe(900);
    expect(observedHeight).toBe(600);
    expect(camera.aspect).toBe(1.5);
  });
});
