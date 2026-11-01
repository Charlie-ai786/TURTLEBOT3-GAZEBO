import React, { useRef, useEffect } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSimulationStore } from '../../state/simulationStore';
import { TurtleBot3Burger } from '../../robot/models/TurtleBot3Burger';
import { RvizLayers } from './RvizLayers';
import { ResponsiveCanvasManager } from '../common/ResponsiveCanvasManager';

export const RvizViewport: React.FC = () => {
  const robot = useSimulationStore((s) => s.robot);
  const displays = useSimulationStore((s) => s.rvizDisplays);
  const scanData = useSimulationStore((s) => s.scanData);
  const scanHitPoints = useSimulationStore((s) => s.scanHitPoints);
  const mapData = useSimulationStore((s) => s.mapData);
  const costmapEngine = useSimulationStore((s) => s.costmapEngine);
  const tfFrames = useSimulationStore((s) => s.tfFrames);
  const trajectory = useSimulationStore((s) => s.trajectory);
  const navigation = useSimulationStore((s) => s.navigation);
  const rvizTool = useSimulationStore((s) => s.rvizTool);
  const setRvizTool = useSimulationStore((s) => s.setRvizTool);
  const setNavGoal = useSimulationStore((s) => s.setNavGoal);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);

  // Listen for RViz camera preset events
  useEffect(() => {
    const handleCameraPreset = (e: any) => {
      const mode = e.detail;
      if (!controlsRef.current) return;

      if (mode === 'top') {
        controlsRef.current.object.position.set(0, 0, 9);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      } else if (mode === 'orbit') {
        controlsRef.current.object.position.set(-3.5, -3.5, 3.5);
        controlsRef.current.target.set(robot.x, robot.y, 0.1);
        controlsRef.current.update();
      }
    };

    window.addEventListener('rviz-camera-preset', handleCameraPreset);
    return () => window.removeEventListener('rviz-camera-preset', handleCameraPreset);
  }, [robot.x, robot.y]);

  // Handle click on RViz ground plane for 2D Nav Goal or 2D Pose Estimate
  const handleGroundClick = (e: ThreeEvent<MouseEvent>) => {
    if (rvizTool === 'nav_goal') {
      e.stopPropagation();
      const clickPt = e.point;
      const angle = Math.atan2(clickPt.y - robot.y, clickPt.x - robot.x);
      setNavGoal(clickPt.x, clickPt.y, angle);
      setRvizTool('interact');
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-[#121316] overflow-hidden min-h-0 min-w-0"
    >
      {/* 2D Nav Goal Cursor Banner */}
      {rvizTool === 'nav_goal' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-red-600/90 text-white font-semibold px-4 py-1.5 rounded-full shadow-lg border border-red-400 text-xs flex items-center space-x-2 animate-bounce">
          <span>🎯 Click on the map to set 2D Navigation Goal</span>
        </div>
      )}

      <Canvas
        resize={{ scroll: false, debounce: 0 }}
        camera={{ position: [-3.0, -3.0, 3.5], fov: 45, up: [0, 0, 1] }}
      >
        {/* Real-time zero-delay Canvas resizing manager */}
        <ResponsiveCanvasManager containerRef={containerRef} />

        {/* RViz Dark Engineering Background */}
        <color attach="background" args={['#14171c']} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 10]} intensity={0.8} />

        {/* Orbit Controls (disabled while aiming nav goal to allow clicking) */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enabled={rvizTool !== 'nav_goal'}
          maxPolarAngle={Math.PI / 2 - 0.01}
          minDistance={0.5}
          maxDistance={30}
        />

        {/* Raycasting plane for 2D Nav Goal placement */}
        <mesh
          position={[0, 0, -0.002]}
          onClick={handleGroundClick}
          visible={false}
        >
          <planeGeometry args={[40, 40]} />
          <meshBasicMaterial />
        </mesh>

        {/* RViz Visualization Layers (LaserScan, Map, Costmap, Path, Trajectory, TF, Goal) */}
        <RvizLayers
          displays={displays}
          robot={robot}
          scanHitPoints={scanHitPoints}
          scanData={scanData}
          mapData={mapData}
          globalCostmapData={costmapEngine.globalCostmap}
          localCostmapData={costmapEngine.localCostmap}
          tfFrames={tfFrames}
          trajectory={trajectory}
          navigation={navigation}
        />

        {/* Robot Model in RViz */}
        {displays.robotModel.visible && (
          <TurtleBot3Burger
            robot={robot}
            showTfAxes={displays.tf.visible && displays.tf.showAxes}
            showCollisionMesh={false}
            opacity={displays.robotModel.alpha}
          />
        )}
      </Canvas>

      {/* Frame Coordinate Info badge */}
      <div className="absolute bottom-2 left-2 pointer-events-none flex items-center space-x-1.5 bg-black/70 px-2 py-1 rounded text-[10px] font-mono text-gray-300 border border-gray-700">
        <span className="text-red-400 font-bold">X: Forward</span>
        <span>|</span>
        <span className="text-green-400 font-bold">Y: Left</span>
        <span>|</span>
        <span className="text-blue-400 font-bold">Z: Up</span>
      </div>
    </div>
  );
};
