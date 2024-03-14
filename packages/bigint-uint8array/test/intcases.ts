export const BELEs: Array<{ num: bigint, bytes: number, expect: string, type: 'le' | 'be' }> = [
  { num: 127n, bytes: 1, expect: '7f', type: 'le' },
  { num: -128n, bytes: 1, expect: '80', type: 'le' },
  { num: 63n, bytes: 1, expect: '3f', type: 'le' },
  { num: -64n, bytes: 1, expect: 'c0', type: 'le' },
  { num: -1n, bytes: 1, expect: 'ff', type: 'le' },
  { num: 1n, bytes: 1, expect: '01', type: 'le' },
  { num: 127n, bytes: 1, expect: '7f', type: 'be' },
  { num: -128n, bytes: 1, expect: '80', type: 'be' },
  { num: 63n, bytes: 1, expect: '3f', type: 'be' },
  { num: -64n, bytes: 1, expect: 'c0', type: 'be' },
  { num: -1n, bytes: 1, expect: 'ff', type: 'be' },
  { num: 1n, bytes: 1, expect: '01', type: 'be' },
  { num: 32767n, bytes: 2, expect: 'ff7f', type: 'le' },
  { num: -32768n, bytes: 2, expect: '0080', type: 'le' },
  { num: 16383n, bytes: 2, expect: 'ff3f', type: 'le' },
  { num: -16384n, bytes: 2, expect: '00c0', type: 'le' },
  { num: -1n, bytes: 2, expect: 'ffff', type: 'le' },
  { num: 1n, bytes: 2, expect: '0100', type: 'le' },
  { num: 32767n, bytes: 2, expect: '7fff', type: 'be' },
  { num: -32768n, bytes: 2, expect: '8000', type: 'be' },
  { num: 16383n, bytes: 2, expect: '3fff', type: 'be' },
  { num: -16384n, bytes: 2, expect: 'c000', type: 'be' },
  { num: -1n, bytes: 2, expect: 'ffff', type: 'be' },
  { num: 1n, bytes: 2, expect: '0001', type: 'be' },
  { num: 2147483647n, bytes: 4, expect: 'ffffff7f', type: 'le' },
  { num: -2147483648n, bytes: 4, expect: '00000080', type: 'le' },
  { num: 1073741823n, bytes: 4, expect: 'ffffff3f', type: 'le' },
  { num: -1073741824n, bytes: 4, expect: '000000c0', type: 'le' },
  { num: -1n, bytes: 4, expect: 'ffffffff', type: 'le' },
  { num: 1n, bytes: 4, expect: '01000000', type: 'le' },
  { num: 2147483647n, bytes: 4, expect: '7fffffff', type: 'be' },
  { num: -2147483648n, bytes: 4, expect: '80000000', type: 'be' },
  { num: 1073741823n, bytes: 4, expect: '3fffffff', type: 'be' },
  { num: -1073741824n, bytes: 4, expect: 'c0000000', type: 'be' },
  { num: -1n, bytes: 4, expect: 'ffffffff', type: 'be' },
  { num: 1n, bytes: 4, expect: '00000001', type: 'be' },
  {
    num: 9223372036854775807n,
    bytes: 8,
    expect: 'ffffffffffffff7f',
    type: 'le'
  },
  {
    num: -9223372036854775808n,
    bytes: 8,
    expect: '0000000000000080',
    type: 'le'
  },
  {
    num: 4611686018427387903n,
    bytes: 8,
    expect: 'ffffffffffffff3f',
    type: 'le'
  },
  {
    num: -4611686018427387904n,
    bytes: 8,
    expect: '00000000000000c0',
    type: 'le'
  },
  { num: -1n, bytes: 8, expect: 'ffffffffffffffff', type: 'le' },
  { num: 1n, bytes: 8, expect: '0100000000000000', type: 'le' },
  {
    num: 9223372036854775807n,
    bytes: 8,
    expect: '7fffffffffffffff',
    type: 'be'
  },
  {
    num: -9223372036854775808n,
    bytes: 8,
    expect: '8000000000000000',
    type: 'be'
  },
  {
    num: 4611686018427387903n,
    bytes: 8,
    expect: '3fffffffffffffff',
    type: 'be'
  },
  {
    num: -4611686018427387904n,
    bytes: 8,
    expect: 'c000000000000000',
    type: 'be'
  },
  { num: -1n, bytes: 8, expect: 'ffffffffffffffff', type: 'be' },
  { num: 1n, bytes: 8, expect: '0000000000000001', type: 'be' }
]
