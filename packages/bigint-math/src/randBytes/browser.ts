export function fillRandom (buffer: Uint8Array): void {
  crypto.getRandomValues(buffer)
}
