import { ROSDistro } from '../types/terminal.types';

export class EnvironmentManager {
  private vars: Map<string, string> = new Map();

  constructor(initialDistro: ROSDistro = 'noetic') {
    this.resetDefaults(initialDistro);
  }

  public resetDefaults(distro: ROSDistro = 'noetic') {
    this.vars.set('HOME', '/home/ubuntu');
    this.vars.set('USER', 'ubuntu');
    this.vars.set('SHELL', '/bin/bash');
    this.vars.set('PWD', '/home/ubuntu');
    this.vars.set('TURTLEBOT3_MODEL', 'burger');
    this.vars.set('LDS_MODEL', 'LDS-01');
    this.vars.set('TERM', 'xterm-256color');
    this.vars.set('LANG', 'en_US.UTF-8');
    this.vars.set('HOSTNAME', 'turtlebot3');

    this.syncRosDistro(distro);
  }

  public get(key: string): string | undefined {
    return this.vars.get(key);
  }

  public set(key: string, value: string): void {
    this.vars.set(key, value);
  }

  public unset(key: string): boolean {
    return this.vars.delete(key);
  }

  public has(key: string): boolean {
    return this.vars.has(key);
  }

  public getAll(): Record<string, string> {
    const obj: Record<string, string> = {};
    for (const [k, v] of this.vars.entries()) {
      obj[k] = v;
    }
    return obj;
  }

  /**
   * Syncs ROS distribution variables without wiping user-defined variables
   */
  public syncRosDistro(distro: ROSDistro): void {
    if (distro === 'noetic') {
      this.vars.set('ROS_DISTRO', 'noetic');
      this.vars.set('ROS_VERSION', '1');
      this.vars.set('ROS_MASTER_URI', 'http://localhost:11311');
      this.vars.set('ROS_PACKAGE_PATH', '/home/ubuntu/catkin_ws/src:/opt/ros/noetic/share');
      this.vars.set(
        'PATH',
        '/opt/ros/noetic/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
      );
      this.vars.delete('ROS_DOMAIN_ID');
    } else {
      this.vars.set('ROS_DISTRO', 'humble');
      this.vars.set('ROS_VERSION', '2');
      this.vars.set('ROS_DOMAIN_ID', '30');
      this.vars.set('ROS_PACKAGE_PATH', '/home/ubuntu/ros2_ws/src:/opt/ros/humble/share');
      this.vars.set(
        'PATH',
        '/opt/ros/humble/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
      );
      this.vars.delete('ROS_MASTER_URI');
    }
  }

  /**
   * Expands $VAR and ${VAR} patterns in input string using currently defined environment variables
   */
  public expandVariables(input: string): string {
    // Replace ${VAR} or $VAR
    return input.replace(/\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}|\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, group1, group2) => {
      const varName = group1 || group2;
      return this.vars.get(varName) ?? '';
    });
  }
}

