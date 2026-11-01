export interface NodeDetail {
  name: string;
  publications: Array<{ topic: string; type: string }>;
  subscriptions: Array<{ topic: string; type: string }>;
  services: string[];
  pid: number;
}

export class ROSNodeManager {
  private static ros1Nodes: Map<string, NodeDetail> = new Map([
    [
      '/rosout',
      {
        name: '/rosout',
        publications: [{ topic: '/rosout_agg', type: 'rosgraph_msgs/Log' }],
        subscriptions: [{ topic: '/rosout', type: 'rosgraph_msgs/Log' }],
        services: ['/rosout/get_loggers', '/rosout/set_logger_level'],
        pid: 1422,
      },
    ],
    [
      '/turtlebot3_core',
      {
        name: '/turtlebot3_core',
        publications: [
          { topic: '/odom', type: 'nav_msgs/Odometry' },
          { topic: '/tf', type: 'tf2_msgs/TFMessage' },
          { topic: '/imu', type: 'sensor_msgs/Imu' },
        ],
        subscriptions: [{ topic: '/cmd_vel', type: 'geometry_msgs/Twist' }],
        services: ['/turtlebot3_core/get_loggers', '/turtlebot3_core/set_logger_level', '/reset_simulation'],
        pid: 1530,
      },
    ],
    [
      '/turtlebot3_lds',
      {
        name: '/turtlebot3_lds',
        publications: [{ topic: '/scan', type: 'sensor_msgs/LaserScan' }],
        subscriptions: [],
        services: ['/turtlebot3_lds/get_loggers', '/turtlebot3_lds/set_logger_level'],
        pid: 1545,
      },
    ],
    [
      '/robot_state_publisher',
      {
        name: '/robot_state_publisher',
        publications: [
          { topic: '/tf', type: 'tf2_msgs/TFMessage' },
          { topic: '/tf_static', type: 'tf2_msgs/TFMessage' },
          { topic: '/robot_description', type: 'std_msgs/String' },
        ],
        subscriptions: [{ topic: '/joint_states', type: 'sensor_msgs/JointState' }],
        services: ['/robot_state_publisher/get_loggers'],
        pid: 1550,
      },
    ],
    [
      '/slam_gmapping',
      {
        name: '/slam_gmapping',
        publications: [
          { topic: '/map', type: 'nav_msgs/OccupancyGrid' },
          { topic: '/map_metadata', type: 'nav_msgs/MapMetaData' },
          { topic: '/tf', type: 'tf2_msgs/TFMessage' },
        ],
        subscriptions: [
          { topic: '/scan', type: 'sensor_msgs/LaserScan' },
          { topic: '/tf', type: 'tf2_msgs/TFMessage' },
        ],
        services: ['/dynamic_map'],
        pid: 1580,
      },
    ],
    [
      '/move_base',
      {
        name: '/move_base',
        publications: [
          { topic: '/cmd_vel', type: 'geometry_msgs/Twist' },
          { topic: '/move_base/GlobalPlanner/plan', type: 'nav_msgs/Path' },
          { topic: '/move_base/status', type: 'actionlib_msgs/GoalStatusArray' },
        ],
        subscriptions: [
          { topic: '/move_base_simple/goal', type: 'geometry_msgs/PoseStamped' },
          { topic: '/scan', type: 'sensor_msgs/LaserScan' },
          { topic: '/odom', type: 'nav_msgs/Odometry' },
        ],
        services: ['/move_base/make_plan', '/move_base/clear_costmaps'],
        pid: 1610,
      },
    ],
  ]);

  private static ros2Nodes: Map<string, NodeDetail> = new Map([
    [
      '/turtlebot3_node',
      {
        name: '/turtlebot3_node',
        publications: [
          { topic: '/odom', type: 'nav_msgs/msg/Odometry' },
          { topic: '/tf', type: 'tf2_msgs/msg/TFMessage' },
          { topic: '/imu', type: 'sensor_msgs/msg/Imu' },
        ],
        subscriptions: [{ topic: '/cmd_vel', type: 'geometry_msgs/msg/Twist' }],
        services: ['/turtlebot3_node/describe_parameters', '/turtlebot3_node/get_parameters'],
        pid: 2100,
      },
    ],
    [
      '/turtlebot3_lds',
      {
        name: '/turtlebot3_lds',
        publications: [{ topic: '/scan', type: 'sensor_msgs/msg/LaserScan' }],
        subscriptions: [],
        services: ['/turtlebot3_lds/get_parameters'],
        pid: 2110,
      },
    ],
    [
      '/robot_state_publisher',
      {
        name: '/robot_state_publisher',
        publications: [
          { topic: '/tf', type: 'tf2_msgs/msg/TFMessage' },
          { topic: '/tf_static', type: 'tf2_msgs/msg/TFMessage' },
          { topic: '/robot_description', type: 'std_msgs/msg/String' },
        ],
        subscriptions: [{ topic: '/joint_states', type: 'sensor_msgs/msg/JointState' }],
        services: ['/robot_state_publisher/get_parameters'],
        pid: 2120,
      },
    ],
    [
      '/slam_toolbox',
      {
        name: '/slam_toolbox',
        publications: [{ topic: '/map', type: 'nav_msgs/msg/OccupancyGrid' }],
        subscriptions: [{ topic: '/scan', type: 'sensor_msgs/msg/LaserScan' }],
        services: ['/slam_toolbox/save_map'],
        pid: 2140,
      },
    ],
    [
      '/nav2_controller',
      {
        name: '/nav2_controller',
        publications: [{ topic: '/cmd_vel', type: 'geometry_msgs/msg/Twist' }],
        subscriptions: [{ topic: '/plan', type: 'nav_msgs/msg/Path' }],
        services: ['/nav2_controller/get_parameters'],
        pid: 2160,
      },
    ],
  ]);

  public static listNodes(distro: 'noetic' | 'humble'): string[] {
    const map = distro === 'noetic' ? this.ros1Nodes : this.ros2Nodes;
    return Array.from(map.keys());
  }

  public static getNodeInfo(nodeName: string, distro: 'noetic' | 'humble'): NodeDetail | undefined {
    const map = distro === 'noetic' ? this.ros1Nodes : this.ros2Nodes;
    return map.get(nodeName);
  }
}

