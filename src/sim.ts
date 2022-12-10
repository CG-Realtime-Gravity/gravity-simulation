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
    // this.removeMassesOutsideCanvas()
    for (const mass of this.masses) {
      if (mass.fixedPos) continue
      this.bounceMassesOffScreen(mass)

      let total_force_x = 0
      let total_force_y = 0
      mass.isColliding = false
      for (const other_mass of this.masses) {
        if (mass.pos.x === other_mass.pos.x && mass.pos.y == other_mass.pos.y)
          continue
        const r = Math.sqrt(
          Math.pow(mass.pos.x - other_mass.pos.x, 2) +
            Math.pow(mass.pos.y - other_mass.pos.y, 2)
        )
        if (r <= mass.r + other_mass.r) {
          continue
        }
        // check if mass collides with other_mass
        // const r_squared =
        //   Math.pow(mass.pos.x - other_mass.pos.x, 2) +
        //   Math.pow(mass.pos.y - other_mass.pos.y, 2)
        // const r = Math.sqrt(r_squared)
        // let v_x = 0
        // let v_y = 0
        // if (r <= mass.r + other_mass.r) {
        //   // console.log(mass.vel)
        //   // mass.vel.x = -mass.vel.x / (1 + Math.log(mass.vel.x))
        //   // mass.vel.y = -mass.vel.y / (1 + Math.log(mass.vel.y))
        //   // other_mass.vel.x =
        //   //   -other_mass.vel.x / (1 + Math.log(other_mass.vel.x))
        //   // other_mass.vel.y =
        //   //   -other_mass.vel.y / (1 + Math.log(other_mass.vel.y))
        //   // inelastic collision
        //   const m1 = mass.kg
        //   const m2 = other_mass.kg
        //   const v1 = mass.vel
        //   const v2 = other_mass.vel
        //   const v1f = {
        //     x: (v1.x * (m1 - m2) + 2 * m2 * v2.x) / (m1 + m2),
        //     y: (v1.y * (m1 - m2) + 2 * m2 * v2.y) / (m1 + m2),
        //   }
        //   const v2f = {
        //     x: (v2.x * (m2 - m1) + 2 * m1 * v1.x) / (m1 + m2),
        //     y: (v2.y * (m2 - m1) + 2 * m1 * v1.y) / (m1 + m2),
        //   }
        //   v_x += v1f.x * 0.9
        //   v_y += v1f.y * 0.9
        //   other_mass.vel.x = v2f.x * 0.9
        //   other_mass.vel.y = v2f.y * 0.9
        //   mass.isColliding = true
        // }
        // mass.vel.x = v_x !== 0 ? v_x : mass.vel.x
        // mass.vel.y = v_y !== 0 ? v_y : mass.vel.y
        const { force_x, force_y } = this.calc_force(mass, other_mass)
        total_force_x += force_x
        total_force_y += force_y
      }
      // let collide_x = false
      // let collide_y = false
      // for (const other_mass of this.masses) {
      //   if (mass.isColliding == true) {
      //     console.log('=========================')
      //     break
      //   }
      //   if (mass.pos.x === other_mass.pos.x && mass.pos.y == other_mass.pos.y)
      //     continue
      //   const new_pos_x = mass.pos.x + mass.vel.x
      //   const new_pos_y = mass.pos.y + mass.vel.y
      //   const new_x_y_r_squared =
      //     Math.pow(new_pos_x - other_mass.pos.x, 2) +
      //     Math.pow(new_pos_y - other_mass.pos.y, 2)
      //   const new_x_r_squared =
      //     Math.pow(new_pos_x - other_mass.pos.x, 2) +
      //     Math.pow(mass.pos.y - other_mass.pos.y, 2)
      //   const new_y_r_squared =
      //     Math.pow(mass.pos.x - other_mass.pos.x, 2) +
      //     Math.pow(new_pos_y - other_mass.pos.y, 2)
      //   const max_r_squared = Math.pow(mass.r + other_mass.r, 2)
      //   if (new_x_y_r_squared < max_r_squared) {
      //     console.log(mass, 'collide x y')
      //     collide_x = true
      //     collide_y = true
      //     break
      //   } else if (new_x_r_squared < max_r_squared) {
      //     console.log(mass, 'collide x')
      //     collide_x = true
      //   } else if (new_y_r_squared < max_r_squared) {
      //     console.log(mass, 'collide y')
      //     collide_y = true
      //   }
      // }
      // total_force_x = collide_x ? 0 : total_force_x
      // total_force_y = collide_y ? 0 : total_force_y
      mass.pos.x += mass.vel.x
      mass.pos.y += mass.vel.y
      mass.vel.x += mass.acc.x
      mass.vel.y += mass.acc.y
      mass.acc.x = total_force_x / mass.kg
      mass.acc.y = total_force_y / mass.kg
    }
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
    if (!(mass.pos.x > 0 && mass.pos.x < this.canvas.width)) {
      mass.vel.x = -mass.vel.x
    }
    if (!(mass.pos.y > 0 && mass.pos.y < this.canvas.height)) {
      mass.vel.y = -mass.vel.y
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (const mass of this.masses) {
      mass.draw(this.ctx)
    }
  }
}
