import { useSimulationStore } from '../../state/simulationStore';
import { EnvironmentManager } from '../engine/EnvironmentManager';

export class SimulationBridge {
  public static handleLaunch(
    pkg: string,
    file: string,
    _args: string[],
    env: EnvironmentManager
  ): { success: boolean; message: string } {
    const model = env.get('TURTLEBOT3_MODEL') || 'burger';

    if (pkg === 'turtlebot3_gazebo' || file.includes('world')) {
      return {
        success: true,
        message: `... logging to /home/ubuntu/.ros/log/turtlebot3_world.log
[${file}] Started!
Loading model: turtlebot3_${model} at initial pose (-2.0, -0.5, 0.0)
Gazebo Classic 11 physics engine active. Simulation time: ${(useSimulationStore.getState().simTime).toFixed(1)}s`,
      };
    }

    if (pkg === 'turtlebot3_slam' || file.includes('slam') || file.includes('cartographer')) {
      useSimulationStore.getState().startMapping();
      return {
        success: true,
        message: `[${file}] Started SLAM Gmapping node!
Subscribed to /scan and /odom.
Occupancy grid mapping is now ACTIVE!
Drive the robot using Teleop controls to discover and map the environment.`,
      };
    }

    if (pkg === 'turtlebot3_navigation' || file.includes('navigation')) {
      useSimulationStore.getState().setWorkspaceMode('rviz');
      return {
        success: true,
        message: `[${file}] Navigation stack initialized!
Loaded map_server, global_costmap, local_costmap, and move_base.
Switched view to RViz. Click "2D Nav Goal" on the RViz toolbar to send a navigation goal!`,
      };
    }

    if (pkg === 'turtlebot3_teleop' || file.includes('teleop')) {
      return {
        success: true,
        message: `------------------------------------------
Control Your TurtleBot3!
------------------------------------------
Moving around:
        w
   a    s    d
        x

w/x : increase/decrease linear velocity (max: 0.22 m/s)
a/d : increase/decrease angular velocity (max: 2.84 rad/s)
space key, s : emergency stop

Use the Teleoperation HUD or keyboard controls!`,
      };
    }

    return {
      success: true,
      message: `[${file}] Launched package ${pkg} successfully.`,
    };
  }

  public static handleRun(
    pkg: string,
    executable: string,
    args: string[],
    env: EnvironmentManager
  ): { success: boolean; message: string } {
    if (pkg === 'turtlebot3_teleop' || executable.includes('teleop')) {
      return this.handleLaunch('turtlebot3_teleop', 'turtlebot3_teleop_key', args, env);
    }

    return {
      success: true,
      message: `Running process [${executable}] from package [${pkg}] with PID ${Math.floor(2000 + Math.random() * 1000)}`,
    };
  }
}

