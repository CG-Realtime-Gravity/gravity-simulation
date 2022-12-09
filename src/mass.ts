import type { Vec2 } from './vec2'

export class Mass {
  pos: Vec2
  vel: Vec2
  size: number

  constructor(
    public config: {
      size: number
      pos: Vec2
      vel: Vec2
    }
  ) {
    this.pos = config.pos
    this.vel = config.vel
    this.size = config.size
  }
}
