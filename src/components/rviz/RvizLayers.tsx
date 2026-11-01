import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  LaserScanData,
  MapData,
  NavigationState,
  PathPoint,
  RobotState,
  TfFrame,
} from '../../types/simulation';
import { RvizDisplaySettings } from '../../state/simulationStore';
import { RaycastHitPoint } from '../../sensors/lidar/raycaster';

interface RvizLayersProps {
  displays: RvizDisplaySettings;
  robot: RobotState;
  scanHitPoints: RaycastHitPoint[];
  scanData: LaserScanData | null;
  mapData: MapData;
  globalCostmapData: Uint8Array;
  localCostmapData: Uint8Array;
  tfFrames: TfFrame[];
  trajectory: PathPoint[];
  navigation: NavigationState;
  onGoalSelect?: (x: number, y: number) => void;
}

export const RvizLayers: React.FC<RvizLayersProps> = ({
  displays,
  robot,
  scanHitPoints,
  mapData,
  globalCostmapData,
  trajectory,
  navigation,
}) => {
  // 1. Generate Occupancy Grid Texture
  const mapTexture = useMemo(() => {
    if (!mapData || mapData.width === 0) return null;
    const size = mapData.width * mapData.height;
    const rgba = new Uint8Array(size * 4);

    for (let i = 0; i < size; i++) {
      const val = mapData.data[i];
      const pIdx = i * 4;
      if (val === -1) {
        // Unknown
        rgba[pIdx] = 45;
        rgba[pIdx + 1] = 45;
        rgba[pIdx + 2] = 45;
        rgba[pIdx + 3] = 160;
      } else if (val === 0) {
        // Free space
        rgba[pIdx] = 230;
        rgba[pIdx + 1] = 230;
        rgba[pIdx + 2] = 230;
        rgba[pIdx + 3] = 255;
      } else {
        // Occupied
        rgba[pIdx] = 10;
        rgba[pIdx + 1] = 10;
        rgba[pIdx + 2] = 10;
        rgba[pIdx + 3] = 255;
      }
    }

    const tex = new THREE.DataTexture(rgba, mapData.width, mapData.height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    return tex;
  }, [mapData]);

  // 2. Generate Global Costmap Texture
  const costmapTexture = useMemo(() => {
    if (!displays.globalCostmap.visible || !globalCostmapData) return null;
    const width = 200;
    const height = 200;
    const size = width * height;
    const rgba = new Uint8Array(size * 4);

    for (let i = 0; i < size; i++) {
      const cost = globalCostmapData[i];
      const pIdx = i * 4;
      if (cost === 0) {
        rgba[pIdx + 3] = 0; // transparent
      } else if (cost >= 253) {
        // Lethal obstacle (purple / magenta)
        rgba[pIdx] = 255;
        rgba[pIdx + 1] = 0;
        rgba[pIdx + 2] = 128;
        rgba[pIdx + 3] = 190;
      } else {
        // Inflated cost gradient (cyan -> yellow)
        const t = cost / 253;
        rgba[pIdx] = Math.floor(t * 255);
        rgba[pIdx + 1] = Math.floor((1 - t) * 200);
        rgba[pIdx + 2] = 255;
        rgba[pIdx + 3] = Math.floor(t * 160);
      }
    }

    const tex = new THREE.DataTexture(rgba, width, height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    return tex;
  }, [displays.globalCostmap.visible, globalCostmapData]);

  // 3. LaserScan Points geometry
  const scanGeometry = useMemo(() => {
    if (!displays.laserScan.visible || scanHitPoints.length === 0) return null;

    const positions = new Float32Array(scanHitPoints.length * 3);
    const colors = new Float32Array(scanHitPoints.length * 3);
    const color = new THREE.Color();

    for (let i = 0; i < scanHitPoints.length; i++) {
      const pt = scanHitPoints[i];
      positions[i * 3] = pt.worldX;
      positions[i * 3 + 1] = pt.worldY;
      positions[i * 3 + 2] = 0.17; // sensor height

      if (displays.laserScan.colorMode === 'distance') {
        const hue = Math.max(0, Math.min(0.7, (pt.distance / 3.5) * 0.7)); // Red (close) to Cyan (far)
        color.setHSL(hue, 1.0, 0.55);
      } else if (displays.laserScan.colorMode === 'intensity') {
        color.setRGB(pt.intensity / 255, 0.2, 0.8);
      } else {
        color.set(displays.laserScan.flatColor);
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [displays.laserScan, scanHitPoints]);

  // 4. Trajectory line Three.js object
  const trajectoryLine = useMemo(() => {
    if (!displays.trajectory.visible || trajectory.length < 2) return null;
    const points = trajectory.map((p) => new THREE.Vector3(p.x, p.y, 0.015));
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: displays.trajectory.color, linewidth: 2 });
    return new THREE.Line(geom, mat);
  }, [displays.trajectory.visible, displays.trajectory.color, trajectory]);

  // 5. Global Navigation Path Three.js object
  const pathLine = useMemo(() => {
    if (!displays.path.visible || navigation.globalPath.length < 2) return null;
    const points = navigation.globalPath.map((p) => new THREE.Vector3(p.x, p.y, 0.025));
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: displays.path.color, linewidth: displays.path.width });
    return new THREE.Line(geom, mat);
  }, [displays.path.visible, navigation.globalPath, displays.path.color, displays.path.width]);

  return (
    <group>
      {/* RViz Coordinate Grid */}
      {displays.grid.visible && (
        <gridHelper
          args={[30, 30, '#888888', displays.grid.color]}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
        />
      )}

      {/* SLAM Occupancy Grid Map */}
      {displays.map.visible && mapTexture && (
        <mesh
          position={[
            mapData.originX + (mapData.width * mapData.resolution) / 2,
            mapData.originY + (mapData.height * mapData.resolution) / 2,
            0.005,
          ]}
        >
          <planeGeometry args={[mapData.width * mapData.resolution, mapData.height * mapData.resolution]} />
          <meshBasicMaterial map={mapTexture} transparent opacity={displays.map.alpha} />
        </mesh>
      )}

      {/* Global Costmap Layer */}
      {displays.globalCostmap.visible && costmapTexture && (
        <mesh position={[0, 0, 0.008]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial map={costmapTexture} transparent opacity={displays.globalCostmap.alpha} />
        </mesh>
      )}

      {/* LaserScan Point Cloud */}
      {displays.laserScan.visible && scanGeometry && (
        <points geometry={scanGeometry}>
          <pointsMaterial size={displays.laserScan.pointSize} vertexColors />
        </points>
      )}

      {/* Robot Trajectory History (Odometry trail) */}
      {trajectoryLine && <primitive object={trajectoryLine} />}

      {/* Planned Navigation Path (Green A* route) */}
      {pathLine && <primitive object={pathLine} />}

      {/* 2D Nav Goal Marker (Arrow) */}
      {navigation.goal && navigation.goal.active && (
        <group position={[navigation.goal.x, navigation.goal.y, 0.05]} rotation={[0, 0, navigation.goal.heading]}>
          {/* Goal Base Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.18, 32]} />
            <meshBasicMaterial color="#e74c3c" side={THREE.DoubleSide} />
          </mesh>
          {/* Direction Arrow Head */}
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.07, 0.16, 16]} />
            <meshBasicMaterial color="#e74c3c" />
          </mesh>
          {/* Arrow Shaft */}
          <mesh position={[0.08, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
            <meshBasicMaterial color="#e74c3c" />
          </mesh>
        </group>
      )}

      {/* TF Frames Visualization */}
      {displays.tf.visible && (
        <group>
          {/* base_link frame */}
          <group position={[robot.x, robot.y, 0.08]} rotation={[0, 0, robot.heading]}>
            <mesh position={[0.08, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.003, 0.003, 0.16, 8]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.16, 8]} />
              <meshBasicMaterial color="#00ff00" />
            </mesh>
            <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.16, 8]} />
              <meshBasicMaterial color="#0000ff" />
            </mesh>
          </group>

          {/* odom / map origin frame */}
          <group position={[0, 0, 0.02]}>
            <mesh position={[0.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.004, 0.004, 0.2, 8]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.2, 8]} />
              <meshBasicMaterial color="#00ff00" />
            </mesh>
            <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.2, 8]} />
              <meshBasicMaterial color="#0000ff" />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};
