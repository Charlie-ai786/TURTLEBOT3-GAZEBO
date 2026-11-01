import React from 'react';
import { SimObject } from '../../types/simulation';

interface WorldObjectsProps {
  objects: SimObject[];
  selectedId: string | null;
  onSelectObject?: (id: string) => void;
  showCollisionWireframe?: boolean;
}

export const WorldObjects: React.FC<WorldObjectsProps> = ({
  objects,
  selectedId,
  onSelectObject,
  showCollisionWireframe = false,
}) => {
  return (
    <group>
      {/* Gazebo Classic Ground Plane */}
      <mesh position={[0, 0, -0.001]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Grid Floor Overlay */}
      <gridHelper
        args={[40, 40, '#333333', '#555555']}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0.001]}
      />

      {/* Render All Scene Objects */}
      {objects.map((obj) => {
        if (obj.type === 'ground' || obj.type === 'robot') return null;

        const isSelected = obj.id === selectedId;

        return (
          <group
            key={obj.id}
            position={[obj.position.x, obj.position.y, obj.position.z]}
            rotation={[obj.rotation.x, obj.rotation.y, obj.rotation.z]}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectObject) onSelectObject(obj.id);
            }}
          >
            {/* Box / Wall / Obstacle */}
            {(obj.type === 'box' || obj.type === 'wall' || obj.type === 'obstacle') && (
              <mesh castShadow receiveShadow>
                <boxGeometry args={[obj.size.x, obj.size.y, obj.size.z]} />
                <meshStandardMaterial
                  color={isSelected ? '#3498db' : obj.color || '#95a5a6'}
                  roughness={0.7}
                  metalness={0.2}
                />
              </mesh>
            )}

            {/* Cylinder */}
            {obj.type === 'cylinder' && (
              <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[obj.size.x / 2, obj.size.x / 2, obj.size.z, 32]} />
                <meshStandardMaterial
                  color={isSelected ? '#3498db' : obj.color || '#e74c3c'}
                  roughness={0.6}
                  metalness={0.3}
                />
              </mesh>
            )}

            {/* Table */}
            {obj.type === 'table' && (
              <group>
                {/* Table Top */}
                <mesh position={[0, 0, obj.size.z / 2 - 0.02]} castShadow receiveShadow>
                  <boxGeometry args={[obj.size.x, obj.size.y, 0.04]} />
                  <meshStandardMaterial color={obj.color || '#8d6e63'} roughness={0.6} />
                </mesh>
                {/* 4 Table Legs */}
                {[
                  [-obj.size.x / 2 + 0.04, -obj.size.y / 2 + 0.04],
                  [obj.size.x / 2 - 0.04, -obj.size.y / 2 + 0.04],
                  [-obj.size.x / 2 + 0.04, obj.size.y / 2 - 0.04],
                  [obj.size.x / 2 - 0.04, obj.size.y / 2 - 0.04],
                ].map(([lx, ly], idx) => (
                  <mesh key={idx} position={[lx, ly, -0.02]} castShadow>
                    <boxGeometry args={[0.04, 0.04, obj.size.z - 0.04]} />
                    <meshStandardMaterial color="#2d3436" metalness={0.5} roughness={0.5} />
                  </mesh>
                ))}
              </group>
            )}

            {/* Selection Bounding Box Indicator */}
            {isSelected && (
              <mesh>
                <boxGeometry
                  args={[
                    obj.size.x + 0.04,
                    obj.size.y + 0.04,
                    (obj.size.z || 0.5) + 0.04,
                  ]}
                />
                <meshBasicMaterial color="#00ffff" wireframe />
              </mesh>
            )}

            {/* Collision Wireframe Visualization */}
            {showCollisionWireframe && (
              <mesh>
                <boxGeometry args={[obj.size.x, obj.size.y, obj.size.z]} />
                <meshBasicMaterial color="#ff00ff" wireframe transparent opacity={0.6} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

