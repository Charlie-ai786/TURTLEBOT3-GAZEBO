import { ProcessInfo } from '../types/terminal.types';

export class ProcessManager {
  private processes: Map<number, ProcessInfo> = new Map();
  private nextPid = 1000;
  private roscoreRunning = false;
  private foregroundProcess: ProcessInfo | null = null;

  constructor() {
    // Standard system processes
    this.addSystemProcess('systemd', '/sbin/init');
    this.addSystemProcess('bash', '/bin/bash');
  }

  private addSystemProcess(name: string, command: string): ProcessInfo {
    const pid = this.nextPid++;
    const proc: ProcessInfo = {
      pid,
      name,
      command,
      startTime: Date.now(),
      status: 'running',
    };
    this.processes.set(pid, proc);
    return proc;
  }

  public isRoscoreActive(): boolean {
    return this.roscoreRunning;
  }

  public startRoscore(): ProcessInfo {
    this.roscoreRunning = true;
    const masterProc = this.spawnProcess('roscore', 'roscore', () => {
      this.roscoreRunning = false;
    });
    this.spawnProcess('rosout', '/opt/ros/noetic/lib/rosout/rosout');
    return masterProc;
  }

  public stopRoscore(): void {
    this.roscoreRunning = false;
    for (const [pid, proc] of this.processes.entries()) {
      if (proc.name === 'roscore' || proc.name === 'rosout') {
        proc.status = 'terminated';
        if (proc.cleanup) proc.cleanup();
        this.processes.delete(pid);
      }
    }
  }

  public spawnProcess(name: string, command: string, cleanup?: () => void, isForeground = false): ProcessInfo {
    const pid = this.nextPid++;
    const proc: ProcessInfo = {
      pid,
      name,
      command,
      startTime: Date.now(),
      status: 'running',
      cleanup,
    };
    this.processes.set(pid, proc);
    if (isForeground) {
      this.foregroundProcess = proc;
    }
    return proc;
  }

  public killProcess(pid: number): boolean {
    const proc = this.processes.get(pid);
    if (!proc) return false;

    proc.status = 'terminated';
    if (proc.cleanup) {
      proc.cleanup();
    }
    this.processes.delete(pid);
    if (this.foregroundProcess?.pid === pid) {
      this.foregroundProcess = null;
    }
    return true;
  }

  public terminateForegroundProcess(): boolean {
    if (this.foregroundProcess) {
      const proc = this.foregroundProcess;
      this.killProcess(proc.pid);
      this.foregroundProcess = null;
      return true;
    }
    return false;
  }

  public getForegroundProcess(): ProcessInfo | null {
    return this.foregroundProcess;
  }

  public setForegroundProcess(proc: ProcessInfo | null): void {
    this.foregroundProcess = proc;
  }

  public listProcesses(): ProcessInfo[] {
    return Array.from(this.processes.values());
  }
}

