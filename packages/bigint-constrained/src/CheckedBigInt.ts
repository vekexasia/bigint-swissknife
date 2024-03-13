interface Bounds { min: bigint, max: bigint }
export class CheckedBigInt {
  readonly #bits: number
  public readonly value: bigint
  readonly boundaries: Bounds
  constructor (bits: number, value: bigint, signed: boolean | Bounds) {
    if (bits <= 0) {
      throw new RangeError('CheckedBigInt: bits must be greater than 0')
    }
    this.#bits = bits
    this.value = value
    if (typeof (signed) === 'boolean') {
      if (signed) {
        if (bits < 2) {
          throw new RangeError('CheckedBigInt: signed bit size must be at least 2')
        }
        this.boundaries = {
          min: -(2n ** BigInt(this.#bits - 1)),
          max: (2n ** BigInt(this.#bits - 1)) - 1n
        }
      } else {
        this.boundaries = {
          min: 0n,
          max: (2n ** BigInt(this.#bits)) - 1n
        }
      }
    } else {
      this.boundaries = signed
    }
    if (this.value > this.boundaries.max) {
      throw new RangeError(`CheckedBigInt: value ${this.value} exceeds bit size ${this.#bits} - max ${this.boundaries.max}`)
    }
    if (this.value < this.boundaries.min) {
      throw new RangeError(`CheckedBigInt: value ${this.value} exceeds bit size ${this.#bits} - min ${this.boundaries.min}`)
    }
  }

  checkedAdd (other: bigint): CheckedBigInt {
    return new CheckedBigInt(this.#bits, this.value + other, this.boundaries)
  }

  checkedSub (other: bigint): CheckedBigInt {
    return new CheckedBigInt(this.#bits, this.value - other, this.boundaries)
  }

  checkedMul (other: bigint): CheckedBigInt {
    return new CheckedBigInt(this.#bits, this.value * other, this.boundaries)
  }

  checkedPow (exponent: bigint): CheckedBigInt {
    return new CheckedBigInt(this.#bits, this.value ** exponent, this.boundaries)
  }

  checkedDiv (other: bigint): CheckedBigInt {
    if (other === 0n) {
      throw new RangeError('CheckedBigInt: division by zero')
    }
    if (this.boundaries.min !== 0n && this.value === this.boundaries.min && other === -1n) {
      throw new RangeError('CheckedBigInt: division overflow')
    }
    return new CheckedBigInt(this.#bits, this.value / other, this.boundaries)
  }

  checkedRem (other: bigint): CheckedBigInt {
    if (other === 0n) {
      throw new RangeError('CheckedBigInt: division by zero')
    }
    if (this.boundaries.min !== 0n && this.value === this.boundaries.min && other === -1n) {
      throw new RangeError('CheckedBigInt: division overflow')
    }
    return new CheckedBigInt(this.#bits, this.value % other, this.boundaries)
  }

  checkedShl (bits: number | bigint): CheckedBigInt {
    if (bits < 0n) {
      throw new RangeError('CheckedBigInt: shift count must be non-negative')
    }
    return new CheckedBigInt(this.#bits, this.value << BigInt(bits), this.boundaries)
  }

  checkedShr (bits: number | bigint): CheckedBigInt {
    if (bits < 0n) {
      throw new RangeError('CheckedBigInt: shift count must be non-negative')
    }
    if (bits > this.#bits) {
      throw new RangeError('CheckedBigInt: shift count must be less than bit size')
    }
    return new CheckedBigInt(this.#bits, this.value >> BigInt(bits), this.boundaries)
  }
}
