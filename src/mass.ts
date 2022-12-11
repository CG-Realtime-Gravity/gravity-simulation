import { baseKg, maxAccel } from "./constant"
import type { ColorMode } from "./sim"
import { Vec2 } from "./vec2"

export class Mass {
  id: number
  pos: Vec2
  vel: Vec2
  acc: Vec2
  kg: number
  r: number
  fixedPos: boolean
  acc_abs: number
  deltaV: Vec2
  deltaX: Vec2

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
    this.acc = new Vec2(0, 0)
    this.r = Math.log2(this.kg / (baseKg / 2))
    // this.r = 20
    this.fixedPos = config.fixedPos
    this.acc_abs = 0
    this.deltaV = new Vec2(0, 0)
    this.deltaX = new Vec2(0, 0)
  }

  updatePos() {
    if (this.fixedPos) return
    // this.pos.addBy(this.vel)
    // this.vel.addBy(this.acc)
    this.pos.addBy(this.deltaX)
    this.vel.addBy(this.deltaV)
  }

  draw(
    ctx: CanvasRenderingContext2D,
    mode: ColorMode,
    accelMin: number,
    accelMax: number
  ) {
    if (mode === "size") {
      let hue = Math.floor(((this.r - 1) / (20 - 1)) * 330)
      if (hue > 330) hue = 330
      if (hue < 0) hue = 0
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
    } else if (mode === "acceleration") {
      let hue: number = 0
      if (!this.fixedPos) {
        const scaledMin = Math.log2(accelMin)
        const scaledMax = Math.log2(accelMax)
        const scaledAcc = Math.log2(this.acc_abs)
        hue = Math.floor(
          ((scaledAcc - scaledMin) / (scaledMax - scaledMin)) * 330
        )
      }
      console.log(hue)
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
    } else {
      ctx.fillStyle = "white"
    }
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2)
    ctx.fill()
  }
}
