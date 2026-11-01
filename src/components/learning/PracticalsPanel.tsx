import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Play,
  CheckCircle,
  HelpCircle,
  Terminal,
  Code,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useSimulationStore } from '../../state/simulationStore';
import { TURTLEBOT3_PRACTICALS } from '../../learning/practicalsData';

export const PracticalsPanel: React.FC = () => {
  const isPracticalsOpen = useSimulationStore((s) => s.isPracticalsOpen);
  const togglePracticals = useSimulationStore((s) => s.togglePracticals);
  const setWorkspaceMode = useSimulationStore((s) => s.setWorkspaceMode);
  const setEnvironment = useSimulationStore((s) => s.setEnvironment);
  const startMapping = useSimulationStore((s) => s.startMapping);
  const setNavGoal = useSimulationStore((s) => s.setNavGoal);
  const addObject = useSimulationStore((s) => s.addObject);
  const occupancyGridMap = useSimulationStore((s) => s.occupancyGridMap);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const completedPracticals = useSimulationStore((s) => s.completedPracticals);
  const markPracticalCompleted = useSimulationStore((s) => s.markPracticalCompleted);

  const [selectedPracticalId, setSelectedPracticalId] = useState<string>('p1');
  const [showViva, setShowViva] = useState<Record<number, boolean>>({});

  if (!isPracticalsOpen) return null;

  const currentIndex = TURTLEBOT3_PRACTICALS.findIndex((p) => p.id === selectedPracticalId);
  const currentPractical = TURTLEBOT3_PRACTICALS[currentIndex >= 0 ? currentIndex : 0];

  const completedCount = Object.values(completedPracticals).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / TURTLEBOT3_PRACTICALS.length) * 100);

  const toggleViva = (idx: number) => {
    setShowViva((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedPracticalId(TURTLEBOT3_PRACTICALS[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < TURTLEBOT3_PRACTICALS.length - 1) {
      setSelectedPracticalId(TURTLEBOT3_PRACTICALS[currentIndex + 1].id);
    }
  };

  const handleResetExperiment = () => {
    setEnvironment(currentPractical.environment);
    resetSimulation();
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
      {/* Header with Progress Tracker & Close */}
      <div className="bg-[#2a2a2a] px-4 py-2.5 flex items-center justify-between border-b border-[#3c3c3c] select-none">
        <div className="flex items-center space-x-3 text-white font-bold text-sm">
          <BookOpen className="text-amber-400" size={18} />
          <span>TurtleBot3 Practical Laboratory (8 Curriculum Experiments)</span>
        </div>

        {/* Laboratory Progress Bar */}
        <div className="hidden md:flex items-center space-x-3 bg-[#1e1e22] px-3 py-1 rounded border border-[#3e4048]">
          <span className="text-[11px] text-gray-400">Progress:</span>
          <div className="w-24 bg-[#333] h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-emerald-400 font-mono font-bold text-xs">{completedCount}/8 ({progressPercent}%)</span>
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
          <div className="text-[10px] uppercase font-bold text-gray-400 px-2 py-1 tracking-wider flex items-center justify-between">
            <span>Curriculum Experiments</span>
            <span className="text-emerald-400">{completedCount}/8 Done</span>
          </div>

          {TURTLEBOT3_PRACTICALS.map((prac) => {
            const isSelected = prac.id === selectedPracticalId;
            const isCompleted = Boolean(completedPracticals[prac.id]);

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
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isSelected
                      ? 'bg-[#3498db] text-white'
                      : 'bg-[#333] text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check size={11} /> : prac.number}
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
          {/* Top Bar inside content: Nav buttons & Reset */}
          <div className="flex items-center justify-between border-b border-[#333] pb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-2.5 py-1 bg-[#2b2b2b] hover:bg-[#383838] disabled:opacity-40 rounded text-xs flex items-center space-x-1 border border-[#444]"
              >
                <ArrowLeft size={12} />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === TURTLEBOT3_PRACTICALS.length - 1}
                className="px-2.5 py-1 bg-[#2b2b2b] hover:bg-[#383838] disabled:opacity-40 rounded text-xs flex items-center space-x-1 border border-[#444]"
              >
                <span>Next</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleResetExperiment}
                className="px-2.5 py-1 bg-[#3a3f4a] hover:bg-[#4b5260] text-amber-300 rounded text-xs flex items-center space-x-1 border border-[#555]"
                title="Reset environment and robot pose for this practical"
              >
                <RotateCcw size={12} />
                <span>Reset Experiment</span>
              </button>

              <button
                onClick={() => markPracticalCompleted(currentPractical.id, !completedPracticals[currentPractical.id])}
                className={`px-3 py-1 rounded text-xs font-bold flex items-center space-x-1 ${
                  completedPracticals[currentPractical.id]
                    ? 'bg-emerald-700 text-white hover:bg-emerald-600'
                    : 'bg-[#333] text-gray-300 hover:bg-[#444] border border-[#555]'
                }`}
              >
                <Check size={12} />
                <span>{completedPracticals[currentPractical.id] ? 'Completed ✓' : 'Mark as Completed'}</span>
              </button>
            </div>
          </div>

          {/* Title & Aim */}
          <div>
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              PRACTICAL {currentPractical.number} OF 8
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
