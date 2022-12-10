import { baseKg } from "./constant"
import type { Vec2 } from "./vec2"

export class Mass {
  id: number
  pos: Vec2
  vel: Vec2
  acc: Vec2
  kg: number
  r: number
  fixedPos: boolean

  static count = 0

  constructor(
    public config: {
      kg: number
      pos: Vec2
      vel: Vec2
      fixedPos: boolean
    }
  ) {
    this.id = Mass.count++
    this.pos = config.pos
    this.kg = config.kg
    this.vel = config.vel
    this.acc = { x: 0, y: 0 }
    this.r = Math.log2(this.kg / (baseKg / 2))
    // this.r = 20
    this.fixedPos = config.fixedPos
  }

  draw(ctx: CanvasRenderingContext2D) {
    let hue = Math.floor(((this.r - 1) / (20 - 1)) * 330)
    if (hue > 330) hue = 330
    if (hue < 0) hue = 0
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2)
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
    ctx.fill()
  }
}
