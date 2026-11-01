import React from 'react';
import { Terminal, X, RefreshCw, Square, Minus, Maximize2, Minimize2, ChevronUp } from 'lucide-react';
import { ROSDistro } from '../types/terminal.types';
import { TerminalPanelState } from '../hooks/useTerminalLayout';

interface TerminalToolbarProps {
  currentPath: string;
  rosDistro: ROSDistro;
  onDistroChange: (distro: ROSDistro) => void;
  onClear: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onRestore: () => void;
  panelState: TerminalPanelState;
  isStreaming: boolean;
  onInterrupt: () => void;
}

export const TerminalToolbar: React.FC<TerminalToolbarProps> = ({
  currentPath,
  rosDistro,
  onDistroChange,
  onClear,
  onClose,
  onMinimize,
  onMaximize,
  onRestore,
  panelState,
  isStreaming,
  onInterrupt,
}) => {
  const displayPath =
    currentPath === '/home/ubuntu'
      ? '~'
      : currentPath.startsWith('/home/ubuntu/')
      ? '~/' + currentPath.slice('/home/ubuntu/'.length)
      : currentPath;

  return (
    <div className="bg-[#2d2d2d] px-3 py-1.5 flex items-center justify-between border-b border-[#3c3c3c] select-none text-xs flex-shrink-0">
      {/* Left: Traffic lights + path */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5">
          {/* Red = Close */}
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#e74c3c] hover:opacity-80 transition-opacity group relative"
            title="Close Terminal"
          >
            <X size={7} className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 text-[#6b0000]" />
          </button>
          {/* Yellow = Minimize */}
          <button
            onClick={panelState === 'minimized' ? onRestore : onMinimize}
            className="w-3 h-3 rounded-full bg-[#f39c12] hover:opacity-80 transition-opacity group relative"
            title={panelState === 'minimized' ? 'Restore Terminal' : 'Minimize Terminal'}
          >
            <Minus size={7} className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 text-[#6b4200]" />
          </button>
          {/* Green = Maximize/Restore */}
          <button
            onClick={panelState === 'maximized' ? onRestore : onMaximize}
            className="w-3 h-3 rounded-full bg-[#27ae60] hover:opacity-80 transition-opacity group relative"
            title={panelState === 'maximized' ? 'Restore Terminal' : 'Maximize Terminal'}
          >
            <Maximize2 size={6} className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 text-[#003d1e]" />
          </button>
        </div>

        <div className="flex items-center space-x-1.5 text-gray-300 font-semibold ml-2">
          <Terminal size={13} className="text-[#3498db] flex-shrink-0" />
          <span className="truncate max-w-[200px]">ubuntu@turtlebot3: {displayPath}</span>
          {isStreaming && (
            <span className="text-[10px] bg-red-900 text-red-300 px-1.5 py-0.5 rounded animate-pulse font-normal">
              STREAMING
            </span>
          )}
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-2">
        {/* ROS Distribution Selector */}
        <div className="flex items-center space-x-0.5 bg-[#1a1a1a] p-0.5 rounded border border-[#444] text-[10px]">
          <button
            onClick={() => onDistroChange('noetic')}
            className={`px-2 py-0.5 rounded transition-colors ${
              rosDistro === 'noetic'
                ? 'bg-[#2980b9] text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ROS 1
          </button>
          <button
            onClick={() => onDistroChange('humble')}
            className={`px-2 py-0.5 rounded transition-colors ${
              rosDistro === 'humble'
                ? 'bg-[#2980b9] text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ROS 2
          </button>
        </div>

        {/* Streaming interrupt button */}
        {isStreaming && (
          <button
            onClick={onInterrupt}
            className="flex items-center space-x-1 px-2 py-0.5 bg-red-700 hover:bg-red-600 text-white rounded text-[10px] font-semibold"
            title="Interrupt (Ctrl+C)"
          >
            <Square size={9} fill="currentColor" />
            <span>^C</span>
          </button>
        )}

        {/* Clear */}
        <button
          onClick={onClear}
          title="Clear screen (Ctrl+L)"
          className="p-1 hover:bg-[#444] rounded text-gray-500 hover:text-white transition-colors"
        >
          <RefreshCw size={11} />
        </button>

        {/* Minimize / Restore */}
        <button
          onClick={panelState === 'minimized' ? onRestore : onMinimize}
          title={panelState === 'minimized' ? 'Restore' : 'Minimize'}
          className="p-1 hover:bg-[#444] rounded text-gray-500 hover:text-white transition-colors"
        >
          {panelState === 'minimized' ? <ChevronUp size={12} /> : <Minus size={12} />}
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={panelState === 'maximized' ? onRestore : onMaximize}
          title={panelState === 'maximized' ? 'Restore size' : 'Maximize'}
          className="p-1 hover:bg-[#444] rounded text-gray-500 hover:text-white transition-colors"
        >
          {panelState === 'maximized' ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          title="Close terminal"
          className="p-1 hover:bg-[#c0392b] rounded text-gray-500 hover:text-white transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};
