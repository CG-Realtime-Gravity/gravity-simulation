import { Mass } from "./mass"

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
    // this.removeMassesOutsideCanvas()
    let deleted: number[] = []
    let new_masses: Mass[] = []
    for (const mass of this.masses) {
      if (deleted.includes(mass.id)) continue
      this.bounceMassesOffScreen(mass)
      let total_force_x = 0
      let total_force_y = 0
      mass.isColliding = false
      for (const other_mass of this.masses) {
        if (deleted.includes(mass.id)) break
        if (deleted.includes(other_mass.id)) continue
        if (mass.id === other_mass.id) continue
        // check if mass collides with other_mass
        const r = Math.sqrt(
          Math.pow(mass.pos.x - other_mass.pos.x, 2) +
            Math.pow(mass.pos.y - other_mass.pos.y, 2)
        )
        const max_r = mass.r + other_mass.r
        if (r <= max_r) {
          // combine masses
          new_masses.push(this.combineMasses(mass, other_mass))
          deleted.push(other_mass.id)
          deleted.push(mass.id)
          continue
        }
        const { force_x, force_y } = this.calc_force(mass, other_mass)
        total_force_x += force_x
        total_force_y += force_y
      }
      mass.pos.x += mass.vel.x
      mass.pos.y += mass.vel.y
      mass.pos.x += mass.vel.x
      mass.pos.y += mass.vel.y
      mass.vel.x += mass.acc.x
      mass.vel.y += mass.acc.y
      mass.acc.x = total_force_x / mass.kg
      mass.acc.y = total_force_y / mass.kg
    }
    this.masses = this.masses.filter((mass) => !deleted.includes(mass.id))
    this.masses = this.masses.concat(new_masses)
    new_masses = []
    this.draw()
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
    const v = {
      x: (m1 * v1.x + m2 * v2.x) / m,
      y: (m1 * v1.y + m2 * v2.y) / m,
    }
    const pos = {
      x: (m1 * mass1.pos.x + m2 * mass2.pos.x) / m,
      y: (m1 * mass1.pos.y + m2 * mass2.pos.y) / m,
    }
    return new Mass({ pos: pos, vel: v, kg: m })
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (const mass of this.masses) {
      mass.draw(this.ctx)
    }
  }
}
