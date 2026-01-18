export function byteBoundaries (nBytes: number): { min: bigint, max: bigint } {
  return {
    min: -1n * 2n ** (8n * BigInt(nBytes) - 1n),
    max: 2n ** (8n * BigInt(nBytes) - 1n) - 1n
  }
}

export function assertIntBoundaries (n: bigint, nBytes: number): bigint {
  if (!Number.isInteger(nBytes) || nBytes < 1) {
    throw new RangeError(`bytes must be a positive integer, got ${nBytes}`)
  }
  const { min, max } = byteBoundaries(nBytes)
  if (n < min || n > max) {
    throw new RangeError(`bigint[s] ${n} is out of boundaries for ${nBytes} bytes min=${min} max=${max}`)
  }
  return n
}

export function assertUIntBoundaries (n: bigint, nBytes: number): bigint {
  if (!Number.isInteger(nBytes) || nBytes < 1) {
    throw new RangeError(`bytes must be a positive integer, got ${nBytes}`)
  }
  const max = 2n ** (8n * BigInt(nBytes)) - 1n
  if (n < 0n || n > max) {
    throw new RangeError(`bigint[u] ${n} is out of boundaries for ${nBytes} bytes min=${0n} max=${max}`)
  }
  return n
}
