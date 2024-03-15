import { bench } from 'vitest'
import { converter } from '../../src/index.js'

bench('.be.toNewArray', () => {
  converter.unsigned.be.toNewArray(4611686018427387903n, 8)
})
bench('.le.toUint8Array', () => {
  converter.unsigned.le.toNewArray(9223372036854775807n, 5)
})

bench('.be.toBigInt', () => {
  converter.unsigned.be.toBigInt(Uint8Array.from([0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]))
})
bench('.be.toBigInt', () => {
  converter.unsigned.le.toBigInt(Uint8Array.from([0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]))
})
