export class CommandHistory {
  private history: string[] = [];
  private index = -1;

  public add(cmd: string): void {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    // Don't add consecutive duplicates
    if (this.history.length > 0 && this.history[this.history.length - 1] === trimmed) {
      this.resetIndex();
      return;
    }
    this.history.push(trimmed);
    this.resetIndex();
  }

  public getPrevious(): string | null {
    if (this.history.length === 0) return null;
    if (this.index === -1) {
      this.index = this.history.length - 1;
    } else if (this.index > 0) {
      this.index--;
    }
    return this.history[this.index];
  }

  public getNext(): string | null {
    if (this.history.length === 0 || this.index === -1) return null;
    if (this.index < this.history.length - 1) {
      this.index++;
      return this.history[this.index];
    } else {
      this.index = -1;
      return '';
    }
  }

  public resetIndex(): void {
    this.index = -1;
  }

  public getAll(): string[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
    this.resetIndex();
  }
}

