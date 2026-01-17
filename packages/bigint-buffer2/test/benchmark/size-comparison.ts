/**
 * Size comparison benchmark: bigint-buffer vs bigint-buffer2
 * Tests performance across byte sizes 1-128
 */

import * as nativeImpl from '../../src/native/index.js';
import * as bigintBuffer from 'bigint-buffer';

function randomBigInt(bits: number): bigint {
  let result = 0n;
  for (let i = 0; i < bits; i += 32) {
    result = (result << 32n) | BigInt(Math.floor(Math.random() * 0x100000000));
  }
  return result & ((1n << BigInt(bits)) - 1n);
}

interface BenchResult {
  size: number;
  bigintBuffer: number;
  buffer2: number;
  buffer2Into: number;
  diffBuffer2: number;
  diffInto: number;
}

function benchmark(fn: () => void, iterations: number = 10000): number {
  // Warmup
  for (let i = 0; i < 1000; i++) fn();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();

  return iterations / ((end - start) / 1000);
}

function drawBar(value: number, label: string, maxWidth: number = 50): string {
  const normalized = Math.min(Math.max(value, -100), 100);
  const center = maxWidth / 2;
  const barLen = Math.abs(normalized) * (center / 100);

  let bar = '';
  if (normalized >= 0) {
    bar = ' '.repeat(Math.floor(center)) + '│' + '█'.repeat(Math.round(barLen));
  } else {
    bar = ' '.repeat(Math.floor(center) - Math.round(barLen)) + '█'.repeat(Math.round(barLen)) + '│';
  }

  const sign = normalized >= 0 ? '+' : '';
  return `${label.padStart(5)} ${bar.padEnd(maxWidth + 2)} ${sign}${normalized.toFixed(0)}%`;
}

async function main() {
  await nativeImpl.getNative();

  console.log('Running size comparison benchmark...');
  console.log('Comparing: bigint-buffer.toBufferBE vs buffer2.toBufferBE vs buffer2.toBufferBEInto\n');

  const sizes = [1, 2, 4, 8, 16, 24, 32, 48, 64, 96, 128];
  const iterations = 50000;

  const results: BenchResult[] = [];

  console.log('Size   bigint-buffer    buffer2         buffer2-into    diff(buf2)  diff(into)');
  console.log('─'.repeat(85));

  for (const size of sizes) {
    const values = Array.from({ length: 100 }, () => randomBigInt(size * 8));
    const prealloc = Array.from({ length: 100 }, () => Buffer.alloc(size));
    let idx = 0;

    // bigint-buffer toBufferBE
    const bbOps = benchmark(() => {
      bigintBuffer.toBufferBE(values[idx++ % 100], size);
    }, iterations);

    // buffer2 toBufferBE
    idx = 0;
    const bb2Ops = benchmark(() => {
      nativeImpl.toBufferBE(values[idx++ % 100], size);
    }, iterations);

    // buffer2 toBufferBEInto
    idx = 0;
    const bb2IntoOps = benchmark(() => {
      nativeImpl.toBufferBEInto(values[idx % 100], prealloc[idx % 100]);
      idx++;
    }, iterations);

    const diffBuffer2 = ((bb2Ops - bbOps) / bbOps) * 100;
    const diffInto = ((bb2IntoOps - bbOps) / bbOps) * 100;

    results.push({
      size,
      bigintBuffer: bbOps,
      buffer2: bb2Ops,
      buffer2Into: bb2IntoOps,
      diffBuffer2,
      diffInto,
    });

    const d1 = diffBuffer2 >= 0 ? `+${diffBuffer2.toFixed(0)}%` : `${diffBuffer2.toFixed(0)}%`;
    const d2 = diffInto >= 0 ? `+${diffInto.toFixed(0)}%` : `${diffInto.toFixed(0)}%`;

    console.log(
      `${size.toString().padStart(4)}B  ` +
      `${(bbOps/1000).toFixed(0).padStart(6)}k ops/s   ` +
      `${(bb2Ops/1000).toFixed(0).padStart(6)}k ops/s   ` +
      `${(bb2IntoOps/1000).toFixed(0).padStart(6)}k ops/s   ` +
      `${d1.padStart(6)}      ${d2.padStart(6)}`
    );
  }

  // ASCII Chart
  console.log('\n\n═══════════════════════════════════════════════════════════════════');
  console.log('  Performance Chart: buffer2.toBufferBE vs bigint-buffer.toBufferBE');
  console.log('  (Positive = buffer2 faster, Negative = bigint-buffer faster)');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  console.log('      -100%              0%              +100%');
  console.log('        │                 │                 │');
  for (const r of results) {
    console.log(drawBar(r.diffBuffer2, `${r.size}B`));
  }

  console.log('\n\n═══════════════════════════════════════════════════════════════════');
  console.log('  Performance Chart: buffer2.toBufferBEInto vs bigint-buffer.toBufferBE');
  console.log('  (Positive = buffer2-into faster, Negative = bigint-buffer faster)');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  console.log('      -100%              0%              +100%');
  console.log('        │                 │                 │');
  for (const r of results) {
    console.log(drawBar(r.diffInto, `${r.size}B`));
  }

  // CSV data
  console.log('\n\n=== CSV DATA ===');
  console.log('Size,bigint-buffer,buffer2,buffer2-into,diff-buffer2%,diff-into%');
  for (const r of results) {
    console.log(`${r.size},${r.bigintBuffer.toFixed(0)},${r.buffer2.toFixed(0)},${r.buffer2Into.toFixed(0)},${r.diffBuffer2.toFixed(1)},${r.diffInto.toFixed(1)}`);
  }
}

main().catch(console.error);
