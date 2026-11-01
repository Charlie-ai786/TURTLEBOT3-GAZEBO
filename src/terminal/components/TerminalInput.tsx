import React, { useRef, useEffect } from 'react';

interface TerminalInputProps {
  promptText: string;
  value: string;
  onChange: (val: string) => void;
  onSubmit: (cmd: string) => void;
  onHistoryUp: () => void;
  onHistoryDown: () => void;
  onTabComplete: () => void;
  onInterrupt: () => void;
  onClear: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  promptText,
  value,
  onChange,
  onSubmit,
  onHistoryUp,
  onHistoryDown,
  onTabComplete,
  onInterrupt,
  onClear,
  placeholder,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+C
    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      onInterrupt();
      return;
    }

    // Ctrl+L
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      onClear();
      return;
    }

    // Tab autocomplete
    if (e.key === 'Tab') {
      e.preventDefault();
      onTabComplete();
      return;
    }

    // Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit(value);
      return;
    }

    // Up arrow
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onHistoryUp();
      return;
    }

    // Down arrow
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onHistoryDown();
      return;
    }
  };

  return (
    <div
      className="bg-[#121316] border-t border-[#333] px-3 py-2 flex items-center space-x-2 font-mono text-xs cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <span className="text-[#55ff55] font-bold select-none">{promptText}</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder || 'Enter command (type "help" for options)...'}
        className="flex-1 bg-transparent text-white focus:outline-none placeholder-gray-600 font-mono text-xs"
        autoFocus
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
};

