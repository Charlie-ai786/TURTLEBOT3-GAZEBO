import {
  RosTwist,
  RosLaserScan,
  RosOdometry,
  TopicInfo,
} from '../types/ros';

type TopicCallback = (message: any) => void;

class RosMessageBus {
  private topics: Map<string, TopicInfo> = new Map();
  private subscribers: Map<string, Set<TopicCallback>> = new Map();
  private echoListeners: Map<string, Set<(formattedMsg: string) => void>> = new Map();

  constructor() {
    this.registerStandardTopics();
  }

  private registerStandardTopics() {
    const standardTopics: Array<{ name: string; type: string; publishers: string[]; subscribers: string[] }> = [
      { name: '/cmd_vel', type: 'geometry_msgs/Twist', publishers: ['/teleop_keyboard', '/move_base'], subscribers: ['/turtlebot3_core'] },
      { name: '/scan', type: 'sensor_msgs/LaserScan', publishers: ['/turtlebot3_lds'], subscribers: ['/slam_gmapping', '/move_base', '/rviz'] },
      { name: '/odom', type: 'nav_msgs/Odometry', publishers: ['/turtlebot3_core'], subscribers: ['/slam_gmapping', '/move_base', '/rviz'] },
      { name: '/tf', type: 'tf2_msgs/TFMessage', publishers: ['/robot_state_publisher', '/turtlebot3_core', '/slam_gmapping'], subscribers: ['/rviz', '/move_base'] },
      { name: '/tf_static', type: 'tf2_msgs/TFMessage', publishers: ['/robot_state_publisher'], subscribers: ['/rviz', '/move_base'] },
      { name: '/map', type: 'nav_msgs/OccupancyGrid', publishers: ['/slam_gmapping'], subscribers: ['/rviz', '/move_base'] },
      { name: '/imu', type: 'sensor_msgs/Imu', publishers: ['/turtlebot3_core'], subscribers: ['/robot_pose_ekf'] },
      { name: '/robot_description', type: 'std_msgs/String', publishers: ['/robot_state_publisher'], subscribers: ['/rviz'] },
      { name: '/move_base_simple/goal', type: 'geometry_msgs/PoseStamped', publishers: ['/rviz'], subscribers: ['/move_base'] },
      { name: '/move_base/GlobalPlanner/plan', type: 'nav_msgs/Path', publishers: ['/move_base'], subscribers: ['/rviz'] },
    ];

    for (const t of standardTopics) {
      this.topics.set(t.name, {
        name: t.name,
        type: t.type,
        publishers: t.publishers,
        subscribers: t.subscribers,
        hz: 0,
        lastMessage: null,
        messageCount: 0,
      });
      this.subscribers.set(t.name, new Set());
      this.echoListeners.set(t.name, new Set());
    }
  }

  public publish(topicName: string, message: any) {
    let topic = this.topics.get(topicName);
    if (!topic) {
      topic = {
        name: topicName,
        type: 'std_msgs/Any',
        publishers: ['/sim_node'],
        subscribers: [],
        hz: 0,
        lastMessage: null,
        messageCount: 0,
      };
      this.topics.set(topicName, topic);
      this.subscribers.set(topicName, new Set());
      this.echoListeners.set(topicName, new Set());
    }

    topic.lastMessage = message;
    topic.messageCount++;

    // Notify registered subscribers
    const subs = this.subscribers.get(topicName);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(message);
        } catch (e) {
          console.error(`Error in ROS callback for topic ${topicName}:`, e);
        }
      });
    }

    // Notify echo listeners
    const echoSubs = this.echoListeners.get(topicName);
    if (echoSubs && echoSubs.size > 0) {
      const formatted = this.formatMessageForEcho(topic.type, message);
      echoSubs.forEach((cb) => cb(formatted));
    }
  }

  public subscribe(topicName: string, callback: TopicCallback): () => void {
    if (!this.subscribers.has(topicName)) {
      this.subscribers.set(topicName, new Set());
    }
    this.subscribers.get(topicName)!.add(callback);
    return () => {
      this.subscribers.get(topicName)?.delete(callback);
    };
  }

  public subscribeEcho(topicName: string, callback: (formattedMsg: string) => void): () => void {
    if (!this.echoListeners.has(topicName)) {
      this.echoListeners.set(topicName, new Set());
    }
    this.echoListeners.get(topicName)!.add(callback);
    return () => {
      this.echoListeners.get(topicName)?.delete(callback);
    };
  }

  public getTopics(): TopicInfo[] {
    return Array.from(this.topics.values());
  }

  public getTopicInfo(topicName: string): TopicInfo | undefined {
    return this.topics.get(topicName);
  }

  private formatMessageForEcho(type: string, msg: any): string {
    if (!msg) return '---';

    if (type === 'geometry_msgs/Twist') {
      const t = msg as RosTwist;
      return `linear:\n  x: ${t.linear.x.toFixed(3)}\n  y: ${t.linear.y.toFixed(3)}\n  z: ${t.linear.z.toFixed(3)}\nangular:\n  x: ${t.angular.x.toFixed(3)}\n  y: ${t.angular.y.toFixed(3)}\n  z: ${t.angular.z.toFixed(3)}`;
    }

    if (type === 'sensor_msgs/LaserScan') {
      const s = msg as RosLaserScan;
      const sampleRanges = s.ranges ? s.ranges.slice(0, 5).map((r) => r.toFixed(2)).join(', ') : '';
      return `header:\n  seq: ${s.header.seq}\n  frame_id: "${s.header.frame_id}"\nangle_min: ${s.angle_min.toFixed(3)}\nangle_max: ${s.angle_max.toFixed(3)}\nrange_min: ${s.range_min.toFixed(2)}\nrange_max: ${s.range_max.toFixed(2)}\nranges: [${sampleRanges}, ... (${s.ranges ? s.ranges.length : 0} points)]`;
    }

    if (type === 'nav_msgs/Odometry') {
      const o = msg as RosOdometry;
      return `header:\n  seq: ${o.header.seq}\n  frame_id: "${o.header.frame_id}"\nchild_frame_id: "${o.child_frame_id}"\npose:\n  position: [x: ${o.pose.pose.position.x.toFixed(3)}, y: ${o.pose.pose.position.y.toFixed(3)}, z: 0.0]\n  yaw: ${(Math.atan2(2 * (o.pose.pose.orientation.w * o.pose.pose.orientation.z), 1 - 2 * (o.pose.pose.orientation.z * o.pose.pose.orientation.z)) * 180 / Math.PI).toFixed(1)}°\ntwist:\n  linear: ${o.twist.twist.linear.x.toFixed(3)} m/s\n  angular: ${o.twist.twist.angular.z.toFixed(3)} rad/s`;
    }

    if (type === 'geometry_msgs/PoseStamped') {
      return `header:\n  frame_id: "${msg.header?.frame_id || 'map'}"\npose:\n  position: [x: ${msg.pose?.position?.x.toFixed(2)}, y: ${msg.pose?.position?.y.toFixed(2)}]\n  orientation: [w: ${msg.pose?.orientation?.w.toFixed(2)}, z: ${msg.pose?.orientation?.z.toFixed(2)}]`;
    }

    if (type === 'sensor_msgs/Imu') {
      return `header:\n  seq: ${msg.header?.seq || 0}\n  frame_id: "${msg.header?.frame_id || 'imu_link'}"\norientation: [x: 0.0, y: 0.0, z: ${msg.orientation?.z?.toFixed(3) || 0.0}, w: ${msg.orientation?.w?.toFixed(3) || 1.0}]\nangular_velocity: [x: 0.0, y: 0.0, z: ${msg.angular_velocity?.z?.toFixed(3) || 0.0}]\nlinear_acceleration: [x: 0.0, y: 0.0, z: 9.810]`;
    }

    if (type === 'nav_msgs/OccupancyGrid') {
      return `header:\n  seq: ${msg.header?.seq || 0}\n  frame_id: "map"\ninfo:\n  resolution: ${msg.info?.resolution || 0.05}\n  width: ${msg.info?.width || 384}\n  height: ${msg.info?.height || 384}\ndata: [${msg.data?.length || 0} cells]`;
    }

    if (type === 'nav_msgs/Path') {
      return `header:\n  frame_id: "map"\nposes: [${msg.poses?.length || 0} waypoints]`;
    }

    try {
      return JSON.stringify(msg, null, 2);
    } catch {
      return String(msg);
    }
  }
}

export const rosBus = new RosMessageBus();

