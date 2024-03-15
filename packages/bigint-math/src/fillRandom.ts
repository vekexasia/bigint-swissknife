if (IS_BROWSER) {
  // eslint-disable-next-line
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
