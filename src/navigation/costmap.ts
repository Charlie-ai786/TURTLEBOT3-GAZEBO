import { LaserScanData, MapData, RobotState } from '../types/simulation';

export class CostmapEngine {
  public width: number;
  public height: number;
  public resolution: number;
  public originX: number;
  public originY: number;

  public globalCostmap: Uint8Array; // 0-255
  public localCostmap: Uint8Array; // 0-255 (local window e.g. 60x60 = 3m x 3m)
  public localWidth: number = 60;
  public localHeight: number = 60;

  private readonly robotRadiusMeters = 0.11;
  private readonly inflationRadiusMeters = 0.35;
  private readonly lethalCost = 254;
  private readonly inscribedCost = 253;

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

    this.globalCostmap = new Uint8Array(width * height);
    this.localCostmap = new Uint8Array(this.localWidth * this.localHeight);
  }

  public updateGlobalCostmap(map: MapData) {
    this.globalCostmap.fill(0);
    const inflationCells = Math.ceil(this.inflationRadiusMeters / this.resolution);
    const inscribedCells = Math.ceil(this.robotRadiusMeters / this.resolution);

    // 1. Mark lethal obstacles from map
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const val = map.data[y * map.width + x];
        if (val === 100) {
          this.globalCostmap[y * this.width + x] = this.lethalCost;
        }
      }
    }

    // 2. Compute inflation around lethal cells
    const lethalIndices: number[] = [];
    for (let i = 0; i < this.globalCostmap.length; i++) {
      if (this.globalCostmap[i] === this.lethalCost) lethalIndices.push(i);
    }

    for (const idx of lethalIndices) {
      const ox = idx % this.width;
      const oy = Math.floor(idx / this.width);

      for (let dy = -inflationCells; dy <= inflationCells; dy++) {
        const cy = oy + dy;
        if (cy < 0 || cy >= this.height) continue;

        for (let dx = -inflationCells; dx <= inflationCells; dx++) {
          const cx = ox + dx;
          if (cx < 0 || cx >= this.width) continue;

          const distCells = Math.sqrt(dx * dx + dy * dy);
          if (distCells > inflationCells) continue;

          const targetIdx = cy * this.width + cx;
          if (this.globalCostmap[targetIdx] === this.lethalCost) continue;

          let cost = 0;
          if (distCells <= inscribedCells) {
            cost = this.inscribedCost;
          } else {
            // Exponential decay from inscribed to edge of inflation radius
            const factor = 1.0 - (distCells - inscribedCells) / (inflationCells - inscribedCells);
            cost = Math.floor(1 + factor * (this.inscribedCost - 1));
          }

          if (cost > this.globalCostmap[targetIdx]) {
            this.globalCostmap[targetIdx] = cost;
          }
        }
      }
    }
  }

  public updateLocalCostmap(robot: RobotState, scan: LaserScanData) {
    this.localCostmap.fill(0);
    const halfLocalW = Math.floor(this.localWidth / 2);
    const halfLocalH = Math.floor(this.localHeight / 2);

    // Center of local costmap in world coordinates matches robot position
    for (let i = 0; i < scan.ranges.length; i += 2) {
      const r = scan.ranges[i];
      if (r < scan.rangeMin || r >= scan.rangeMax - 0.05) continue;

      const angle = robot.heading + scan.angleMin + i * scan.angleIncrement;
      const hitWx = robot.x + Math.cos(angle) * r;
      const hitWy = robot.y + Math.sin(angle) * r;

      const relX = hitWx - robot.x;
      const relY = hitWy - robot.y;

      const localGx = Math.floor(relX / this.resolution) + halfLocalW;
      const localGy = Math.floor(relY / this.resolution) + halfLocalH;

      if (localGx >= 0 && localGx < this.localWidth && localGy >= 0 && localGy < this.localHeight) {
        this.localCostmap[localGy * this.localWidth + localGx] = this.lethalCost;
      }
    }
  }

  public getGlobalCost(gx: number, gy: number): number {
    if (gx < 0 || gx >= this.width || gy < 0 || gy >= this.height) return 255;
    return this.globalCostmap[gy * this.width + gx];
  }

  public isFree(gx: number, gy: number): boolean {
    return this.getGlobalCost(gx, gy) < 180;
  }
}

