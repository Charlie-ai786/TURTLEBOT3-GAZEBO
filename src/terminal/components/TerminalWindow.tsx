import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSimulationStore } from '../../state/simulationStore';
import { rosBus } from '../../ros/messageBus';
import { EnvironmentManager } from '../engine/EnvironmentManager';
import { VirtualFileSystem } from '../engine/VirtualFileSystem';
import { ProcessManager } from '../engine/ProcessManager';
import { CommandHistory } from '../engine/CommandHistory';
import { CommandDispatcher } from '../engine/CommandDispatcher';
import { CommandContext, ROSDistro, TerminalOutputLine } from '../types/terminal.types';
import { TerminalToolbar } from './TerminalToolbar';
import { TerminalOutput } from './TerminalOutput';
import { TerminalInput } from './TerminalInput';
import { ResizeHandle } from './ResizeHandle';
import { useTerminalLayout, useVerticalResize } from '../hooks/useTerminalLayout';

export const TerminalWindow: React.FC = () => {
  const toggleTerminal = useSimulationStore((s) => s.toggleTerminal);

  // ── Layout / resize state ──────────────────────────────────────────────────
  const { layout, setHeight, minimize, maximize, restore, MIN_HEIGHT, getMaxHeight } =
    useTerminalLayout();

  const { handlePointerDown, handlePointerMove, handlePointerUp } = useVerticalResize(
    layout.height,
    setHeight,
    MIN_HEIGHT,
    getMaxHeight
  );

  // ── Terminal engine singletons ─────────────────────────────────────────────
  const env = useMemo(() => new EnvironmentManager('noetic'), []);
  const fs = useMemo(() => new VirtualFileSystem(), []);
  const proc = useMemo(() => new ProcessManager(), []);
  const history = useMemo(() => new CommandHistory(), []);

  const [rosDistro, setRosDistro] = useState<ROSDistro>('noetic');
  const [currentPath, setCurrentPath] = useState<string>('/home/ubuntu');
  const [inputVal, setInputVal] = useState('');
  const [isStreamingEcho, setIsStreamingEcho] = useState<string | null>(null);
  const [echoRemaining, setEchoRemaining] = useState<number | null>(null);

  const [lines, setLines] = useState<TerminalOutputLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'Linux ubuntu-turtlebot 5.15.0-generic x86_64\nConnected to Simulated ROS Environment.',
    },
    {
      id: 'init-2',
      type: 'output',
      text: 'ROS_DISTRO=noetic | TURTLEBOT3_MODEL=burger | ROS_MASTER_URI=http://localhost:11311\nType "help" for a list of available Linux and ROS commands.',
    },
  ]);

  // ── Live topic echo subscription ───────────────────────────────────────────
  useEffect(() => {
    if (!isStreamingEcho) return;

    let received = 0;
    const unsub = rosBus.subscribeEcho(isStreamingEcho, (msgStr) => {
      received++;
      setLines((prev) => [
        ...prev,
        {
          id: `echo-${Date.now()}-${Math.random()}`,
          type: 'output',
          text: `---\n${msgStr}`,
        },
      ]);

      if (echoRemaining !== null && received >= echoRemaining) {
        setIsStreamingEcho(null);
        setEchoRemaining(null);
        setLines((prev) => [
          ...prev,
          {
            id: `done-${Date.now()}`,
            type: 'system',
            text: `[Stream finished after ${received} messages]`,
          },
        ]);
      } else if (received >= 30 && echoRemaining === null) {
        setIsStreamingEcho(null);
        setLines((prev) => [
          ...prev,
          {
            id: `stop-${Date.now()}`,
            type: 'system',
            text: `[Echo auto-paused after 30 messages. Ctrl+C or Enter to return to prompt]`,
          },
        ]);
      }
    });

    return () => unsub();
  }, [isStreamingEcho, echoRemaining]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleInterrupt = useCallback(() => {
    if (isStreamingEcho) {
      setIsStreamingEcho(null);
      setEchoRemaining(null);
      setLines((prev) => [
        ...prev,
        { id: `stop-${Date.now()}`, type: 'system', text: '^C (Process interrupted)' },
      ]);
      return;
    }

    const foreground = proc.getForegroundProcess();
    if (foreground) {
      proc.terminateForegroundProcess();
      setLines((prev) => [
        ...prev,
        { id: `stop-${Date.now()}`, type: 'system', text: `^C [PID ${foreground.pid} terminated]` },
      ]);
    } else {
      setLines((prev) => [
        ...prev,
        { id: `stop-${Date.now()}`, type: 'system', text: '^C' },
      ]);
    }
    setInputVal('');
  }, [isStreamingEcho, proc]);

  const handleDistroSwitch = useCallback(
    (distro: ROSDistro) => {
      setRosDistro(distro);
      env.syncRosDistro(distro);
      const notice =
        distro === 'noetic'
          ? 'Environment switched to ROS 1 Noetic (ROS_MASTER_URI=http://localhost:11311).'
          : 'Environment switched to ROS 2 Humble (ROS_DOMAIN_ID=30, DDS discovery active).';
      setLines((prev) => [
        ...prev,
        { id: `distro-${Date.now()}`, type: 'system', text: notice },
      ]);
    },
    [env]
  );

  const getPromptString = useCallback((): string => {
    const cwd = env.get('PWD') || currentPath;
    const shortCwd =
      cwd === '/home/ubuntu'
        ? '~'
        : cwd.startsWith('/home/ubuntu/')
        ? '~/' + cwd.slice('/home/ubuntu/'.length)
        : cwd;
    return `ubuntu@turtlebot3:${shortCwd}$`;
  }, [env, currentPath]);

  const handleCommandSubmit = useCallback(
    (rawCmd: string) => {
      const trimmed = rawCmd.trim();
      if (isStreamingEcho) {
        setIsStreamingEcho(null);
        setEchoRemaining(null);
        return;
      }

      if (!trimmed) {
        setLines((prev) => [
          ...prev,
          { id: `cmd-${Date.now()}`, type: 'cmd', text: `${getPromptString()} ` },
        ]);
        return;
      }

      history.add(trimmed);
      setInputVal('');

      const promptStr = getPromptString();
      const outputLinesToAdd: TerminalOutputLine[] = [
        { id: `cmd-${Date.now()}`, type: 'cmd', text: `${promptStr} ${rawCmd}` },
      ];

      const context: CommandContext = {
        env,
        fs,
        proc,
        rosDistro,
        setRosDistro: handleDistroSwitch,
        clearScreen: () => setLines([]),
        history: history.getAll(),
        onEchoStart: (topic, count) => {
          setIsStreamingEcho(topic);
          setEchoRemaining(count ?? null);
        },
        onEchoStop: () => {
          setIsStreamingEcho(null);
          setEchoRemaining(null);
        },
      };

      const results = CommandDispatcher.execute(rawCmd, context);

      for (const res of results) {
        if (res.error) {
          outputLinesToAdd.push({
            id: `err-${Date.now()}-${Math.random()}`,
            type: 'error',
            text: res.error,
          });
        }
        if (res.output) {
          outputLinesToAdd.push({
            id: `out-${Date.now()}-${Math.random()}`,
            type: res.isStreaming ? 'system' : 'output',
            text: res.output,
          });
        }
      }

      setCurrentPath(env.get('PWD') || '/home/ubuntu');
      setLines((prev) => [...prev, ...outputLinesToAdd]);
    },
    [isStreamingEcho, history, getPromptString, env, fs, proc, rosDistro, handleDistroSwitch]
  );

  const handleTabComplete = useCallback(() => {
    if (!inputVal) return;

    const tokens = inputVal.split(' ');
    const lastToken = tokens[tokens.length - 1];
    const cwd = env.get('PWD') || '/home/ubuntu';

    if (tokens.length === 1) {
      const candidateCommands = [
        'export', 'unset', 'echo', 'printenv', 'env', 'pwd', 'cd', 'ls',
        'mkdir', 'touch', 'cat', 'head', 'tail', 'find', 'rm', 'clear',
        'history', 'whoami', 'hostname', 'date', 'uname', 'which', 'source',
        'help', 'roscore', 'rosnode', 'rostopic', 'rosservice', 'rosparam',
        'rospack', 'rosrun', 'roslaunch', 'ros2', 'colcon',
      ];
      const matches = candidateCommands.filter((c) => c.startsWith(lastToken));

      if (matches.length === 1) {
        setInputVal(matches[0] + ' ');
      } else if (matches.length > 1) {
        setLines((prev) => [
          ...prev,
          { id: `tab-${Date.now()}`, type: 'system', text: matches.join('  ') },
        ]);
      }
      return;
    }

    const pathCompletions = fs.getCompletions(cwd, lastToken);
    if (pathCompletions.length === 1) {
      tokens[tokens.length - 1] = pathCompletions[0];
      setInputVal(tokens.join(' '));
    } else if (pathCompletions.length > 1) {
      setLines((prev) => [
        ...prev,
        { id: `tab-${Date.now()}`, type: 'system', text: pathCompletions.join('  ') },
      ]);
    }
  }, [inputVal, env, fs]);

  // ── Render ─────────────────────────────────────────────────────────────────
  // NOTE: isTerminalOpen guard lives in App.tsx – this component is only
  // mounted when the terminal is open, so we never need to return null here.

  const isMinimized = layout.panelState === 'minimized';

  return (
    /*
     * In-flow flex child — NOT position:fixed.
     * Height is set explicitly so the parent flex column (App) can size the
     * workspace viewport to exactly the remaining space with zero black gaps.
     *
     * When minimized, height collapses to 'auto' (just the toolbar row).
     * When normal/maximized, height = layout.height (clamped by useTerminalLayout).
     */
    <div
      className="flex flex-col flex-shrink-0 bg-[#1e1e1e] border-t border-[#555] font-mono text-xs w-full overflow-hidden"
      style={{
        height: isMinimized ? 'auto' : layout.height,
        minHeight: isMinimized ? 0 : MIN_HEIGHT,
        maxHeight: isMinimized ? 'none' : `${getMaxHeight()}px`,
        transition: layout.panelState !== 'normal' ? 'height 0.15s ease' : 'none',
        userSelect: 'none',
      }}
    >
      {/* ── Resize handle (top edge) – pointer-capture drag ── */}
      {!isMinimized && (
        <ResizeHandle
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      )}

      {/* ── Toolbar (always visible even when minimized) ── */}
      <TerminalToolbar
        currentPath={currentPath}
        rosDistro={rosDistro}
        onDistroChange={handleDistroSwitch}
        onClear={() => setLines([])}
        onClose={toggleTerminal}
        onMinimize={minimize}
        onMaximize={maximize}
        onRestore={restore}
        panelState={layout.panelState}
        isStreaming={isStreamingEcho !== null}
        onInterrupt={handleInterrupt}
      />

      {/* ── Body (output + input) hidden when minimized ── */}
      {!isMinimized && (
        <div className="flex flex-col flex-1 min-h-0 select-text overflow-hidden">
          <TerminalOutput lines={lines} />
          <TerminalInput
            promptText={getPromptString()}
            value={inputVal}
            onChange={setInputVal}
            onSubmit={handleCommandSubmit}
            onHistoryUp={() => {
              const prev = history.getPrevious();
              if (prev !== null) setInputVal(prev);
            }}
            onHistoryDown={() => {
              const next = history.getNext();
              if (next !== null) setInputVal(next);
            }}
            onTabComplete={handleTabComplete}
            onInterrupt={handleInterrupt}
            onClear={() => setLines([])}
            placeholder={
              isStreamingEcho
                ? 'Streaming topic data... Press Ctrl+C or Enter to stop'
                : 'Enter Bash/ROS command (e.g. export TURTLEBOT3_MODEL=burger, rostopic list)...'
            }
          />
        </div>
      )}
    </div>
  );
};
