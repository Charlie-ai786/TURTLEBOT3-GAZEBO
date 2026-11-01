import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RobotState } from '../../types/simulation';

interface TurtleBot3BurgerProps {
  robot: RobotState;
  showTfAxes?: boolean;
  showCollisionMesh?: boolean;
  opacity?: number;
}

export const TurtleBot3Burger: React.FC<TurtleBot3BurgerProps> = ({
  robot,
  showTfAxes = false,
  showCollisionMesh = false,
  opacity = 1.0,
}) => {
  const leftWheelRef = useRef<THREE.Group>(null);
  const rightWheelRef = useRef<THREE.Group>(null);
  const lidarRotorRef = useRef<THREE.Group>(null);
  const ledBlinkRef = useRef<THREE.MeshBasicMaterial>(null);

  // Animate spinning wheels and spinning LiDAR head continuously
  useFrame((_, delta) => {
    if (leftWheelRef.current) {
      leftWheelRef.current.rotation.y = robot.leftWheelRotation;
    }
    if (rightWheelRef.current) {
      rightWheelRef.current.rotation.y = robot.rightWheelRotation;
    }
    if (lidarRotorRef.current) {
      lidarRotorRef.current.rotation.y += delta * 15; // 5Hz * 2PI ~ 30 rad/s
    }
    if (ledBlinkRef.current) {
      // Periodic blink for OpenCR status LED
      const blink = Math.sin(performance.now() * 0.006) > 0;
      ledBlinkRef.current.color.set(blink ? '#00ff44' : '#003311');
    }
  });

  const transparent = opacity < 1.0;

  return (
    <group position={[robot.x, robot.y, 0]} rotation={[0, 0, robot.heading]}>
      {/* 1. Base Footprint to Base Link Offset */}
      <group position={[0, 0, 0]}>
        
        {/* Bottom Tier Plate (Ground clearance ~0.033m) */}
        <mesh position={[0, 0, 0.033]} castShadow receiveShadow>
          <cylinderGeometry args={[0.068, 0.068, 0.004, 32]} />
          <meshStandardMaterial color="#222222" metalness={0.4} roughness={0.6} transparent={transparent} opacity={opacity} />
        </mesh>

        {/* Battery Pack (on bottom tier) */}
        <mesh position={[-0.02, 0, 0.046]} castShadow>
          <boxGeometry args={[0.07, 0.045, 0.022]} />
          <meshStandardMaterial color="#111111" roughness={0.8} transparent={transparent} opacity={opacity} />
        </mesh>
        {/* Battery cable / connector */}
        <mesh position={[0.02, 0.015, 0.046]}>
          <boxGeometry args={[0.012, 0.01, 0.008]} />
          <meshStandardMaterial color="#f1c40f" />
        </mesh>

        {/* Four Standoffs: Bottom to Middle Tier */}
        {[-0.045, 0.045].map((sx, i) =>
          [-0.045, 0.045].map((sy, j) => (
            <mesh key={`so1_${i}_${j}`} position={[sx, sy, 0.06]} castShadow>
              <cylinderGeometry args={[0.003, 0.003, 0.05, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
            </mesh>
          ))
        )}

        {/* Middle Tier Plate */}
        <mesh position={[0, 0, 0.085]} castShadow receiveShadow>
          <cylinderGeometry args={[0.068, 0.068, 0.004, 32]} />
          <meshStandardMaterial color="#222222" metalness={0.4} roughness={0.6} transparent={transparent} opacity={opacity} />
        </mesh>

        {/* OpenCR 1.0 Controller Board (PCB) on Middle Tier */}
        <group position={[0, 0, 0.093]}>
          {/* PCB Board */}
          <mesh castShadow>
            <boxGeometry args={[0.075, 0.065, 0.003]} />
            <meshStandardMaterial color="#0f5132" roughness={0.5} />
          </mesh>
          {/* Microcontroller MCU chip */}
          <mesh position={[0, 0, 0.003]}>
            <boxGeometry args={[0.018, 0.018, 0.003]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
          </mesh>
          {/* Power LED (Solid Red) */}
          <mesh position={[-0.025, 0.02, 0.003]}>
            <boxGeometry args={[0.004, 0.004, 0.002]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          {/* Status LED (Blinking Green) */}
          <mesh position={[-0.018, 0.02, 0.003]}>
            <boxGeometry args={[0.004, 0.004, 0.002]} />
            <meshBasicMaterial ref={ledBlinkRef} color="#00ff44" />
          </mesh>
        </group>

        {/* Four Standoffs: Middle to Top Tier */}
        {[-0.045, 0.045].map((sx, i) =>
          [-0.045, 0.045].map((sy, j) => (
            <mesh key={`so2_${i}_${j}`} position={[sx, sy, 0.12]} castShadow>
              <cylinderGeometry args={[0.003, 0.003, 0.065, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
            </mesh>
          ))
        )}

        {/* Top Tier Plate */}
        <mesh position={[0, 0, 0.152]} castShadow receiveShadow>
          <cylinderGeometry args={[0.068, 0.068, 0.004, 32]} />
          <meshStandardMaterial color="#222222" metalness={0.4} roughness={0.6} transparent={transparent} opacity={opacity} />
        </mesh>

        {/* 2. LDS-01 LiDAR Sensor Assembly on Top Tier */}
        <group position={[-0.032, 0, 0.155]}>
          {/* LiDAR Mount Support */}
          <mesh position={[0, 0, 0.006]} castShadow>
            <cylinderGeometry args={[0.035, 0.038, 0.012, 24]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
          </mesh>
          {/* LiDAR Static Base Body */}
          <mesh position={[0, 0, 0.018]} castShadow>
            <cylinderGeometry args={[0.034, 0.034, 0.014, 24]} />
            <meshStandardMaterial color="#2d3436" metalness={0.3} roughness={0.4} />
          </mesh>
          {/* Optical Window Cutout (red lens slit) */}
          <mesh position={[0.025, 0, 0.018]}>
            <boxGeometry args={[0.01, 0.015, 0.008]} />
            <meshStandardMaterial color="#e74c3c" roughness={0.2} />
          </mesh>
          {/* Rotating Laser Turret Head */}
          <group ref={lidarRotorRef} position={[0, 0, 0.03]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.033, 0.033, 0.012, 24]} />
              <meshStandardMaterial color="#111111" roughness={0.5} />
            </mesh>
            {/* Sensor Emitter Aperture */}
            <mesh position={[0.02, 0, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.006, 12]} />
              <meshBasicMaterial color="#ff2200" />
            </mesh>
          </group>
        </group>

        {/* 3. DYNAMIXEL XL430 Actuators (Left & Right) */}
        {/* Left Actuator Housing */}
        <mesh position={[0, 0.055, 0.033]} castShadow>
          <boxGeometry args={[0.032, 0.038, 0.046]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        {/* Right Actuator Housing */}
        <mesh position={[0, -0.055, 0.033]} castShadow>
          <boxGeometry args={[0.032, 0.038, 0.046]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>

        {/* 4. Left Wheel Assembly (y = +0.08m) */}
        <group position={[0, 0.08, 0.033]} rotation={[Math.PI / 2, 0, 0]}>
          <group ref={leftWheelRef}>
            {/* Rubber Tire */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.033, 0.033, 0.018, 24]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
            {/* White Plastic Hub Rim */}
            <mesh position={[0, 0.002, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.019, 16]} />
              <meshStandardMaterial color="#f8f9fa" roughness={0.3} />
            </mesh>
            {/* Axle Bolt / Spoke Marker */}
            <mesh position={[0.012, 0.01, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.02, 8]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
          </group>
        </group>

        {/* 5. Right Wheel Assembly (y = -0.08m) */}
        <group position={[0, -0.08, 0.033]} rotation={[-Math.PI / 2, 0, 0]}>
          <group ref={rightWheelRef}>
            {/* Rubber Tire */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.033, 0.033, 0.018, 24]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
            {/* White Plastic Hub Rim */}
            <mesh position={[0, 0.002, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.019, 16]} />
              <meshStandardMaterial color="#f8f9fa" roughness={0.3} />
            </mesh>
            {/* Axle Bolt / Spoke Marker */}
            <mesh position={[0.012, 0.01, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.02, 8]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
          </group>
        </group>

        {/* 6. Rear Caster Wheel Assembly (x = -0.081m) */}
        <group position={[-0.081, 0, 0.012]}>
          {/* Caster Bracket */}
          <mesh position={[0, 0, 0.01]} castShadow>
            <boxGeometry args={[0.02, 0.02, 0.018]} />
            <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Steel Caster Ball */}
          <mesh position={[0, 0, 0]} castShadow>
            <sphereGeometry args={[0.008, 16, 16]} />
            <meshStandardMaterial color="#bdc3c7" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* 7. Collision Shape Visualization (Optional) */}
        {showCollisionMesh && (
          <mesh position={[0, 0, 0.09]}>
            <cylinderGeometry args={[0.11, 0.11, 0.18, 24]} />
            <meshBasicMaterial color="#00ffcc" wireframe transparent opacity={0.35} />
          </mesh>
        )}

        {/* 8. ROS Coordinate Frame Axes (X: Red forward, Y: Green left, Z: Blue up) */}
        {showTfAxes && (
          <group position={[0, 0, 0.08]}>
            {/* X-axis: Red */}
            <mesh position={[0.08, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.003, 0.003, 0.16, 8]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
            {/* Y-axis: Green */}
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.16, 8]} />
              <meshBasicMaterial color="#00ff00" />
            </mesh>
            {/* Z-axis: Blue */}
            <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.16, 8]} />
              <meshBasicMaterial color="#0000ff" />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
};

