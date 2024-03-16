import { bench, describe } from 'vitest'
import { converter, uncheckedConverter } from '../../src/index.js'
describe('arr', () => {
  describe('newArray', () => {
    bench('converter.be.toNewArray', () => {
      converter.unsigned.be.toNewArray(4611686018427387903n, 8)
    })
    bench('uncheckedConverter.bigEndianToNewArray', () => {
      uncheckedConverter.bigEndianToNewArray(4611686018427387903n, 8)
    })
  })
  describe('reuseArray', () => {
    const a = new Uint8Array(8);
    bench('converter.be.toArray', () => {
      converter.unsigned.be.toArray(4611686018427387903n, a);
    });
    bench('uncheckedConverter.bigEndianToArray', () => {
      uncheckedConverter.bigEndianToArray(4611686018427387903n, a);
    });
  })

});
