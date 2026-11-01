import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ResponsiveCanvasManagerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Ensures Three.js WebGL renderer and Camera projection matrix respond instantaneously
 * to container resizing (e.g. during terminal drag, maximize, minimize, or window resize)
 * with zero black bars or empty space.
 */
export const ResponsiveCanvasManager: React.FC<ResponsiveCanvasManagerProps> = ({ containerRef }) => {
  const { gl, camera, invalidate } = useThree();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width <= 0 || height <= 0) continue;

        // 1. Read the new container width & height
        // 2. Update renderer dimensions
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        gl.setPixelRatio(dpr);
        gl.setSize(width, height, true);

        // 3. Update camera aspect ratio
        if ('aspect' in camera) {
          (camera as THREE.PerspectiveCamera).aspect = width / height;
          // 4. Update camera projection matrix
          camera.updateProjectionMatrix();
        }

        // 5. Re-render the scene
        invalidate();
      }
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [gl, camera, invalidate, containerRef]);

  return null;
};

