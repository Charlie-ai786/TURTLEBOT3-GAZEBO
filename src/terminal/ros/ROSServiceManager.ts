import { useSimulationStore } from '../../state/simulationStore';

export interface ServiceDetail {
  name: string;
  type: string;
  handler?: (args?: string) => { success: boolean; message: string };
}

export class ROSServiceManager {
  private static services: Map<string, ServiceDetail> = new Map([
    [
      '/reset_simulation',
      {
        name: '/reset_simulation',
        type: 'std_srvs/Empty',
        handler: () => {
          useSimulationStore.getState().resetSimulation();
          return { success: true, message: 'Reset simulation executed successfully.' };
        },
      },
    ],
    [
      '/reset_world',
      {
        name: '/reset_world',
        type: 'std_srvs/Empty',
        handler: () => {
          useSimulationStore.getState().resetWorld();
          return { success: true, message: 'Reset world executed successfully.' };
        },
      },
    ],
    [
      '/gazebo/pause_physics',
      {
        name: '/gazebo/pause_physics',
        type: 'std_srvs/Empty',
        handler: () => {
          if (!useSimulationStore.getState().isPaused) {
            useSimulationStore.getState().togglePause();
          }
          return { success: true, message: 'Physics engine paused.' };
        },
      },
    ],
    [
      '/gazebo/unpause_physics',
      {
        name: '/gazebo/unpause_physics',
        type: 'std_srvs/Empty',
        handler: () => {
          if (useSimulationStore.getState().isPaused) {
            useSimulationStore.getState().togglePause();
          }
          return { success: true, message: 'Physics engine unpaused.' };
        },
      },
    ],
    [
      '/move_base/clear_costmaps',
      {
        name: '/move_base/clear_costmaps',
        type: 'std_srvs/Empty',
        handler: () => {
          useSimulationStore.getState().clearCostmaps();
          return { success: true, message: 'Costmaps cleared.' };
        },
      },
    ],
    [
      '/turtlebot3_core/get_loggers',
      {
        name: '/turtlebot3_core/get_loggers',
        type: 'roscpp/GetLoggers',
        handler: () => {
          return {
            success: true,
            message: 'loggers:\n  - name: "ros.turtlebot3_core"\n    level: "INFO"\n  - name: "ros.turtlebot3_core.sensors"\n    level: "INFO"',
          };
        },
      },
    ],
    [
      '/dynamic_map',
      {
        name: '/dynamic_map',
        type: 'nav_msgs/GetMap',
        handler: () => {
          const map = useSimulationStore.getState().mapData;
          return {
            success: true,
            message: `map:\n  header:\n    frame_id: "map"\n  info:\n    resolution: ${map.resolution}\n    width: ${map.width}\n    height: ${map.height}`,
          };
        },
      },
    ],
  ]);

  public static list(isRos2 = false): string[] {
    const srvs = Array.from(this.services.values());
    if (isRos2) {
      return srvs.map((s) => s.name);
    }
    return srvs.map((s) => s.name);
  }

  public static type(serviceName: string): string | null {
    const srv = this.services.get(serviceName);
    return srv ? srv.type : null;
  }

  public static call(serviceName: string, args?: string): { success: boolean; message: string } {
    const srv = this.services.get(serviceName);
    if (!srv) {
      return {
        success: false,
        message: `ERROR: Service [${serviceName}] is not available.`,
      };
    }

    if (srv.handler) {
      return srv.handler(args);
    }

    return {
      success: true,
      message: `Executed service [${serviceName}] with args: ${args || 'none'}`,
    };
  }
}

