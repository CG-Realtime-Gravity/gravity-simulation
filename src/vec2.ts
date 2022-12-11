export class Vec2 {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  abs(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  absSq(): number {
    return this.x * this.x + this.y * this.y
  }

  normalizeTo(length: number) {
    const abs = this.abs()
    this.x = (this.x / abs) * length
    this.y = (this.y / abs) * length
  }

  normalize(): Vec2 {
    const abs = this.abs()
    return new Vec2(this.x / abs, this.y / abs)
  }

  distanceFrom(other: Vec2): number {
    return Math.sqrt(
      Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2)
    )
  }

  distanceFromSq(other: Vec2): number {
    return Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2)
  }

  add(other: Vec2): Vec2 {
    return new Vec2(this.x + other.x, this.y + other.y)
  }

  addBy(other: Vec2): void {
    this.x += other.x
    this.y += other.y
  }

  sub(other: Vec2): Vec2 {
    return new Vec2(this.x - other.x, this.y - other.y)
  }

  subBy(other: Vec2): void {
    this.x -= other.x
    this.y -= other.y
  }

  mul(other: Vec2): Vec2 {
    return new Vec2(this.x * other.x, this.y * other.y)
  }

  mulBy(other: Vec2): void {
    this.x *= other.x
    this.y *= other.y
  }

  mulScalar(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar)
  }

  mulScalarBy(scalar: number): void {
    this.x *= scalar
    this.y *= scalar
  }

  divElemWise(other: Vec2): Vec2 {
    return new Vec2(this.x / other.x, this.y / other.y)
  }

  divElemWiseBy(other: Vec2): void {
    this.x /= other.x
    this.y /= other.y
  }

  divScalar(scalar: number): Vec2 {
    return new Vec2(this.x / scalar, this.y / scalar)
  }

  divScalarBy(scalar: number) {
    this.x /= scalar
    this.y /= scalar
  }
}
