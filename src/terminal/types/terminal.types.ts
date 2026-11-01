import { EnvironmentManager } from '../engine/EnvironmentManager';
import { VirtualFileSystem } from '../engine/VirtualFileSystem';
import { ProcessManager } from '../engine/ProcessManager';

export type OutputLineType = 'cmd' | 'output' | 'system' | 'error' | 'warning';

export interface TerminalOutputLine {
  id: string;
  type: OutputLineType;
  text: string;
}

export type ROSDistro = 'noetic' | 'humble';

export interface CommandContext {
  env: EnvironmentManager;
  fs: VirtualFileSystem;
  proc: ProcessManager;
  rosDistro: ROSDistro;
  setRosDistro: (distro: ROSDistro) => void;
  onEchoStart?: (topic: string, count?: number) => void;
  onEchoStop?: () => void;
  clearScreen: () => void;
  history: string[];
}

export interface CommandResult {
  exitCode: number;
  output?: string;
  error?: string;
  isStreaming?: boolean;
}

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: Map<string, FileNode>;
  permissions?: string;
  updatedAt: Date;
  size?: number;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  command: string;
  startTime: number;
  status: 'running' | 'stopped' | 'terminated';
  cleanup?: () => void;
}

