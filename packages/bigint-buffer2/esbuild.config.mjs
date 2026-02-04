import { buildBundle, generateDeclarations } from '../../build/esbuild.config.mjs';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  console.log('Building bigint-buffer2...');

  // Clean dist directory
  const distDir = path.join(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  const external = ['@vekexasia/bigint-uint8array'];

  // Browser builds - native module import is replaced with stub via preprocess plugin
  console.log('  Building dist/browser.esm.mjs...');
  await buildBundle({
    entryPoint: 'src/index.ts',
    outfile: 'dist/browser.esm.mjs',
    format: 'esm',
    isBrowser: true,
    external,
    packageDir: __dirname,
  });

  console.log('  Building dist/browser.cjs.js...');
  await buildBundle({
    entryPoint: 'src/index.ts',
    outfile: 'dist/browser.cjs.js',
    format: 'cjs',
    isBrowser: true,
    external,
    packageDir: __dirname,
  });

  // Node builds - no alias, use real native module
  console.log('  Building dist/node.esm.mjs...');
  await buildBundle({
    entryPoint: 'src/index.ts',
    outfile: 'dist/node.esm.mjs',
    format: 'esm',
    isBrowser: false,
    external,
    packageDir: __dirname,
  });

  console.log('  Building dist/node.cjs.js...');
  await buildBundle({
    entryPoint: 'src/index.ts',
    outfile: 'dist/node.cjs.js',
    format: 'cjs',
    isBrowser: false,
    external,
    packageDir: __dirname,
  });

  // Generate TypeScript declarations
  console.log('  Generating type declarations...');
  await generateDeclarations(__dirname);

  // Build separate entry points for /js, /native subpaths
  console.log('  Building dist/js.esm.mjs...');
  await buildBundle({
    entryPoint: 'src/fallback.ts',
    outfile: 'dist/js.esm.mjs',
    format: 'esm',
    isBrowser: true,
    external: [],
    packageDir: __dirname,
  });

  console.log('  Building dist/js.cjs.js...');
  await buildBundle({
    entryPoint: 'src/fallback.ts',
    outfile: 'dist/js.cjs.js',
    format: 'cjs',
    isBrowser: true,
    external: [],
    packageDir: __dirname,
  });

  console.log('  Building dist/native.esm.mjs...');
  await buildBundle({
    entryPoint: 'src/native/index.ts',
    outfile: 'dist/native.esm.mjs',
    format: 'esm',
    isBrowser: false,
    external: [],
    packageDir: __dirname,
  });

  console.log('  Building dist/native.cjs.js...');
  await buildBundle({
    entryPoint: 'src/native/index.ts',
    outfile: 'dist/native.cjs.js',
    format: 'cjs',
    isBrowser: false,
    external: [],
    packageDir: __dirname,
  });

  console.log('bigint-buffer2 built successfully!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
