import { maxAccel } from "./constant"
import { Mass } from "./mass"
import { Vec2 } from "./vec2"

export type Mode = "normal" | "combine"
export type ColorMode = "size" | "acceleration" | "none"

export class Sim {
  private masses: Mass[] = []
  private ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement
  private mode: Mode = "normal"
  private running = true
  private colorMode: ColorMode = "size"
  private accelMin = 0
  private accelMax = 0
  private particleCountOnChange: (count: number) => void = () => {}
  private onTimeElapsed: (t: number) => void = () => {}
  private drawHistory = true
  private elapsedTime = 0
  private historyLen = 100

  constructor() {}

  setMode(mode: Mode) {
    this.mode = mode
  }

  setOnTimeElapsed(cb: (t: number) => void) {
    this.onTimeElapsed = cb
  }

  setDrawHistory(drawHistory: boolean) {
    this.drawHistory = drawHistory
    if (!drawHistory) {
      for (const mass of this.masses) {
        mass.clearHistory()
      }
    }
  }

  setHistoryLength(len: number) {
    if (len !== this.historyLen) {
      for (const mass of this.masses) {
        mass.clearHistory()
      }
    }
    this.historyLen = len
  }

  setColorMode(mode: ColorMode) {
    this.colorMode = mode
  }

  setRunning(running: boolean) {
    this.running = running
  }

  addMass(mass: Mass) {
    this.masses.push(mass)
    this.particleCountOnChange(this.masses.length)
  }

  start(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    this.canvas = canvas
    setInterval(() => {
      this.update()
      this.elapsedTime += 1
      this.onTimeElapsed(this.elapsedTime)
    }, 1)
  }

  reset() {
    this.masses = []
    this.particleCountOnChange(this.masses.length)
  }

  setParticleCountOnChange(cb: (count: number) => void) {
    this.particleCountOnChange = cb
  }

  generatePresetJSON() {
    const strippedMasses = this.masses.map((mass) => ({
      kg: mass.kg,
      pos: mass.pos,
      fixedPos: mass.fixedPos,
      hasGravity: mass.hasGravity,
      vel: mass.vel,
    }))
    return JSON.stringify(strippedMasses)
  }

  importPreset(json: string) {
    const masses = JSON.parse(json)
    for (const mass of masses) {
      this.addMass(Mass.fromPreset(mass))
    }
    this.particleCountOnChange(this.masses.length)
  }

  update() {
    this.removeMassesIfTooFar()
    if (!this.running) {
      this.draw()
      return
    }

    const beforeParticleCount = this.masses.length

    let accelAbsMin: number | null = null
    let accelAbsMax: number | null = null

    let deleted: number[] = []
    let new_masses: Mass[] = []
    for (const mass of this.masses) {
      if (deleted.includes(mass.id)) continue
      if (mass.fixedPos) continue

      const { acc, acc_abs } = this.calcAccel(mass)
      mass.deltaV = acc
      mass.deltaX = mass.vel.add(acc)

      for (const other_mass of this.masses) {
        if (deleted.includes(mass.id)) break
        if (deleted.includes(other_mass.id)) continue
        if (mass.id === other_mass.id) continue
        // check if mass collides with other_mass
        if (this.mode === "combine") {
          const r = mass.pos.distanceFrom(other_mass.pos)
          const max_r = mass.r + other_mass.r
          if (r <= max_r && (mass.hasGravity || other_mass.hasGravity)) {
            // combine masses
            new_masses.push(this.combineMasses(mass, other_mass))
            deleted.push(other_mass.id)
            deleted.push(mass.id)
            continue
          }
        }
      }

      mass.acc_abs = 0
      if (!mass.fixedPos) {
        mass.acc_abs = acc_abs / mass.kg
        if (accelAbsMin === null || accelAbsMin > mass.acc_abs)
          accelAbsMin = mass.acc_abs
        if (accelAbsMax === null || accelAbsMax < mass.acc_abs)
          accelAbsMax = mass.acc_abs
      }
    }

    for (const mass of this.masses) {
      mass.updatePos(
        this.canvas,
        this.elapsedTime,
        this.drawHistory,
        this.historyLen
      )
    }

    this.accelMin = accelAbsMin
    this.accelMax = accelAbsMax

    this.masses = this.masses.filter((mass) => !deleted.includes(mass.id))
    this.masses = this.masses.concat(new_masses)
    new_masses = []
    this.draw()

    const afterParticleCount = this.masses.length
    if (beforeParticleCount !== afterParticleCount) {
      this.particleCountOnChange(afterParticleCount)
    }
  }

  private removeMassesIfTooFar() {
    const tooFarX = this.canvas.width * 3
    const tooFarY = this.canvas.height * 3
    const before = this.masses.length

    // if not more than 200 particles, don't remove
    if (before < 200) return

    this.masses = this.masses.filter((mass) => {
      return Math.abs(mass.pos.x) < tooFarX && Math.abs(mass.pos.y) < tooFarY
    })
    const after = this.masses.length
    if (before !== after) {
      this.particleCountOnChange(after)
    }
  }

  private calcAccel(mass: Mass) {
    const total_force = new Vec2(0, 0)
    for (const other_mass of this.masses) {
      if (mass.id === other_mass.id || !other_mass.hasGravity) continue
      const force = this.calc_force(mass, other_mass)
      total_force.addBy(force)
    }
    const acc = total_force.divScalar(mass.kg)
    let acc_abs = acc.abs()
    if (acc_abs > maxAccel) {
      acc.normalizeTo(maxAccel)
      acc_abs = maxAccel
    }
    return { acc, acc_abs }
  }

  private calc_force(mass1: Mass, mass2: Mass): Vec2 {
    // Gm1m2/r^2
    const m1 = mass1.kg
    const m2 = mass2.kg
    const r_squared = mass1.pos.distanceFromSq(mass2.pos)
    if (r_squared < mass1.r + mass2.r) return new Vec2(0, 0)
    const r = Math.sqrt(r_squared)
    // normalize G to 1 for performance
    const G = 1
    const force = (G * m1 * m2) / r_squared
    const force_x = (force * (mass2.pos.x - mass1.pos.x)) / r
    const force_y = (force * (mass2.pos.y - mass1.pos.y)) / r
    return new Vec2(force_x, force_y)
  }

  // private bounceMassesOffScreen(mass: Mass) {
  //   if (!(mass.pos.x > 0 && mass.pos.x < this.canvas.width))
  //     mass.vel.x = -mass.vel.x
  //   if (!(mass.pos.y > 0 && mass.pos.y < this.canvas.height))
  //     mass.vel.y = -mass.vel.y
  // }

  private combineMasses(mass1: Mass, mass2: Mass) {
    const m1 = mass1.kg
    const m2 = mass2.kg
    const m = m1 + m2
    const v1 = mass1.vel
    const v2 = mass2.vel
    const v = new Vec2((m1 * v1.x + m2 * v2.x) / m, (m1 * v1.y + m2 * v2.y) / m)
    const pos = m1 > m2 ? mass1.pos : mass2.pos
    const fixedPos = m1 > m2 ? mass1.fixedPos : mass2.fixedPos
    return new Mass({
      pos: pos,
      vel: v,
      kg: m,
      fixedPos: fixedPos,
      hasGravity: true,
    })
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (const mass of this.masses) {
      mass.draw(this.ctx, this.colorMode, this.accelMin, this.accelMax)
    }
  }
}
