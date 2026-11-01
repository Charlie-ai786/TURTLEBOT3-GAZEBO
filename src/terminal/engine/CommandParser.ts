import { EnvironmentManager } from './EnvironmentManager';

export interface ParsedCommandLine {
  raw: string;
  command: string;
  args: string[];
  flags: Set<string>;
  options: Map<string, string>;
  positional: string[];
}

export class CommandParser {
  /**
   * Splits a command string into individual commands delimited by ';' or '&&'
   */
  public static splitCommands(input: string): string[] {
    const commands: string[] = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
        current += char;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
        current += char;
      } else if (!inSingleQuote && !inDoubleQuote) {
        if (char === ';') {
          if (current.trim()) commands.push(current.trim());
          current = '';
          continue;
        } else if (char === '&' && input[i + 1] === '&') {
          if (current.trim()) commands.push(current.trim());
          current = '';
          i++; // Skip second &
          continue;
        } else {
          current += char;
        }
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      commands.push(current.trim());
    }

    return commands;
  }

  /**
   * Tokenizes a single command line into arguments, expanding variables when appropriate
   */
  public static tokenize(input: string, env: EnvironmentManager): string[] {
    const tokens: string[] = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (char === '\\') {
        const nextChar = input[i + 1];
        if (nextChar === '"' || nextChar === "'" || nextChar === '$') {
          current += nextChar;
          i++;
        } else if (nextChar === '\\') {
          current += '\\';
          i++;
        } else {
          current += '\\';
        }
        continue;
      }

      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
        // In single quotes, content is literal
        continue;
      }

      if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
        // In double quotes, variables are expanded later
        continue;
      }

      if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
        if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      if (!inSingleQuote && char === '$') {
        // Variable expansion
        let varName = '';
        if (input[i + 1] === '{') {
          const closeIdx = input.indexOf('}', i + 2);
          if (closeIdx !== -1) {
            varName = input.slice(i + 2, closeIdx);
            i = closeIdx;
          }
        } else {
          const match = input.slice(i + 1).match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
          if (match) {
            varName = match[0];
            i += varName.length;
          }
        }

        if (varName) {
          current += env.get(varName) ?? '';
        } else {
          current += '$';
        }
        continue;
      }

      current += char;
    }

    if (current.length > 0) {
      tokens.push(current);
    }

    return tokens;
  }

  /**
   * Parses tokenized command into flags, options, and positional args
   */
  public static parse(raw: string, env: EnvironmentManager): ParsedCommandLine {
    const tokens = this.tokenize(raw.trim(), env);
    if (tokens.length === 0) {
      return {
        raw,
        command: '',
        args: [],
        flags: new Set(),
        options: new Map(),
        positional: [],
      };
    }

    const command = tokens[0];
    const args = tokens.slice(1);
    const flags = new Set<string>();
    const options = new Map<string, string>();
    const positional: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        const optPart = arg.slice(2);
        if (optPart.includes('=')) {
          const [k, v] = optPart.split('=');
          options.set(k, v);
        } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          options.set(optPart, args[i + 1]);
          i++;
        } else {
          flags.add(optPart);
        }
      } else if (arg.startsWith('-') && arg.length > 1) {
        // Check if single flag that expects argument (e.g., -n 5 or -r 10)
        if (
          (arg === '-n' || arg === '-r' || arg === '-f') &&
          i + 1 < args.length &&
          !args[i + 1].startsWith('-')
        ) {
          options.set(arg.slice(1), args[i + 1]);
          i++;
        } else {
          // Combined flags (e.g., -la -> -l, -a)
          for (let c = 1; c < arg.length; c++) {
            flags.add(arg[c]);
          }
        }
      } else {
        positional.push(arg);
      }
    }

    return {
      raw,
      command,
      args,
      flags,
      options,
      positional,
    };
  }
}

