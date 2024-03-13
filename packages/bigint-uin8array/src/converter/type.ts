export interface IConverter {
  toUint8ArrayBE: (buf: bigint, bytes: number) => Uint8Array
  toUint8ArrayLE: (buf: bigint, bytes: number) => Uint8Array
  toBigUIntLE: (num: Uint8Array) => bigint
  toBigUIntBE: (buf: Uint8Array) => bigint
}
