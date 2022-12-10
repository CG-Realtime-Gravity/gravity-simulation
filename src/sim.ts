import type { Mass } from './mass'

export class Sim {
  private masses: Mass[] = []
  private ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement

  constructor() {}

  addMass(mass: Mass) {
    this.masses.push(mass)
  }

  addMassMany(masses: Mass[]) {
    this.masses.push(...masses)
  }

  start(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    this.canvas = canvas
    setInterval(() => this.update(), 1000 / 60)
  }

  update() {
    for (const mass of this.masses) {
      for (const other_mass of this.masses) {
        if (mass.pos.x === other_mass.pos.x && mass.pos.y == other_mass.pos.y)
          continue
        const { force_x, force_y } = this.calc_force(mass, other_mass)
        mass.acc.x = force_x / mass.kg
        mass.acc.y = force_y / mass.kg
      }
      mass.pos.x += mass.vel.x
      mass.pos.y += mass.vel.y
      mass.vel.x += mass.acc.x
      mass.vel.y += mass.acc.y
    }
    this.draw()
  }

  private calc_force(mass1: Mass, mass2: Mass) {
    // Gm1m2/r^2
    const G = 6.67408e-11
    const m1 = mass1.kg
    const m2 = mass2.kg
    const r_squared =
      Math.pow(mass1.pos.x - mass2.pos.x, 2) +
      Math.pow(mass1.pos.y - mass2.pos.y, 2)
    if (r_squared < 1) return { force_x: 0, force_y: 0 }
    const r = Math.sqrt(r_squared)
    const force = (G * m1 * m2) / r_squared
    const force_x = (force * (mass2.pos.x - mass1.pos.x)) / r
    const force_y = (force * (mass2.pos.y - mass1.pos.y)) / r
    return { force_x, force_y }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (const mass of this.masses) {
      mass.draw(this.ctx)
    }
  }
}
