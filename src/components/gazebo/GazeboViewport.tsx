import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../state/simulationStore';
import { TurtleBot3Burger } from '../../robot/models/TurtleBot3Burger';
import { WorldObjects } from '../../robot/models/WorldObjects';

export const GazeboViewport: React.FC = () => {
  const robot = useSimulationStore((s) => s.robot);
  const objects = useSimulationStore((s) => s.objects);
  const selectedObjectId = useSimulationStore((s) => s.selectedObjectId);
  const selectObject = useSimulationStore((s) => s.selectObject);
  const showCollisionGeometry = useSimulationStore((s) => s.showCollisionGeometry);

  const controlsRef = useRef<any>(null);

  // Listen for camera preset events
  useEffect(() => {
    const handleCameraPreset = (e: any) => {
      const mode = e.detail;
      if (!controlsRef.current) return;

      if (mode === 'top') {
        controlsRef.current.object.position.set(robot.x, robot.y, 8);
        controlsRef.current.target.set(robot.x, robot.y, 0);
        controlsRef.current.update();
      } else if (mode === 'perspective') {
        controlsRef.current.object.position.set(robot.x - 2.5, robot.y - 2.5, 2.2);
        controlsRef.current.target.set(robot.x, robot.y, 0.2);
        controlsRef.current.update();
      }
    };

    window.addEventListener('gazebo-camera-preset', handleCameraPreset);
    return () => window.removeEventListener('gazebo-camera-preset', handleCameraPreset);
  }, [robot.x, robot.y]);

  return (
    <div className="w-full h-full relative bg-[#1a1e24] overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [-3.5, -3.5, 3.0], fov: 45, up: [0, 0, 1] }}
        onPointerMissed={() => selectObject(null)}
      >
        {/* Gazebo Classic Sky / Environment lighting */}
        <color attach="background" args={['#242a35']} />
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[5, 5, 10]}
          intensity={1.1}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-5, -5, 5]} intensity={0.3} />

        {/* Orbit Controls (constrained to upper hemisphere) */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          maxPolarAngle={Math.PI / 2 - 0.02}
          minDistance={0.5}
          maxDistance={25}
        />

        {/* TurtleBot3 Burger Robot Model */}
        <TurtleBot3Burger
          robot={robot}
          showTfAxes={false}
          showCollisionMesh={showCollisionGeometry}
        />

        {/* World Objects & Ground Plane */}
        <WorldObjects
          objects={objects}
          selectedId={selectedObjectId}
          onSelectObject={selectObject}
          showCollisionWireframe={showCollisionGeometry}
        />
      </Canvas>

      {/* World Coordinate Frame Gizmo in bottom left */}
      <div className="absolute bottom-2 left-2 pointer-events-none flex items-center space-x-1.5 bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-white">
        <span className="text-red-400 font-bold">X (Red)</span>
        <span>•</span>
        <span className="text-green-400 font-bold">Y (Green)</span>
        <span>•</span>
        <span className="text-blue-400 font-bold">Z (Blue)</span>
      </div>
    </div>
  );
};

