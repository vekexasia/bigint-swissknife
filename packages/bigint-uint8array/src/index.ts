import {

  converter as defaultConverter
} from './converter/index.js'
import { type IConverter } from './converter/type.js'
import {assertIntBoundaries, assertUIntBoundaries} from "@/utils.js";
export { type IConverter } from './converter/type.js'
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
   * Converts number into new Uint8Array
   * @param num - number to convert
   * @param bytes - number of bytes the result should have
   * @throws RangeError if bytes is less than 1 or number does not fit into bytes
   * @returns Uint8Array
   * @example
   * ```ts
   * converter.unsigned.be.toNewArray(1n, 2) // Uint8Array [ 0x00, 0x01 ]
   * converter.unsigned.be.toNewArray(-1n, 2) // RangeError: requested bigint is negative
   * converter.signed.be.toNewArray(-1n, 2) // Uint8Array [ 0xff, 0xff ]
   *
   *
   * ```
   */
  readonly toNewArray: (num: bigint, bytes: number) => Uint8Array
  /**
   * Converts number into Uint8Array
   * @param num - number to convert
   * @param dest - destination array
   * @throws RangeError if bigint does not fit into dest
   */
  readonly toArray: (num: bigint, dest: Uint8Array) => void
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
          return converter.arrayToBigEndian(arr)
        },
        toNewArray (num: bigint, bytes: number): Uint8Array {
          assertUIntBoundaries(num, bytes);
          return converter.bigEndianToNewArray(num, bytes)
        },
        toArray (num: bigint, dest: Uint8Array): void {
          assertUIntBoundaries(num, dest.length);
          converter.bigEndianToArray(num, dest)
        }
      },
      le: {
        toBigInt (arr: Uint8Array): bigint {
          return converter.arrayToLittleEndian(arr)
        },
        toNewArray (num: bigint, bytes: number): Uint8Array {
          assertUIntBoundaries(num, bytes);
          return converter.littleEndianToNewArray(num, bytes)
        },
        toArray (num: bigint, dest: Uint8Array): void {
          assertUIntBoundaries(num, dest.length);
          converter.littleEndianToArray(num, dest)
        }
      }
    },

    signed: {
      be: {
        toBigInt (arr: Uint8Array): bigint {
          return fromIntBuf(
            arr,
            converter.arrayToBigEndian
          )
        },
        toNewArray (num: bigint, bytes: number): Uint8Array {
          assertIntBoundaries(num, bytes);
          return toIntBuf(num, bytes, converter.bigEndianToNewArray)
        },
        toArray (num: bigint, dest: Uint8Array): void {
          assertIntBoundaries(num, dest.length);
          let newNum = num
          if (newNum < 0) {
            newNum = 2n ** BigInt(dest.length * 8) + num
          }
          converter.bigEndianToArray(newNum, dest)
        }
      },
      le: {
        toBigInt (arr: Uint8Array): bigint {
          return fromIntBuf(
            arr,
            converter.arrayToLittleEndian
          )
        },
        toNewArray (num: bigint, bytes: number): Uint8Array {
          assertIntBoundaries(num, bytes);
          return toIntBuf(num, bytes, converter.littleEndianToNewArray)
        },
        toArray (num: bigint, dest: Uint8Array): void {
          assertIntBoundaries(num, dest.length);
          let newNum = num
          if (newNum < 0) {
            newNum = 2n ** BigInt(dest.length * 8) + num
          }
          converter.littleEndianToArray(newNum, dest)
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
