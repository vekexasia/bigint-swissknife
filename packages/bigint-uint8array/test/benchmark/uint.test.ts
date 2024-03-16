import { bench, describe } from 'vitest'
import { converter, uncheckedConverter, create } from '../../src/index.js'
import { uncheckedConverter as nativeConverter } from '../../src/converter/native.js'
import { uncheckedConverter as browserConverter } from '../../src/converter/browser.js'
describe('implementation', () => {
  const native = create(nativeConverter);
  const browser = create(browserConverter);
  describe('newArray', () => {
    bench('native', () => {
      native.unsigned.be.toNewArray(4611686018427387903n, 8)
    });
    bench('browser', () => {
      browser.unsigned.be.toNewArray(4611686018427387903n, 8)
    })
  });
  describe('reuseArray', () => {
    const a = new Uint8Array(8);
    bench('native', () => {
      native.unsigned.be.toArray(4611686018427387903n, a);
    });
    bench('browser', () => {
      browser.unsigned.be.toArray(4611686018427387903n, a);
    });

  });
})
describe('array', () => {
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
