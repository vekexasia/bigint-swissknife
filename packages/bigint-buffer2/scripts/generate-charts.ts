/**
 * Generate performance benchmark charts from vitest bench results.
 *
 * Usage: npx tsx scripts/generate-charts.ts
 *
 * This script:
 * 1. Runs vitest bench with JSON output
 * 2. Parses the results
 * 3. Generates PNG charts to docs/ folder
 */

import { writeFileSync, readFileSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import type { ChartConfiguration } from 'chart.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = join(__dirname, '..', 'docs');
const benchResultsPath = join(__dirname, '..', 'bench-results.json');

// Ensure docs directory exists
mkdirSync(docsDir, { recursive: true });

// Chart dimensions
const width = 900;
const height = 500;

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour: 'white',
});

interface BenchmarkResult {
  name: string;
  hz: number;
  rank: number;
}

interface BenchmarkGroup {
  fullName: string;
  benchmarks: BenchmarkResult[];
}

interface VitestBenchOutput {
  files: Array<{
    groups: BenchmarkGroup[];
  }>;
}

interface ChartData {
  sizes: string[];
  bigintBuffer: number[];
  buffer2: number[];
  buffer2Into: number[];
}

interface ImplementationData {
  sizes: string[];
  native: number[];
  wasm: number[];
  fallback: number[];
}

type Operation = 'toBufferBE' | 'toBufferLE' | 'toBigIntBE' | 'toBigIntLE';

function runVitestBench(): VitestBenchOutput {
  console.log('Running vitest bench (this may take a few minutes)...');

  try {
    execSync('npx vitest bench --run --outputJson bench-results.json', {
      cwd: join(__dirname, '..'),
      stdio: 'inherit',
    });
  } catch {
    // vitest bench may exit with non-zero even on success
  }

  const jsonContent = readFileSync(benchResultsPath, 'utf-8');
  return JSON.parse(jsonContent);
}

function extractData(results: VitestBenchOutput, operation: Operation): ChartData {
  const data: ChartData = {
    sizes: [],
    bigintBuffer: [],
    buffer2: [],
    buffer2Into: [],
  };

  // Determine the Into variant name
  const intoOperation = operation.replace(/(BE|LE)$/, '$1Into');

  for (const file of results.files) {
    for (const group of file.groups) {
      // Match groups like "toBufferBE (8B)" or "toBufferBEInto (8B)"
      const baseMatch = group.fullName.match(new RegExp(`${operation}\\s*\\((\\d+)B\\)`));
      const intoMatch = group.fullName.match(new RegExp(`${intoOperation}\\s*\\((\\d+)B\\)`));

      if (baseMatch) {
        const size = baseMatch[1] + 'B';

        for (const bench of group.benchmarks) {
          const kOps = bench.hz / 1000;

          if (bench.name === 'bigint-buffer') {
            if (!data.sizes.includes(size)) {
              data.sizes.push(size);
              data.bigintBuffer.push(kOps);
              data.buffer2.push(0);
              data.buffer2Into.push(0);
            }
          } else if (bench.name === 'bigint-buffer2 native') {
            const idx = data.sizes.indexOf(size);
            if (idx !== -1) {
              data.buffer2[idx] = kOps;
            }
          }
        }
      } else if (intoMatch) {
        const size = intoMatch[1] + 'B';

        for (const bench of group.benchmarks) {
          const kOps = bench.hz / 1000;

          if (bench.name === 'bigint-buffer2 native (into)') {
            const idx = data.sizes.indexOf(size);
            if (idx !== -1) {
              data.buffer2Into[idx] = kOps;
            }
          }
        }
      }
    }
  }

  // Sort by size
  const sizeOrder = ['8B', '16B', '24B', '32B', '48B', '64B', '96B', '128B'];
  const sortedIndices = data.sizes
    .map((s, i) => ({ size: s, idx: i }))
    .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size))
    .map(x => x.idx);

  data.sizes = sortedIndices.map(i => data.sizes[i]);
  data.bigintBuffer = sortedIndices.map(i => data.bigintBuffer[i] || 0);
  data.buffer2 = sortedIndices.map(i => data.buffer2[i] || 0);
  data.buffer2Into = sortedIndices.map(i => data.buffer2Into[i] || 0);

  return data;
}

function extractImplementationData(results: VitestBenchOutput, operation: Operation): ImplementationData {
  const data: ImplementationData = {
    sizes: [],
    native: [],
    wasm: [],
    fallback: [],
  };

  for (const file of results.files) {
    for (const group of file.groups) {
      // Match groups like "toBufferBE (8B)"
      const match = group.fullName.match(new RegExp(`^${operation}\\s*\\((\\d+)B\\)`));

      if (match) {
        const size = match[1] + 'B';

        if (!data.sizes.includes(size)) {
          data.sizes.push(size);
          data.native.push(0);
          data.wasm.push(0);
          data.fallback.push(0);
        }

        const idx = data.sizes.indexOf(size);

        for (const bench of group.benchmarks) {
          const kOps = bench.hz / 1000;

          if (bench.name === 'bigint-buffer2 native') {
            data.native[idx] = kOps;
          } else if (bench.name === 'bigint-buffer2 wasm') {
            data.wasm[idx] = kOps;
          } else if (bench.name === 'bigint-buffer2 fallback') {
            data.fallback[idx] = kOps;
          }
        }
      }
    }
  }

  // Sort by size
  const sizeOrder = ['8B', '16B', '24B', '32B', '48B', '64B', '96B', '128B'];
  const sortedIndices = data.sizes
    .map((s, i) => ({ size: s, idx: i }))
    .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size))
    .map(x => x.idx);

  data.sizes = sortedIndices.map(i => data.sizes[i]);
  data.native = sortedIndices.map(i => data.native[i] || 0);
  data.wasm = sortedIndices.map(i => data.wasm[i] || 0);
  data.fallback = sortedIndices.map(i => data.fallback[i] || 0);

  return data;
}

async function generateToBufferChart(data: ChartData, endian: 'BE' | 'LE'): Promise<void> {
  const config: ChartConfiguration = {
    type: 'line',
    data: {
      labels: data.sizes,
      datasets: [
        {
          label: 'bigint-buffer',
          data: data.bigintBuffer,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          tension: 0.3,
        },
        {
          label: `bigint-buffer2 (toBuffer${endian})`,
          data: data.buffer2,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          tension: 0.3,
        },
        {
          label: `bigint-buffer2 (toBuffer${endian}Into)`,
          data: data.buffer2Into,
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: `toBuffer${endian} Performance Comparison (vitest bench)`,
          font: { size: 20, weight: 'bold' },
          padding: 20,
        },
        legend: {
          position: 'bottom',
          labels: { font: { size: 14 }, padding: 20 },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Buffer Size (bytes)',
            font: { size: 14, weight: 'bold' },
          },
          grid: { color: 'rgba(0,0,0,0.1)' },
        },
        y: {
          title: {
            display: true,
            text: 'Throughput (k ops/sec)',
            font: { size: 14, weight: 'bold' },
          },
          grid: { color: 'rgba(0,0,0,0.1)' },
          beginAtZero: true,
        },
      },
    },
  };

  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  const outputPath = join(docsDir, `benchmark-toBuffer${endian}.png`);
  writeFileSync(outputPath, buffer);
  console.log(`✓ Saved: ${outputPath}`);
}

async function generateToBigIntChart(data: ChartData, endian: 'BE' | 'LE'): Promise<void> {
  const config: ChartConfiguration = {
    type: 'line',
    data: {
      labels: data.sizes,
      datasets: [
        {
          label: 'bigint-buffer',
          data: data.bigintBuffer,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          tension: 0.3,
        },
        {
          label: 'bigint-buffer2',
          data: data.buffer2,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: `toBigInt${endian} Performance Comparison (vitest bench)`,
          font: { size: 20, weight: 'bold' },
          padding: 20,
        },
        legend: {
          position: 'bottom',
          labels: { font: { size: 14 }, padding: 20 },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Buffer Size (bytes)',
            font: { size: 14, weight: 'bold' },
          },
          grid: { color: 'rgba(0,0,0,0.1)' },
        },
        y: {
          title: {
            display: true,
            text: 'Throughput (k ops/sec)',
            font: { size: 14, weight: 'bold' },
          },
          grid: { color: 'rgba(0,0,0,0.1)' },
          beginAtZero: true,
        },
      },
    },
  };

  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  const outputPath = join(docsDir, `benchmark-toBigInt${endian}.png`);
  writeFileSync(outputPath, buffer);
  console.log(`✓ Saved: ${outputPath}`);
}

async function generateOperationsComparisonChart(
  toBufferData: ChartData,
  toBigIntData: ChartData
): Promise<void> {
  // Color families for visual clustering:
  // - toBufferBE cluster: Orange/red shades
  // - toBigIntBE cluster: Blue shades
  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: toBufferData.sizes,
      datasets: [
        // === toBufferBE cluster (orange/red family) ===
        {
          label: 'toBufferBE: bigint-buffer',
          data: toBufferData.bigintBuffer,
          backgroundColor: 'rgba(230, 126, 34, 0.85)',  // Orange
          borderColor: '#d35400',
          borderWidth: 2,
        },
        {
          label: 'toBufferBE: bigint-buffer2',
          data: toBufferData.buffer2,
          backgroundColor: 'rgba(241, 196, 15, 0.85)',  // Yellow-orange
          borderColor: '#f39c12',
          borderWidth: 2,
        },
        {
          label: 'toBufferBEInto: bigint-buffer2',
          data: toBufferData.buffer2Into,
          backgroundColor: 'rgba(231, 76, 60, 0.85)',   // Red
          borderColor: '#c0392b',
          borderWidth: 2,
        },
        // === Spacer between clusters ===
        {
          label: '',
          data: toBufferData.sizes.map(() => null),
          backgroundColor: 'transparent',
          borderWidth: 0,
          barPercentage: 0.1,
        },
        // === toBigIntBE cluster (blue family) ===
        {
          label: 'toBigIntBE: bigint-buffer',
          data: toBigIntData.bigintBuffer,
          backgroundColor: 'rgba(52, 152, 219, 0.85)',  // Blue
          borderColor: '#2980b9',
          borderWidth: 2,
        },
        {
          label: 'toBigIntBE: bigint-buffer2',
          data: toBigIntData.buffer2,
          backgroundColor: 'rgba(155, 89, 182, 0.85)',  // Purple
          borderColor: '#8e44ad',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: 'BE Operations Performance Comparison',
          font: { size: 20, weight: 'bold' },
          padding: 20,
        },
        subtitle: {
          display: true,
          text: 'Warm colors = toBuffer ops | Cool colors = toBigInt ops',
          font: { size: 12, style: 'italic' },
          padding: { bottom: 10 },
        },
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 11 },
            padding: 12,
            filter: (item) => item.text !== '',  // Hide spacer from legend
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Buffer Size (bytes)',
            font: { size: 14, weight: 'bold' },
          },
          grid: { display: false },
        },
        y: {
          title: {
            display: true,
            text: 'Throughput (k ops/sec)',
            font: { size: 14, weight: 'bold' },
          },
          grid: { color: 'rgba(0,0,0,0.1)' },
          beginAtZero: true,
        },
      },
    },
  };

  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  const outputPath = join(docsDir, 'benchmark-operations-BE.png');
  writeFileSync(outputPath, buffer);
  console.log(`✓ Saved: ${outputPath}`);
}

async function generateImplementationComparisonChart(
  implData: ImplementationData
): Promise<void> {
  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: implData.sizes,
      datasets: [
        {
          label: 'Native',
          data: implData.native,
          backgroundColor: 'rgba(46, 204, 113, 0.85)',  // Green
          borderColor: '#27ae60',
          borderWidth: 2,
        },
        {
          label: 'WASM',
          data: implData.wasm,
          backgroundColor: 'rgba(52, 152, 219, 0.85)',  // Blue
          borderColor: '#2980b9',
          borderWidth: 2,
        },
        {
          label: 'JS Fallback',
          data: implData.fallback,
          backgroundColor: 'rgba(231, 76, 60, 0.85)',   // Red
          borderColor: '#c0392b',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: 'bigint-buffer2 Implementation Comparison (toBufferBE)',
          font: { size: 20, weight: 'bold' },
          padding: 20,
        },
        subtitle: {
          display: true,
          text: 'WASM only available for sizes ≥ 64B',
          font: { size: 12, style: 'italic' },
          padding: { bottom: 10 },
        },
        legend: {
          position: 'bottom',
          labels: { font: { size: 12 }, padding: 15 },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Buffer Size (bytes)',
            font: { size: 14, weight: 'bold' },
          },
          grid: { display: false },
        },
        y: {
          title: {
            display: true,
            text: 'Throughput (k ops/sec)',
            font: { size: 14, weight: 'bold' },
          },
          grid: { color: 'rgba(0,0,0,0.1)' },
          beginAtZero: true,
        },
      },
    },
  };

  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  const outputPath = join(docsDir, 'benchmark-implementations.png');
  writeFileSync(outputPath, buffer);
  console.log(`✓ Saved: ${outputPath}`);
}

async function generateSpeedupChart(dataBE: ChartData, dataLE: ChartData): Promise<void> {
  // Calculate percentage speedup of buffer2-into vs bigint-buffer for both BE and LE
  const speedupsBE = dataBE.sizes.map((_, i) => {
    const bb = dataBE.bigintBuffer[i];
    const into = dataBE.buffer2Into[i];
    if (!bb || !into) return 0;
    return ((into - bb) / bb) * 100;
  });

  const speedupsLE = dataLE.sizes.map((_, i) => {
    const bb = dataLE.bigintBuffer[i];
    const into = dataLE.buffer2Into[i];
    if (!bb || !into) return 0;
    return ((into - bb) / bb) * 100;
  });

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: dataBE.sizes,
      datasets: [
        {
          label: 'toBufferBEInto speedup',
          data: speedupsBE,
          backgroundColor: 'rgba(52, 152, 219, 0.8)',
          borderColor: '#2980b9',
          borderWidth: 2,
        },
        {
          label: 'toBufferLEInto speedup',
          data: speedupsLE,
          backgroundColor: 'rgba(46, 204, 113, 0.8)',
          borderColor: '#27ae60',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: 'bigint-buffer2 toBufferInto Speedup vs bigint-buffer',
          font: { size: 20, weight: 'bold' },
          padding: 20,
        },
        legend: {
          position: 'bottom',
          labels: { font: { size: 14 }, padding: 20 },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const val = context.parsed.y ?? 0;
              return `${context.dataset.label}: ${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Buffer Size (bytes)',
            font: { size: 14, weight: 'bold' },
          },
          grid: { display: false },
        },
        y: {
          title: {
            display: true,
            text: 'Speedup (%)',
            font: { size: 14, weight: 'bold' },
          },
          grid: { color: 'rgba(0,0,0,0.1)' },
        },
      },
    },
  };

  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  const outputPath = join(docsDir, 'benchmark-speedup.png');
  writeFileSync(outputPath, buffer);
  console.log(`✓ Saved: ${outputPath}`);
}

function printSummary(label: string, data: ChartData, hasInto: boolean = false) {
  console.log(`\n${label} results (k ops/s):`);
  data.sizes.forEach((size, i) => {
    const bb = data.bigintBuffer[i]?.toFixed(0) || 'N/A';
    const b2 = data.buffer2[i]?.toFixed(0) || 'N/A';
    const into = hasInto ? `, into=${data.buffer2Into[i]?.toFixed(0) || 'N/A'}` : '';
    console.log(`  ${size}: bigint-buffer=${bb}, buffer2=${b2}${into}`);
  });
}

async function main() {
  // Run vitest bench and get results
  const results = runVitestBench();

  console.log('\n📊 Extracting benchmark data...');

  // Extract data for all operations
  const toBufferBEData = extractData(results, 'toBufferBE');
  const toBufferLEData = extractData(results, 'toBufferLE');
  const toBigIntBEData = extractData(results, 'toBigIntBE');
  const toBigIntLEData = extractData(results, 'toBigIntLE');

  // Extract implementation comparison data
  const toBufferBEImpl = extractImplementationData(results, 'toBufferBE');

  // Print summaries
  printSummary('toBufferBE', toBufferBEData, true);
  printSummary('toBufferLE', toBufferLEData, true);
  printSummary('toBigIntBE', toBigIntBEData);
  printSummary('toBigIntLE', toBigIntLEData);

  console.log('\n🎨 Generating charts...');

  // Generate all charts
  await generateToBufferChart(toBufferBEData, 'BE');
  await generateToBufferChart(toBufferLEData, 'LE');
  await generateToBigIntChart(toBigIntBEData, 'BE');
  await generateToBigIntChart(toBigIntLEData, 'LE');
  await generateSpeedupChart(toBufferBEData, toBufferLEData);
  await generateOperationsComparisonChart(toBufferBEData, toBigIntBEData);
  await generateImplementationComparisonChart(toBufferBEImpl);

  // Cleanup
  try {
    unlinkSync(benchResultsPath);
  } catch {
    // ignore
  }

  console.log('\n✅ Done! Charts saved to docs/ folder.');
}

main().catch(console.error);
