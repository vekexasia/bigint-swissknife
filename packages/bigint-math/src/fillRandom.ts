if (IS_BROWSER) {
  var _fillRandom = function (buffer: Uint8Array): void {
    crypto.getRandomValues(buffer)
  }
} else {
  const crypto = await import('crypto')
  _fillRandom = function (buffer: Uint8Array): void {
    crypto.randomBytes(buffer.length).copy(buffer)
  }
}

export const fillRandom = _fillRandom
