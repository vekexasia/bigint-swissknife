import {

  converter as defaultConverter
} from './converter/index.js'
import { type IConverter } from './converter/type.js'

export interface BigIntConverter {
  /**
   * Unsigned operations
   */
  readonly unsigned: {
    /**
     * Big-endian
     */
    readonly be: Convert
    /**
     * Little-endian
     */
    readonly le: Convert
  }
  /**
   * Signed operations
   */
  readonly signed: {
    /**
     * Big-endian
     */
    readonly be: Convert
    /**
     * Little-endian
     */
    readonly le: Convert
  }

}
export interface Convert {
  /**
   * Converts number into Uint8Array
   * @param num - number to convert
   * @param bytes - number of bytes the result should have
   * @throws RangeError if bytes is less than 1 or number does not fit into bytes
   * @returns Uint8Array
   */
  readonly toUint8Array: (num: bigint, bytes: number) => Uint8Array
  /**
   * Converts Uint8Array into number
   * @param arr - Uint8Array to convert
   * @returns number
   */
  readonly toBigInt: (arr: Uint8Array) => bigint
}

export function create (converter: IConverter): BigIntConverter {
  return {
    unsigned: {
      be: {
        toBigInt (arr: Uint8Array): bigint {
          return converter.toBigUIntBE(arr)
        },
        toUint8Array (num: bigint, bytes: number): Uint8Array {
          if (num < 0 || bytes <= 0) {
            throw new RangeError('requested bigint is negative or space bytes is')
          }
          return converter.toUint8ArrayBE(num, bytes)
        }
      },
      le: {
        toBigInt (arr: Uint8Array): bigint {
          return converter.toBigUIntLE(arr)
        },
        toUint8Array (num: bigint, bytes: number): Uint8Array {
          if (num < 0 || bytes <= 0) {
            throw new RangeError('requested bigint is negative or space bytes is')
          }
          return converter.toUint8ArrayLE(num, bytes)
        }
      }
    },

    signed: {
      be: {
        toBigInt (arr: Uint8Array): bigint {
          return fromIntBuf(
            arr,
            converter.toBigUIntBE
          )
        },
        toUint8Array (num: bigint, bytes: number): Uint8Array {
          return toIntBuf(num, bytes, converter.toUint8ArrayBE)
        }
      },
      le: {
        toBigInt (arr: Uint8Array): bigint {
          return fromIntBuf(
            arr,
            converter.toBigUIntLE
          )
        },
        toUint8Array (num: bigint, bytes: number): Uint8Array {
          return toIntBuf(num, bytes, converter.toUint8ArrayLE)
        }
      }
    }
  }
}

export const converter = create(defaultConverter)

// private functions

function toIntBuf (num: bigint, bytes: number, a: (x: bigint, width: number) => Uint8Array): Uint8Array {
  if (num >= 0n) {
    return a(num, bytes)
  }
  return a(2n ** BigInt(bytes * 8) + num, bytes)
}

function fromIntBuf (buf: Uint8Array, a: (x: Uint8Array) => bigint): bigint {
  const conv = a(buf)
  const mid = 2n ** BigInt(buf.length * 8 - 1)
  if (conv < mid) {
    return conv
  }
  return conv - (mid << 1n)
}
