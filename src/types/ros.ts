// ROS Types and Messages

export interface RosHeader {
  seq: number;
  stamp: {
    secs: number;
    nsecs: number;
  };
  frame_id: string;
}

export interface RosVector3 {
  x: number;
  y: number;
  z: number;
}

export interface RosQuaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface RosTwist {
  linear: RosVector3;
  angular: RosVector3;
}

export interface RosLaserScan {
  header: RosHeader;
  angle_min: number;
  angle_max: number;
  angle_increment: number;
  time_increment: number;
  scan_time: number;
  range_min: number;
  range_max: number;
  ranges: number[];
  intensities: number[];
}

export interface RosPose {
  position: RosVector3;
  orientation: RosQuaternion;
}

export interface RosPoseWithCovariance {
  pose: RosPose;
  covariance: number[];
}

export interface RosTwistWithCovariance {
  twist: RosTwist;
  covariance: number[];
}

export interface RosOdometry {
  header: RosHeader;
  child_frame_id: string;
  pose: RosPoseWithCovariance;
  twist: RosTwistWithCovariance;
}

export interface RosTransformStamped {
  header: RosHeader;
  child_frame_id: string;
  transform: {
    translation: RosVector3;
    rotation: RosQuaternion;
  };
}

export interface RosTFMessage {
  transforms: RosTransformStamped[];
}

export interface RosOccupancyGrid {
  header: RosHeader;
  info: {
    map_load_time: { secs: number; nsecs: number };
    resolution: number;
    width: number;
    height: number;
    origin: RosPose;
  };
  data: number[];
}

export interface RosPath {
  header: RosHeader;
  poses: Array<{
    header: RosHeader;
    pose: RosPose;
  }>;
}

export interface RosImu {
  header: RosHeader;
  orientation: RosQuaternion;
  orientation_covariance: number[];
  angular_velocity: RosVector3;
  angular_velocity_covariance: number[];
  linear_acceleration: RosVector3;
  linear_acceleration_covariance: number[];
}

export interface TopicInfo {
  name: string;
  type: string;
  publishers: string[];
  subscribers: string[];
  hz: number;
  lastMessage: unknown;
  messageCount: number;
}

