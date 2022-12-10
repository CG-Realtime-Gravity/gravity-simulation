import type { Vec2 } from './vec2'

export class Mass {
  pos: Vec2
  vel: Vec2
  acc: Vec2
  kg: number

  constructor(
    public config: {
      kg: number
      pos: Vec2
      vel: Vec2
    }
  ) {
    this.pos = config.pos
    this.kg = config.kg
    this.vel = config.vel
    this.acc = { x: 0, y: 0 }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, 5, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.fill()
  }
}
