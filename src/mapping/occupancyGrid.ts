import { LaserScanData, MapData, RobotState } from '../types/simulation';

export class OccupancyGridMap {
  public width: number;
  public height: number;
  public resolution: number; // meters per cell (e.g. 0.05m = 5cm)
  public originX: number; // world x corresponding to grid (0,0)
  public originY: number; // world y corresponding to grid (0,0)
  public data: Int8Array; // -1: unknown, 0: free, 100: occupied
  public logOdds: Float32Array; // log-odds accumulator
  public isMapping: boolean = true;

  // Log-odds constants
  private readonly l_occ = 0.85; // increment for occupied endpoint
  private readonly l_free = 0.4; // decrement for empty rays
  private readonly l_min = -3.5; // clamp minimum
  private readonly l_max = 4.0; // clamp maximum
  private readonly occ_threshold = 0.5; // log-odds threshold for occupied

  constructor(
    width: number = 200,
    height: number = 200,
    resolution: number = 0.05,
    originX: number = -5.0,
    originY: number = -5.0
  ) {
    this.width = width;
    this.height = height;
    this.resolution = resolution;
    this.originX = originX;
    this.originY = originY;

    this.data = new Int8Array(width * height);
    this.data.fill(-1); // all unknown initially

    this.logOdds = new Float32Array(width * height);
    this.logOdds.fill(0.0);
  }

  public reset() {
    this.data.fill(-1);
    this.logOdds.fill(0.0);
  }

  public worldToGrid(wx: number, wy: number): { gx: number; gy: number } | null {
    const gx = Math.floor((wx - this.originX) / this.resolution);
    const gy = Math.floor((wy - this.originY) / this.resolution);

    if (gx < 0 || gx >= this.width || gy < 0 || gy >= this.height) {
      return null;
    }
    return { gx, gy };
  }

  public gridToWorld(gx: number, gy: number): { wx: number; wy: number } {
    return {
      wx: this.originX + (gx + 0.5) * this.resolution,
      wy: this.originY + (gy + 0.5) * this.resolution,
    };
  }

  /**
   * Updates occupancy grid using a single laser scan and robot pose
   */
  public updateWithScan(robot: RobotState, scan: LaserScanData) {
    if (!this.isMapping) return;

    // LDS-01 sensor position on TurtleBot3
    const sensorCos = Math.cos(robot.heading);
    const sensorSin = Math.sin(robot.heading);
    const sensorX = robot.x - 0.032 * sensorCos;
    const sensorY = robot.y - 0.032 * sensorSin;

    const startCell = this.worldToGrid(sensorX, sensorY);
    if (!startCell) return;

    // Subsample rays for mapping performance (e.g. step by 2 rays = 180 rays)
    const step = Math.max(1, Math.floor(scan.ranges.length / 180));

    for (let i = 0; i < scan.ranges.length; i += step) {
      const range = scan.ranges[i];
      if (range < scan.rangeMin) continue;

      const angle = robot.heading + scan.angleMin + i * scan.angleIncrement;
      const isHit = range < scan.rangeMax - 0.05;
      const effectiveRange = isHit ? range : scan.rangeMax;

      const endWx = sensorX + Math.cos(angle) * effectiveRange;
      const endWy = sensorY + Math.sin(angle) * effectiveRange;

      const endCell = this.worldToGrid(endWx, endWy);
      if (!endCell) continue;

      // Ray-trace free cells along the beam
      this.traceRay(startCell.gx, startCell.gy, endCell.gx, endCell.gy, isHit);
    }
  }

  /**
   * Bresenham ray marching
   */
  private traceRay(x0: number, y0: number, x1: number, y1: number, hitObstacle: boolean) {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let cx = x0;
    let cy = y0;

    while (true) {
      const isEndpoint = cx === x1 && cy === y1;

      if (cx >= 0 && cx < this.width && cy >= 0 && cy < this.height) {
        const idx = cy * this.width + cx;

        if (isEndpoint && hitObstacle) {
          // Obstacle cell: increase log-odds
          this.logOdds[idx] = Math.min(this.l_max, this.logOdds[idx] + this.l_occ);
          this.data[idx] = this.logOdds[idx] > this.occ_threshold ? 100 : (this.logOdds[idx] < -this.occ_threshold ? 0 : -1);
        } else if (!isEndpoint) {
          // Free space cell: decrease log-odds
          this.logOdds[idx] = Math.max(this.l_min, this.logOdds[idx] - this.l_free);
          this.data[idx] = this.logOdds[idx] < -this.occ_threshold ? 0 : (this.logOdds[idx] > this.occ_threshold ? 100 : -1);
        }
      }

      if (isEndpoint) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
  }

  public getMapData(): MapData {
    return {
      width: this.width,
      height: this.height,
      resolution: this.resolution,
      originX: this.originX,
      originY: this.originY,
      data: new Int8Array(this.data),
      isMapping: this.isMapping,
    };
  }

  public exportYamlAndPgm(): { yaml: string; pgm: string } {
    const yaml = `image: map.pgm\nresolution: ${this.resolution.toFixed(3)}\norigin: [${this.originX.toFixed(2)}, ${this.originY.toFixed(2)}, 0.000000]\nnegate: 0\noccupied_thresh: 0.65\nfree_thresh: 0.196\n`;

    // Simple ASCII P2 PGM for portability
    let pgm = `P2\n# TurtleBot3 Gazebo Sim Export\n${this.width} ${this.height}\n255\n`;
    for (let y = this.height - 1; y >= 0; y--) {
      for (let x = 0; x < this.width; x++) {
        const val = this.data[y * this.width + x];
        // 0 -> free (254 white), 100 -> occ (0 black), -1 -> unknown (205 gray)
        const pixel = val === 0 ? 254 : val === 100 ? 0 : 205;
        pgm += `${pixel} `;
      }
      pgm += '\n';
    }

    return { yaml, pgm };
  }

  public importFromData(exported: { width: number; height: number; resolution: number; originX: number; originY: number; data: number[] }) {
    this.width = exported.width;
    this.height = exported.height;
    this.resolution = exported.resolution;
    this.originX = exported.originX;
    this.originY = exported.originY;
    this.data = new Int8Array(exported.data);
    this.logOdds = new Float32Array(this.width * this.height);
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] === 100) this.logOdds[i] = this.l_max;
      else if (this.data[i] === 0) this.logOdds[i] = this.l_min;
    }
  }
}

