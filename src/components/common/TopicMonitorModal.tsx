import React, { useState, useEffect } from 'react';
import { Activity, X, Radio, Play, Pause, Trash2 } from 'lucide-react';
import { useSimulationStore } from '../../state/simulationStore';
import { rosBus } from '../../ros/messageBus';
import { TopicInfo } from '../../types/ros';

export const TopicMonitorModal: React.FC = () => {
  const isTopicMonitorOpen = useSimulationStore((s) => s.isTopicMonitorOpen);
  const toggleTopicMonitor = useSimulationStore((s) => s.toggleTopicMonitor);

  const [topics, setTopics] = useState<TopicInfo[]>(() => rosBus.getTopics());
  const [selectedTopic, setSelectedTopic] = useState<string>('/cmd_vel');
  const [isMonitoringPaused, setIsMonitoringPaused] = useState(false);
  const [clearedTopics, setClearedTopics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isTopicMonitorOpen || isMonitoringPaused) return;

    const interval = setInterval(() => {
      setTopics(rosBus.getTopics());
    }, 400);

    return () => clearInterval(interval);
  }, [isTopicMonitorOpen, isMonitoringPaused]);

  if (!isTopicMonitorOpen) return null;

  const activeTopicInfo = topics.find((t) => t.name === selectedTopic) || topics[0];
  const isCleared = activeTopicInfo && clearedTopics[activeTopicInfo.name];

  const handleClearMessages = () => {
    if (activeTopicInfo) {
      setClearedTopics((prev) => ({ ...prev, [activeTopicInfo.name]: true }));
    }
  };

  const handleSelectTopic = (topicName: string) => {
    setSelectedTopic(topicName);
    // Un-clear when re-selecting or receiving new
    setClearedTopics((prev) => ({ ...prev, [topicName]: false }));
  };

  return (
    <div className="fixed inset-x-12 inset-y-10 z-50 bg-[#1e1e1e] border border-[#555] rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs text-[#dcdcdc] select-text font-mono">
      {/* Title Bar */}
      <div className="bg-[#2c3e50] px-4 py-2.5 flex items-center justify-between border-b border-[#34495e] select-none">
        <div className="flex items-center space-x-2 text-white font-bold text-sm">
          <Activity className="text-cyan-400" size={18} />
          <span>Simulated ROS Message Bus & Topic Monitor (rostopic GUI)</span>
        </div>

        {/* Action Controls: Pause/Resume, Clear, Close */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMonitoringPaused(!isMonitoringPaused)}
            className={`px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1 ${
              isMonitoringPaused
                ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                : 'bg-amber-700 hover:bg-amber-600 text-white'
            }`}
          >
            {isMonitoringPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
            <span>{isMonitoringPaused ? 'Resume Monitoring' : 'Pause Monitoring'}</span>
          </button>

          <button
            onClick={handleClearMessages}
            className="px-2 py-1 bg-[#3a3f4a] hover:bg-[#4b5260] text-gray-200 rounded text-xs flex items-center space-x-1 border border-[#555]"
            title="Clear current topic payload"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>

          <button
            onClick={toggleTopicMonitor}
            className="p-1 hover:bg-[#34495e] rounded text-gray-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className="bg-[#1a252f] px-4 py-1.5 border-b border-[#2c3e50] text-[11px] text-cyan-300 flex items-center justify-between font-sans">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isMonitoringPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
          <span>
            {isMonitoringPaused
              ? 'Monitoring is currently PAUSED. Live message updates frozen.'
              : 'Educational simulation layer publishing standard ROS messages.'}
          </span>
        </div>
        <span className="text-gray-400 font-mono text-[10px]">ROS Master: http://localhost:11311</span>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Topics List */}
        <div className="w-80 bg-[#16171d] border-r border-[#333] overflow-y-auto p-2 space-y-1 select-none">
          <div className="text-[10px] uppercase font-bold text-gray-400 px-2 py-1 tracking-wider">
            Active Topics ({topics.length})
          </div>

          {topics.map((t) => {
            const isSelected = t.name === selectedTopic;
            return (
              <div
                key={t.name}
                onClick={() => handleSelectTopic(t.name)}
                className={`p-2 rounded border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#2980b9] border-[#3498db] text-white'
                    : 'bg-[#21232a] border-transparent text-gray-300 hover:bg-[#2b2d36]'
                }`}
              >
                <div className="font-semibold text-[11px] truncate flex items-center space-x-1">
                  <Radio size={12} className={isSelected ? 'text-white' : 'text-emerald-400'} />
                  <span className="truncate">{t.name}</span>
                </div>
                <div className="text-[10px] text-gray-400 truncate mt-0.5">{t.type}</div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                  <span>Msgs: {t.messageCount}</span>
                  <span className="text-emerald-400 font-bold">Pubs: {t.publishers.length}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Topic Details & Live Message JSON */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#111215]">
          {activeTopicInfo ? (
            <>
              {/* Topic Metadata Header */}
              <div className="bg-[#1c1d22] p-3 rounded-lg border border-[#333] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">TOPIC NAME</div>
                    <div className="text-base font-bold text-green-400">{activeTopicInfo.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">MESSAGE TYPE</div>
                    <div className="text-xs text-cyan-300 font-bold">{activeTopicInfo.type}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2d2e35] text-[11px]">
                  <div>
                    <span className="text-gray-400 block font-bold mb-0.5">Publishers:</span>
                    <div className="text-yellow-400 space-y-0.5">
                      {activeTopicInfo.publishers.length > 0 ? (
                        activeTopicInfo.publishers.map((p, idx) => <div key={idx}>• {p}</div>)
                      ) : (
                        <div className="text-gray-500">None</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-bold mb-0.5">Subscribers:</span>
                    <div className="text-blue-400 space-y-0.5">
                      {activeTopicInfo.subscribers.length > 0 ? (
                        activeTopicInfo.subscribers.map((s, idx) => <div key={idx}>• {s}</div>)
                      ) : (
                        <div className="text-gray-500">None</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Message Payload */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-gray-400 text-[11px] font-bold">
                  <span>LATEST MESSAGE PAYLOAD (LIVE)</span>
                  <span className="text-emerald-400">Total Count: {activeTopicInfo.messageCount}</span>
                </div>
                <div className="bg-[#0a0a0c] p-3 rounded-lg border border-[#2a2b30] text-gray-300 overflow-x-auto max-h-96">
                  {isCleared ? (
                    <div className="text-gray-500 italic p-4 text-center">Payload log cleared. New messages will appear on next update.</div>
                  ) : activeTopicInfo.lastMessage ? (
                    <pre className="text-[11px] leading-relaxed">
                      {JSON.stringify(activeTopicInfo.lastMessage, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-gray-500 italic p-4 text-center">Awaiting messages on this topic...</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-center py-20">Select a topic from the left panel.</div>
          )}
        </div>
      </div>
    </div>
  );
};
