import * as crypto from 'crypto'

export function fillRandom (buffer: Uint8Array): void {
  crypto.randomBytes(buffer.length).copy(buffer)
}
