export class ROSParameterManager {
  private static params: Map<string, string> = new Map([
    ['/turtlebot3_model', 'burger'],
    ['/use_sim_time', 'true'],
    ['/run_id', 'd7e34b92-b4ea-11ef-8000-080027b4e9f1'],
    ['/wheel_radius', '0.033'],
    ['/wheel_base', '0.160'],
    ['/max_linear_speed', '0.22'],
    ['/max_angular_speed', '2.84'],
    ['/laser_scan_frequency', '5.0'],
    ['/robot_description', '<robot name="turtlebot3_burger"><link name="base_footprint"/></robot>'],
  ]);

  public static list(): string[] {
    return Array.from(this.params.keys());
  }

  public static get(paramName: string): string | null {
    const val = this.params.get(paramName);
    return val !== undefined ? val : null;
  }

  public static set(paramName: string, value: string): void {
    this.params.set(paramName, value);
  }

  public static delete(paramName: string): boolean {
    return this.params.delete(paramName);
  }

  public static dump(): string {
    const obj: Record<string, string> = {};
    for (const [k, v] of this.params.entries()) {
      obj[k] = v;
    }
    return JSON.stringify(obj, null, 2);
  }
}

