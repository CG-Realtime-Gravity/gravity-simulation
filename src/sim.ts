import { Mass } from "./mass"
import { Vec2 } from "./vec2"

export type Mode = "normal" | "combine"
export type ColorMode = "size" | "gravity"

export class Sim {
  private masses: Mass[] = []
  private ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement
  private mode: Mode = "normal"
  private running = true
  private colorMode: ColorMode = "size"
  private resultantMin: number | null = null
  private resultantMax: number | null = null
  private particleCountOnChange: (count: number) => void = () => {}

  constructor() {}

  setMode(mode: Mode) {
    this.mode = mode
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
    setInterval(() => this.update(), 1000 / 1000)
  }

  reset() {
    this.masses = []
  }

  setParticleCountOnChange(cb: (count: number) => void) {
    this.particleCountOnChange = cb
  }

  update() {
    this.removeMassesOutsideCanvas()
    if (!this.running) {
      this.draw()
      return
    }

    const beforeParticleCount = this.masses.length

    let forceMin: number | null = null
    let forceMax: number | null = null

    let deleted: number[] = []
    let new_masses: Mass[] = []
    for (const mass of this.masses) {
      if (deleted.includes(mass.id)) continue
      if (mass.fixedPos) continue
      // const total_force = new Vec2(0, 0)
      // for (const other_mass of this.masses) {
      //   if (deleted.includes(mass.id)) break
      //   if (deleted.includes(other_mass.id)) continue
      //   if (mass.id === other_mass.id) continue
      //   // check if mass collides with other_mass
      //   if (this.mode === "combine") {
      //     const r = mass.pos.distanceFrom(other_mass.pos)
      //     const max_r = mass.r + other_mass.r
      //     if (r <= max_r) {
      //       // combine masses
      //       new_masses.push(this.combineMasses(mass, other_mass))
      //       deleted.push(other_mass.id)
      //       deleted.push(mass.id)
      //       continue
      //     }
      //   }
      //   total_force.addBy(this.calc_force(mass, other_mass))
      // }

      // mass.pos.addBy(mass.vel)
      // mass.vel.addBy(mass.acc)
      // total_force.divScalarBy(mass.kg)
      // mass.acc = total_force

      // mass.resultant = total_force.abs()

      // if (forceMin === null || forceMin > mass.resultant)
      //   forceMin = mass.resultant
      // if (forceMax === null || forceMax < mass.resultant)
      //   forceMax = mass.resultant
      // this.rkIterate(mass, this.masses)
      this.eulerIterate(mass, this.masses)
    }

    for (const mass of this.masses) {
      mass.updatePos()
    }

    this.resultantMin = forceMin
    this.resultantMax = forceMax

    this.masses = this.masses.filter((mass) => !deleted.includes(mass.id))
    this.masses = this.masses.concat(new_masses)
    new_masses = []
    this.draw()

    const afterParticleCount = this.masses.length
    if (beforeParticleCount !== afterParticleCount) {
      this.particleCountOnChange(afterParticleCount)
    }
  }

  private rkIterate(mass: Mass, masses: Mass[]) {
    // update mass acc
    const k1 = this.calcAccel(mass, mass.pos, masses)
    const k2 = this.calcAccel(mass, mass.pos.add(k1.mulScalar(0.5)), masses)
    const k3 = this.calcAccel(mass, mass.pos.add(k2.mulScalar(0.5)), masses)
    const k4 = this.calcAccel(mass, mass.pos.add(k3), masses)
    const acc = k1
      .add(k2.mulScalar(2))
      .add(k3.mulScalar(2))
      .add(k4)
      .divScalar(6)
    mass.acc = acc
  }

  private eulerIterate(mass: Mass, masses: Mass[]) {
    const accel = this.calcAccel(mass, mass.pos, masses)
    mass.deltaV = accel
    mass.deltaX = mass.vel.add(accel)
  }

  private removeMassesOutsideCanvas() {
    this.masses = this.masses.filter((mass) => {
      return (
        mass.pos.x > 0 &&
        mass.pos.x < this.canvas.width &&
        mass.pos.y > 0 &&
        mass.pos.y < this.canvas.height
      )
    })
  }

  private calcAccel(mass: Mass, pos: Vec2, masses: Mass[]): Vec2 {
    const total_force = new Vec2(0, 0)
    for (const other_mass of masses) {
      if (mass.id === other_mass.id) continue
      const force = this.calc_force(mass, other_mass)
      total_force.addBy(force)
    }
    return total_force.divScalar(mass.kg)
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

  private bounceMassesOffScreen(mass: Mass) {
    if (!(mass.pos.x > 0 && mass.pos.x < this.canvas.width))
      mass.vel.x = -mass.vel.x
    if (!(mass.pos.y > 0 && mass.pos.y < this.canvas.height))
      mass.vel.y = -mass.vel.y
  }

  private combineMasses(mass1: Mass, mass2: Mass) {
    const m1 = mass1.kg
    const m2 = mass2.kg
    const m = m1 + m2
    const v1 = mass1.vel
    const v2 = mass2.vel
    const v = new Vec2((m1 * v1.x + m2 * v2.x) / m, (m1 * v1.y + m2 * v2.y) / m)
    const pos = m1 > m2 ? mass1.pos : mass2.pos
    const fixedPos = m1 > m2 ? mass1.fixedPos : mass2.fixedPos
    return new Mass({ pos: pos, vel: v, kg: m, fixedPos: fixedPos })
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (const mass of this.masses) {
      mass.draw(this.ctx, this.colorMode, this.resultantMin, this.resultantMax)
    }
  }
}
