import { buildConfigs, runBuild, buildBundle } from '../../build/esbuild.config.mjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  console.log('Building bigint-buffer2...');

  const config = buildConfigs.browserAndNode('BigIntBuffer2', [
    '@vekexasia/bigint-uint8array'
  ]);

  // Native bindings should be external for node builds
  // WASM files are loaded dynamically

  await runBuild(__dirname, config);

  // Build separate entry points for /js, /native, /wasm
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

  console.log('  Building dist/wasm.esm.mjs...');
  await buildBundle({
    entryPoint: 'src/wasm/index.ts',
    outfile: 'dist/wasm.esm.mjs',
    format: 'esm',
    isBrowser: true,
    external: [],
    packageDir: __dirname,
  });

  console.log('  Building dist/wasm.cjs.js...');
  await buildBundle({
    entryPoint: 'src/wasm/index.ts',
    outfile: 'dist/wasm.cjs.js',
    format: 'cjs',
    isBrowser: true,
    external: [],
    packageDir: __dirname,
  });

  console.log('bigint-buffer2 built successfully!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
