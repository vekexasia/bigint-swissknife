import * as native from 'bigint-buffer'
import { type IConverter } from './type'

export const converter: IConverter = {
  toUint8ArrayBE: native.toBufferBE,
  toUint8ArrayLE: native.toBufferLE,
  toBigUIntLE: native.toBigIntLE as IConverter['toBigUIntLE'],
  toBigUIntBE: native.toBigIntBE as IConverter['toBigUIntBE']
}
