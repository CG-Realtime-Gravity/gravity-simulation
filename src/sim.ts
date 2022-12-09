import type { Mass } from './mass'

export class Sim {
  private masses: Mass[] = []

  constructor() {}

  addMass(mass: Mass) {
    this.masses.push(mass)
  }

  addMassMany(masses: Mass[]) {
    this.masses.push(...masses)
  }

  update() {
    for (const mass of this.masses) {
      mass.pos.x += mass.vel.x
      mass.pos.y += mass.vel.y
    }
  }
}
