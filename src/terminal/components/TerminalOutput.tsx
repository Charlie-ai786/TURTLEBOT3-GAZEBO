import React, { useRef, useEffect } from 'react';
import { TerminalOutputLine } from '../types/terminal.types';

interface TerminalOutputProps {
  lines: TerminalOutputLine[];
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ lines }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#0c0d10] text-[#dcdcdc] font-mono leading-relaxed select-text">
      {lines.map((line) => (
        <div key={line.id} className="whitespace-pre-wrap break-words">
          {line.type === 'cmd' ? (
            <span className="text-[#55ff55] font-semibold">{line.text}</span>
          ) : line.type === 'system' ? (
            <span className="text-[#00bcd4] italic">{line.text}</span>
          ) : line.type === 'error' ? (
            <span className="text-[#ff5555]">{line.text}</span>
          ) : line.type === 'warning' ? (
            <span className="text-[#ffb86c]">{line.text}</span>
          ) : (
            <span className="text-gray-300">{line.text}</span>
          )}
        </div>
      ))}
      <div ref={terminalEndRef} />
    </div>
  );
};

