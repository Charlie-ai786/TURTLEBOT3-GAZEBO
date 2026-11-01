import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Play,
  CheckCircle,
  HelpCircle,
  Terminal,
  Code,
  Download,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useSimulationStore } from '../../state/simulationStore';
import { TURTLEBOT3_PRACTICALS } from '../../learning/practicalsData';
import { Practical } from '../../types/practicals';

export const PracticalsPanel: React.FC = () => {
  const isPracticalsOpen = useSimulationStore((s) => s.isPracticalsOpen);
  const togglePracticals = useSimulationStore((s) => s.togglePracticals);
  const setWorkspaceMode = useSimulationStore((s) => s.setWorkspaceMode);
  const setEnvironment = useSimulationStore((s) => s.setEnvironment);
  const startMapping = useSimulationStore((s) => s.startMapping);
  const setNavGoal = useSimulationStore((s) => s.setNavGoal);
  const addObject = useSimulationStore((s) => s.addObject);
  const occupancyGridMap = useSimulationStore((s) => s.occupancyGridMap);

  const [selectedPracticalId, setSelectedPracticalId] = useState<string>('p1');
  const [showViva, setShowViva] = useState<Record<number, boolean>>({});

  if (!isPracticalsOpen) return null;

  const currentPractical =
    TURTLEBOT3_PRACTICALS.find((p) => p.id === selectedPracticalId) || TURTLEBOT3_PRACTICALS[0];

  const toggleViva = (idx: number) => {
    setShowViva((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleStepAction = (actionId?: string) => {
    if (!actionId) return;

    if (actionId === 'load_world') {
      setEnvironment('turtlebot3_world');
      setWorkspaceMode('gazebo');
    } else if (actionId === 'focus_teleop') {
      setWorkspaceMode('gazebo');
    } else if (actionId === 'switch_rviz') {
      setWorkspaceMode('rviz');
    } else if (actionId === 'start_slam') {
      startMapping();
      setWorkspaceMode('combined');
    } else if (actionId === 'export_map') {
      const { yaml, pgm } = occupancyGridMap.exportYamlAndPgm();
      // Download yaml
      const blobYaml = new Blob([yaml], { type: 'text/yaml' });
      const urlYaml = URL.createObjectURL(blobYaml);
      const aYaml = document.createElement('a');
      aYaml.href = urlYaml;
      aYaml.download = 'map.yaml';
      aYaml.click();

      // Download pgm
      const blobPgm = new Blob([pgm], { type: 'text/plain' });
      const urlPgm = URL.createObjectURL(blobPgm);
      const aPgm = document.createElement('a');
      aPgm.href = urlPgm;
      aPgm.download = 'map.pgm';
      aPgm.click();
    } else if (actionId === 'prep_nav') {
      setWorkspaceMode('rviz');
    } else if (actionId === 'set_target_p8') {
      setWorkspaceMode('combined');
      setNavGoal(2.0, 0.0, 0);
    } else if (actionId === 'insert_blocker') {
      addObject('box', { x: 0.2, y: 0.0, z: 0.25 });
    }
  };

  return (
    <div className="fixed inset-4 z-50 bg-[#1e1e1e] border border-[#555] rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs text-[#dcdcdc] select-text">
      {/* Header */}
      <div className="bg-[#2a2a2a] px-4 py-2.5 flex items-center justify-between border-b border-[#3c3c3c] select-none">
        <div className="flex items-center space-x-2 text-white font-bold text-sm">
          <BookOpen className="text-amber-400" size={18} />
          <span>TurtleBot3 Gazebo & RViz Practical Laboratory (8 Curriculum Experiments)</span>
        </div>
        <button
          onClick={togglePracticals}
          className="p-1 hover:bg-[#444] rounded text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Practicals List */}
        <div className="w-80 bg-[#161616] border-r border-[#333] overflow-y-auto p-2 space-y-1 select-none">
          <div className="text-[10px] uppercase font-bold text-gray-400 px-2 py-1 tracking-wider">
            Curriculum Experiments
          </div>
          {TURTLEBOT3_PRACTICALS.map((prac) => {
            const isSelected = prac.id === selectedPracticalId;
            return (
              <button
                key={prac.id}
                onClick={() => setSelectedPracticalId(prac.id)}
                className={`w-full text-left p-2.5 rounded border transition-colors flex items-start space-x-2 ${
                  isSelected
                    ? 'bg-[#2c3e50] border-[#3498db] text-white shadow-md'
                    : 'bg-[#222] border-transparent text-gray-300 hover:bg-[#2a2a2a]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                    isSelected ? 'bg-[#3498db] text-white' : 'bg-[#333] text-gray-400'
                  }`}
                >
                  {prac.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{prac.title}</div>
                  <div className="text-[10px] text-gray-400 truncate mt-0.5">{prac.aim}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Content: Practical Detail */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#1a1a1a]">
          {/* Title & Aim */}
          <div>
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              PRACTICAL {currentPractical.number}
            </div>
            <h1 className="text-xl font-bold text-white mt-0.5">{currentPractical.title}</h1>
            <div className="mt-2 bg-[#252525] p-3 rounded border border-[#383838]">
              <span className="font-bold text-white mr-1.5">Aim:</span>
              <span className="text-gray-300">{currentPractical.aim}</span>
            </div>
          </div>

          {/* Theory */}
          <div className="space-y-1.5">
            <h2 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <Code size={14} className="text-cyan-400" />
              <span>Theory & Robotics Principles</span>
            </h2>
            <div className="bg-[#222] p-3.5 rounded border border-[#333] text-gray-300 whitespace-pre-line leading-relaxed font-sans text-xs">
              {currentPractical.theory}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-1.5">
            <h2 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <CheckCircle size={14} className="text-green-400" />
              <span>System & Hardware Requirements</span>
            </h2>
            <ul className="list-disc list-inside bg-[#222] p-3 rounded border border-[#333] text-gray-300 space-y-1">
              {currentPractical.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Step-by-Step Procedure with Interactive Simulation Triggers */}
          <div className="space-y-2.5">
            <h2 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <Play size={14} className="text-yellow-400" />
              <span>Experimental Procedure & Simulation Actions</span>
            </h2>
            <div className="space-y-2">
              {currentPractical.procedure.map((step) => (
                <div
                  key={step.stepNumber}
                  className="bg-[#242424] border border-[#383838] rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white flex items-center space-x-2">
                      <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold">
                        {step.stepNumber}
                      </span>
                      <span>{step.title}</span>
                    </div>

                    {step.autoActionText && (
                      <button
                        onClick={() => handleStepAction(step.actionId)}
                        className="px-2.5 py-1 bg-[#27ae60] hover:bg-[#2ecc71] text-white rounded text-xs font-bold flex items-center space-x-1 shadow"
                      >
                        <Play size={11} fill="currentColor" />
                        <span>{step.autoActionText}</span>
                      </button>
                    )}
                  </div>

                  <p className="text-gray-300 text-xs">{step.instruction}</p>

                  {step.rosCommand && (
                    <div className="bg-[#141414] p-2 rounded border border-[#2e2e2e] font-mono text-[11px] text-green-400 flex items-center justify-between">
                      <span>$ {step.rosCommand}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(step.rosCommand!)}
                        className="text-gray-500 hover:text-gray-300 text-[10px]"
                      >
                        Copy
                      </button>
                    </div>
                  )}

                  {step.expectedOutput && (
                    <div className="bg-[#181818] p-2 rounded border border-[#2a2a2a] text-[11px]">
                      <span className="text-gray-400 block text-[10px] font-bold">EXPECTED OUTPUT:</span>
                      <pre className="text-gray-300 font-mono text-[10px] whitespace-pre-wrap mt-0.5">
                        {step.expectedOutput}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actual ROS Commands Summary */}
          <div className="space-y-1.5">
            <h2 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <Terminal size={14} className="text-cyan-400" />
              <span>Full ROS Command Pipeline</span>
            </h2>
            <div className="bg-[#141414] p-3 rounded border border-[#333] font-mono text-xs text-green-400 space-y-1">
              {currentPractical.rosCommands.map((c, i) => (
                <div key={i}>$ {c}</div>
              ))}
            </div>
          </div>

          {/* Expected Result */}
          <div className="bg-[#1d2731] border border-[#2c3e50] p-3.5 rounded text-xs">
            <span className="font-bold text-[#3498db] block text-xs uppercase mb-1">
              Final Result & Conclusion:
            </span>
            <span className="text-gray-200">{currentPractical.expectedResult}</span>
          </div>

          {/* Viva Voce Questions & Answers */}
          <div className="space-y-2 pt-2 border-t border-[#333]">
            <h2 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <HelpCircle size={14} className="text-purple-400" />
              <span>Viva Voce Exam Questions & Answers</span>
            </h2>
            <div className="space-y-2">
              {currentPractical.vivaQuestions.map((vq, idx) => (
                <div key={idx} className="bg-[#242424] border border-[#383838] rounded p-2.5">
                  <button
                    onClick={() => toggleViva(idx)}
                    className="w-full text-left font-semibold text-white flex items-center justify-between text-xs"
                  >
                    <span>
                      Q{idx + 1}: {vq.question}
                    </span>
                    {showViva[idx] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {showViva[idx] && (
                    <div className="mt-2 pl-3 border-l-2 border-purple-500 text-gray-300 text-xs bg-[#1a1a1a] p-2 rounded">
                      <span className="font-bold text-purple-300 mr-1">Answer:</span>
                      {vq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

