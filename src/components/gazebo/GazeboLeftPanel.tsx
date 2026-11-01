import React, { useState } from 'react';
import {
  Globe,
  PlusCircle,
  Layers,
  Trash2,
  Box,
  Circle,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useSimulationStore } from '../../state/simulationStore';
import { PREDEFINED_WORLDS } from '../../environments/worlds';
import { WorldEnvironmentType } from '../../types/simulation';

export const GazeboLeftPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'world' | 'insert' | 'environments'>('world');
  const [worldTreeExpanded, setWorldTreeExpanded] = useState(true);

  const objects = useSimulationStore((s) => s.objects);
  const selectedObjectId = useSimulationStore((s) => s.selectedObjectId);
  const selectObject = useSimulationStore((s) => s.selectObject);
  const removeObject = useSimulationStore((s) => s.removeObject);
  const addObject = useSimulationStore((s) => s.addObject);
  const currentWorld = useSimulationStore((s) => s.currentWorld);
  const setEnvironment = useSimulationStore((s) => s.setEnvironment);

  const availableModels = [
    { type: 'box', name: 'Cardboard Box', icon: Box, desc: '0.5m x 0.5m wooden/cardboard box' },
    { type: 'cylinder', name: 'Cylinder Pillar', icon: Circle, desc: '0.4m diameter stone column' },
    { type: 'wall', name: 'Wall Section', icon: Layers, desc: '2.0m x 0.15m concrete partition' },
    { type: 'table', name: 'Lab Table', icon: Layers, desc: '1.2m x 0.8m workbench' },
    { type: 'obstacle', name: 'Traffic / Safety Pillar', icon: ShieldAlert, desc: 'Bright safety obstacle' },
  ];

  return (
    <div className="w-64 bg-[#2b2b2b] border-r border-[#1f1f1f] text-[#dcdcdc] flex flex-col text-xs select-none h-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#3a3a3a] bg-[#242424]">
        <button
          onClick={() => setActiveTab('world')}
          className={`flex-1 py-1.5 text-center font-medium flex items-center justify-center space-x-1 border-b-2 ${
            activeTab === 'world'
              ? 'border-[#ff9800] text-white bg-[#2b2b2b]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Globe size={12} />
          <span>World</span>
        </button>
        <button
          onClick={() => setActiveTab('insert')}
          className={`flex-1 py-1.5 text-center font-medium flex items-center justify-center space-x-1 border-b-2 ${
            activeTab === 'insert'
              ? 'border-[#ff9800] text-white bg-[#2b2b2b]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <PlusCircle size={12} />
          <span>Insert</span>
        </button>
        <button
          onClick={() => setActiveTab('environments')}
          className={`flex-1 py-1.5 text-center font-medium flex items-center justify-center space-x-1 border-b-2 ${
            activeTab === 'environments'
              ? 'border-[#ff9800] text-white bg-[#2b2b2b]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Layers size={12} />
          <span>Worlds</span>
        </button>
      </div>

      {/* Content for Tab: World (Scene Hierarchy) */}
      {activeTab === 'world' && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 mb-1">
            <span>MODELS IN SCENE ({objects.length + 2})</span>
          </div>

          {/* Root Scene Node */}
          <div className="space-y-0.5">
            <div
              onClick={() => setWorldTreeExpanded(!worldTreeExpanded)}
              className="flex items-center space-x-1 px-1.5 py-1 hover:bg-[#383838] rounded cursor-pointer text-gray-300 font-medium"
            >
              {worldTreeExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <Globe size={12} className="text-[#3498db]" />
              <span>default_world</span>
            </div>

            {worldTreeExpanded && (
              <div className="pl-4 space-y-0.5">
                {/* Fixed items */}
                <div className="px-2 py-1 text-gray-400 flex items-center space-x-1.5 text-[11px] hover:bg-[#333] rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                  <span>ground_plane</span>
                </div>
                <div
                  onClick={() => selectObject('robot')}
                  className={`px-2 py-1 flex items-center justify-between text-[11px] rounded cursor-pointer ${
                    selectedObjectId === 'robot'
                      ? 'bg-[#2980b9] text-white font-semibold'
                      : 'text-[#e67e22] hover:bg-[#383838]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#e67e22]"></div>
                    <span>turtlebot3_burger</span>
                  </div>
                  <span className="text-[10px] text-gray-400">robot</span>
                </div>

                {/* World objects */}
                {objects.map((obj) => (
                  <div
                    key={obj.id}
                    onClick={() => selectObject(obj.id)}
                    className={`px-2 py-1 flex items-center justify-between text-[11px] rounded cursor-pointer ${
                      selectedObjectId === obj.id
                        ? 'bg-[#2980b9] text-white font-semibold'
                        : 'text-gray-300 hover:bg-[#383838]'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: obj.color || '#3498db' }}
                      ></div>
                      <span className="truncate">{obj.name}</span>
                    </div>
                    {!obj.isStatic && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeObject(obj.id);
                        }}
                        className="text-gray-400 hover:text-red-400 p-0.5"
                        title="Delete Object"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content for Tab: Insert (Model Library) */}
      {activeTab === 'insert' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          <div className="text-[11px] font-semibold text-gray-400 mb-2">
            AVAILABLE MODELS
          </div>

          {availableModels.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.type}
                className="bg-[#333] hover:bg-[#3d3d3d] border border-[#444] rounded p-2 flex flex-col justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-[#252525] rounded text-[#ff9800]">
                    <Icon size={14} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="text-[10px] text-gray-400">{m.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => addObject(m.type as any)}
                  className="mt-2 w-full py-1 bg-[#2980b9] hover:bg-[#3498db] text-white rounded text-[11px] font-semibold flex items-center justify-center space-x-1"
                >
                  <PlusCircle size={12} />
                  <span>Insert into World</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Content for Tab: Environments (Predefined Worlds) */}
      {activeTab === 'environments' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          <div className="text-[11px] font-semibold text-gray-400 mb-1">
            SELECT SIMULATION ENVIRONMENT
          </div>

          {(Object.keys(PREDEFINED_WORLDS) as WorldEnvironmentType[]).map((key) => {
            const w = PREDEFINED_WORLDS[key];
            const isCurrent = currentWorld === key;
            return (
              <div
                key={key}
                onClick={() => setEnvironment(key)}
                className={`p-2.5 rounded border cursor-pointer transition-colors ${
                  isCurrent
                    ? 'bg-[#1b3a4b] border-[#00bcd4] text-white'
                    : 'bg-[#333] border-[#444] text-gray-300 hover:bg-[#3d3d3d]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{w.name}</span>
                  {isCurrent && (
                    <span className="text-[10px] bg-[#00bcd4] text-black px-1.5 py-0.2 rounded font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{w.description}</p>
                <div className="mt-2 text-[10px] text-gray-500">
                  Objects: {w.objects.length} | Robot: ({w.robotInitialPose.x}, {w.robotInitialPose.y})
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

