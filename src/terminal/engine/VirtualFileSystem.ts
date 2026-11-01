import { FileNode } from '../types/terminal.types';

export class VirtualFileSystem {
  private root: FileNode;

  constructor() {
    this.root = {
      name: '',
      type: 'directory',
      children: new Map(),
      permissions: 'drwxr-xr-x',
      updatedAt: new Date(),
    };

    this.initializeStandardFileSystem();
  }

  private initializeStandardFileSystem() {
    // Standard directories
    this.createDirectory('/bin', true);
    this.createDirectory('/usr/bin', true);
    this.createDirectory('/usr/local/bin', true);
    this.createDirectory('/etc/ros/rosdep', true);
    this.createDirectory('/var/log', true);
    this.createDirectory('/tmp', true);

    // Ubuntu Home directory
    this.createDirectory('/home/ubuntu/.ros/log', true);
    this.createDirectory('/home/ubuntu/catkin_ws/src/turtlebot3', true);
    this.createDirectory('/home/ubuntu/catkin_ws/src/turtlebot3_simulations', true);
    this.createDirectory('/home/ubuntu/catkin_ws/build', true);
    this.createDirectory('/home/ubuntu/catkin_ws/devel', true);

    this.createDirectory('/home/ubuntu/ros2_ws/src/turtlebot3_ros2', true);
    this.createDirectory('/home/ubuntu/ros2_ws/build', true);
    this.createDirectory('/home/ubuntu/ros2_ws/install', true);

    // ROS 1 Noetic share & binaries
    this.createDirectory('/opt/ros/noetic/bin', true);
    this.createDirectory('/opt/ros/noetic/share/turtlebot3_gazebo/launch', true);
    this.createDirectory('/opt/ros/noetic/share/turtlebot3_slam/launch', true);
    this.createDirectory('/opt/ros/noetic/share/turtlebot3_navigation/launch', true);
    this.createDirectory('/opt/ros/noetic/share/turtlebot3_teleop/launch', true);
    this.createDirectory('/opt/ros/noetic/share/turtlebot3_description/urdf', true);

    // ROS 2 Humble share & binaries
    this.createDirectory('/opt/ros/humble/bin', true);
    this.createDirectory('/opt/ros/humble/share/turtlebot3_gazebo/launch', true);
    this.createDirectory('/opt/ros/humble/share/turtlebot3_cartographer/launch', true);
    this.createDirectory('/opt/ros/humble/share/turtlebot3_navigation2/launch', true);

    // Create important initial files
    this.writeFile(
      '/home/ubuntu/.bashrc',
      `# ~/.bashrc: executed by bash(1) for non-login shells.
export TURTLEBOT3_MODEL=burger
export LDS_MODEL=LDS-01
source /opt/ros/noetic/setup.bash
source ~/catkin_ws/devel/setup.bash
`
    );

    this.writeFile(
      '/home/ubuntu/catkin_ws/src/CMakeLists.txt',
      `cmake_minimum_required(VERSION 3.0.2)
project(catkin_ws)
# Top level catkin workspace configuration
`
    );

    this.writeFile(
      '/home/ubuntu/catkin_ws/devel/setup.bash',
      `#!/usr/bin/env bash
# Catkin workspace overlay environment setup
export ROS_PACKAGE_PATH=/home/ubuntu/catkin_ws/src:$ROS_PACKAGE_PATH
`
    );

    this.writeFile(
      '/home/ubuntu/ros2_ws/install/setup.bash',
      `#!/usr/bin/env bash
# ROS 2 Colcon overlay environment setup
export AMENT_PREFIX_PATH=/home/ubuntu/ros2_ws/install:$AMENT_PREFIX_PATH
`
    );

    this.writeFile(
      '/home/ubuntu/map.yaml',
      `image: map.pgm
resolution: 0.050000
origin: [-10.000000, -10.000000, 0.000000]
negate: 0
occupied_thresh: 0.65
free_thresh: 0.196
`
    );

    this.writeFile(
      '/home/ubuntu/map.pgm',
      `P5
# CREATOR: Gmapping 2D SLAM
384 384
255
[Binary PGM Occupancy Grid Data - 384x384 cells]
`
    );

    this.writeFile(
      '/opt/ros/noetic/setup.bash',
      `#!/usr/bin/env bash
# ROS Noetic underlay environment setup
export ROS_DISTRO=noetic
export ROS_VERSION=1
export ROS_MASTER_URI=http://localhost:11311
export PATH=/opt/ros/noetic/bin:$PATH
export ROS_PACKAGE_PATH=/opt/ros/noetic/share:$ROS_PACKAGE_PATH
`
    );

    this.writeFile(
      '/opt/ros/humble/setup.bash',
      `#!/usr/bin/env bash
# ROS 2 Humble underlay environment setup
export ROS_DISTRO=humble
export ROS_VERSION=2
export ROS_DOMAIN_ID=30
export PATH=/opt/ros/humble/bin:$PATH
`
    );

    this.writeFile(
      '/opt/ros/noetic/share/turtlebot3_gazebo/launch/turtlebot3_world.launch',
      `<launch>
  <arg name="model" default="$(env TURTLEBOT3_MODEL)" doc="model type [burger, waffle, waffle_pi]"/>
  <arg name="x_pos" default="-2.0"/>
  <arg name="y_pos" default="-0.5"/>
  <arg name="z_pos" default="0.0"/>

  <include file="$(find gazebo_ros)/launch/empty_world.launch">
    <arg name="world_name" value="$(find turtlebot3_gazebo)/worlds/turtlebot3_world.world"/>
    <arg name="paused" value="false"/>
    <arg name="use_sim_time" value="true"/>
  </include>
</launch>
`
    );

    this.writeFile(
      '/opt/ros/noetic/share/turtlebot3_slam/launch/turtlebot3_slam.launch',
      `<launch>
  <arg name="model" default="$(env TURTLEBOT3_MODEL)"/>
  <arg name="slam_methods" default="gmapping"/>
  <include file="$(find turtlebot3_slam)/launch/turtlebot3_$(arg slam_methods).launch"/>
</launch>
`
    );

    this.writeFile(
      '/opt/ros/noetic/share/turtlebot3_navigation/launch/turtlebot3_navigation.launch',
      `<launch>
  <arg name="model" default="$(env TURTLEBOT3_MODEL)"/>
  <arg name="map_file" default="$(find turtlebot3_navigation)/maps/map.yaml"/>
  <node pkg="map_server" name="map_server" type="map_server" args="$(arg map_file)"/>
  <include file="$(find turtlebot3_navigation)/launch/amcl.launch"/>
  <include file="$(find turtlebot3_navigation)/launch/move_base.launch"/>
</launch>
`
    );

    this.writeFile(
      '/opt/ros/noetic/share/turtlebot3_teleop/launch/turtlebot3_teleop_key.launch',
      `<launch>
  <arg name="model" default="$(env TURTLEBOT3_MODEL)"/>
  <node pkg="turtlebot3_teleop" type="turtlebot3_teleop_key" name="turtlebot3_teleop_keyboard" output="screen"/>
</launch>
`
    );

    this.writeFile(
      '/opt/ros/humble/share/turtlebot3_gazebo/launch/turtlebot3_world.launch.py',
      `# ROS 2 Launch file for TurtleBot3 Gazebo World
import os
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription

def generate_launch_description():
    return LaunchDescription([])
`
    );

    this.writeFile(
      '/opt/ros/humble/share/turtlebot3_cartographer/launch/cartographer.launch.py',
      `# ROS 2 Launch file for Cartographer 2D SLAM
from launch import LaunchDescription

def generate_launch_description():
    return LaunchDescription([])
`
    );

    this.writeFile(
      '/opt/ros/humble/share/turtlebot3_navigation2/launch/navigation2.launch.py',
      `# ROS 2 Launch file for Navigation2
from launch import LaunchDescription

def generate_launch_description():
    return LaunchDescription([])
`
    );
  }

  /**
   * Resolves a target path relative to current working directory and ~ expansions
   */
  public resolvePath(cwd: string, targetPath?: string): string {
    if (!targetPath || targetPath.trim() === '') {
      return cwd;
    }

    let p = targetPath.trim();

    // Expand ~ to /home/ubuntu
    if (p === '~') {
      p = '/home/ubuntu';
    } else if (p.startsWith('~/')) {
      p = '/home/ubuntu/' + p.slice(2);
    }

    // If relative, prepend cwd
    const fullPath = p.startsWith('/') ? p : `${cwd === '/' ? '' : cwd}/${p}`;

    // Normalize path parts
    const parts = fullPath.split('/').filter(Boolean);
    const resolved: string[] = [];

    for (const part of parts) {
      if (part === '.') {
        continue;
      } else if (part === '..') {
        resolved.pop();
      } else {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/');
  }

  public getNode(absolutePath: string): FileNode | null {
    if (absolutePath === '/' || absolutePath === '') {
      return this.root;
    }

    const parts = absolutePath.split('/').filter(Boolean);
    let curr = this.root;

    for (const part of parts) {
      if (curr.type !== 'directory' || !curr.children) {
        return null;
      }
      const next = curr.children.get(part);
      if (!next) {
        return null;
      }
      curr = next;
    }

    return curr;
  }

  public isDirectory(path: string): boolean {
    const node = this.getNode(path);
    return node !== null && node.type === 'directory';
  }

  public isFile(path: string): boolean {
    const node = this.getNode(path);
    return node !== null && node.type === 'file';
  }

  public readFile(path: string): string | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'file') {
      return null;
    }
    return node.content ?? '';
  }

  public writeFile(path: string, content: string): boolean {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return false;

    const fileName = parts.pop()!;
    const parentDir = '/' + parts.join('/');

    const parentNode = this.getNode(parentDir);
    if (!parentNode || parentNode.type !== 'directory' || !parentNode.children) {
      return false;
    }

    let fileNode = parentNode.children.get(fileName);
    if (fileNode && fileNode.type === 'directory') {
      return false;
    }

    if (!fileNode) {
      fileNode = {
        name: fileName,
        type: 'file',
        content,
        permissions: '-rw-r--r--',
        updatedAt: new Date(),
        size: content.length,
      };
      parentNode.children.set(fileName, fileNode);
    } else {
      fileNode.content = content;
      fileNode.updatedAt = new Date();
      fileNode.size = content.length;
    }

    return true;
  }

  public createDirectory(path: string, recursive: boolean = false): boolean {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return true;

    let curr = this.root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!curr.children) {
        curr.children = new Map();
      }

      let child = curr.children.get(part);
      if (!child) {
        if (!recursive && i < parts.length - 1) {
          return false;
        }
        child = {
          name: part,
          type: 'directory',
          children: new Map(),
          permissions: 'drwxr-xr-x',
          updatedAt: new Date(),
        };
        curr.children.set(part, child);
      } else if (child.type !== 'directory') {
        return false;
      }
      curr = child;
    }
    return true;
  }

  public remove(path: string, recursive: boolean = false): boolean {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return false; // Cannot remove root

    const targetName = parts.pop()!;
    const parentDir = '/' + parts.join('/');
    const parent = this.getNode(parentDir);

    if (!parent || parent.type !== 'directory' || !parent.children) {
      return false;
    }

    const target = parent.children.get(targetName);
    if (!target) return false;

    if (target.type === 'directory' && target.children && target.children.size > 0 && !recursive) {
      return false; // Directory not empty
    }

    return parent.children.delete(targetName);
  }

  public listDirectory(
    path: string
  ): Array<{ name: string; isDir: boolean; size: number; updatedAt: Date; permissions: string }> | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'directory' || !node.children) {
      return null;
    }

    const result: Array<{ name: string; isDir: boolean; size: number; updatedAt: Date; permissions: string }> = [];
    for (const [name, child] of node.children.entries()) {
      result.push({
        name,
        isDir: child.type === 'directory',
        size: child.size ?? (child.content ? child.content.length : 4096),
        updatedAt: child.updatedAt,
        permissions: child.permissions ?? (child.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--'),
      });
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  public find(startPath: string, namePattern?: string): string[] {
    const results: string[] = [];
    const traverse = (currentPath: string) => {
      const node = this.getNode(currentPath);
      if (!node) return;

      if (!namePattern || node.name.includes(namePattern)) {
        results.push(currentPath);
      }

      if (node.type === 'directory' && node.children) {
        for (const [name] of node.children.entries()) {
          const childPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
          traverse(childPath);
        }
      }
    };

    traverse(startPath);
    return results;
  }

  /**
   * Generates auto-completion options for a path prefix
   */
  public getCompletions(cwd: string, partial: string): string[] {
    let searchDir = cwd;
    let filePrefix = partial;

    if (partial.includes('/')) {
      const lastSlashIdx = partial.lastIndexOf('/');
      const dirPart = partial.slice(0, lastSlashIdx) || '/';
      filePrefix = partial.slice(lastSlashIdx + 1);
      searchDir = this.resolvePath(cwd, dirPart);
    }

    const items = this.listDirectory(searchDir);
    if (!items) return [];

    return items
      .filter((item) => item.name.startsWith(filePrefix))
      .map((item) => {
        const itemPath = partial.includes('/')
          ? partial.slice(0, partial.lastIndexOf('/') + 1) + item.name
          : item.name;
        return item.isDir ? `${itemPath}/` : itemPath;
      });
  }
}

