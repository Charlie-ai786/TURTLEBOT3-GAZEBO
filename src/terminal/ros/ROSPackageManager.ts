export interface RosPackage {
  name: string;
  version: string;
  path: string;
  description: string;
}

export class ROSPackageManager {
  private static packages: Map<string, RosPackage> = new Map([
    [
      'turtlebot3',
      {
        name: 'turtlebot3',
        version: '1.2.6',
        path: '/opt/ros/noetic/share/turtlebot3',
        description: 'ROS packages for TurtleBot3 robot platform',
      },
    ],
    [
      'turtlebot3_gazebo',
      {
        name: 'turtlebot3_gazebo',
        version: '1.3.2',
        path: '/opt/ros/noetic/share/turtlebot3_gazebo',
        description: 'Gazebo simulation packages for TurtleBot3',
      },
    ],
    [
      'turtlebot3_slam',
      {
        name: 'turtlebot3_slam',
        version: '1.2.6',
        path: '/opt/ros/noetic/share/turtlebot3_slam',
        description: 'SLAM packages for TurtleBot3 (gmapping, cartographer, hector)',
      },
    ],
    [
      'turtlebot3_navigation',
      {
        name: 'turtlebot3_navigation',
        version: '1.2.6',
        path: '/opt/ros/noetic/share/turtlebot3_navigation',
        description: 'Navigation packages for TurtleBot3 using move_base and AMCL',
      },
    ],
    [
      'turtlebot3_teleop',
      {
        name: 'turtlebot3_teleop',
        version: '1.2.6',
        path: '/opt/ros/noetic/share/turtlebot3_teleop',
        description: 'Teleoperation node for TurtleBot3 using keyboard',
      },
    ],
    [
      'turtlebot3_description',
      {
        name: 'turtlebot3_description',
        version: '1.2.6',
        path: '/opt/ros/noetic/share/turtlebot3_description',
        description: 'URDF and mesh models for TurtleBot3 Burger, Waffle, and Waffle Pi',
      },
    ],
    [
      'turtlebot3_msgs',
      {
        name: 'turtlebot3_msgs',
        version: '1.0.1',
        path: '/opt/ros/noetic/share/turtlebot3_msgs',
        description: 'Custom message definitions for TurtleBot3',
      },
    ],
    [
      'geometry_msgs',
      {
        name: 'geometry_msgs',
        version: '1.13.1',
        path: '/opt/ros/noetic/share/geometry_msgs',
        description: 'Common geometric messages (Twist, Pose, Transform)',
      },
    ],
    [
      'sensor_msgs',
      {
        name: 'sensor_msgs',
        version: '1.13.1',
        path: '/opt/ros/noetic/share/sensor_msgs',
        description: 'Common sensor messages (LaserScan, Imu, Image)',
      },
    ],
    [
      'nav_msgs',
      {
        name: 'nav_msgs',
        version: '1.13.1',
        path: '/opt/ros/noetic/share/nav_msgs',
        description: 'Navigation messages (Odometry, Path, OccupancyGrid)',
      },
    ],
    [
      'roscpp',
      {
        name: 'roscpp',
        version: '1.16.0',
        path: '/opt/ros/noetic/share/roscpp',
        description: 'C++ client library for ROS',
      },
    ],
    [
      'rospy',
      {
        name: 'rospy',
        version: '1.16.0',
        path: '/opt/ros/noetic/share/rospy',
        description: 'Python client library for ROS',
      },
    ],
  ]);

  public static list(): RosPackage[] {
    return Array.from(this.packages.values());
  }

  public static find(packageName: string): string | null {
    const pkg = this.packages.get(packageName);
    return pkg ? pkg.path : null;
  }

  public static get(packageName: string): RosPackage | undefined {
    return this.packages.get(packageName);
  }
}

