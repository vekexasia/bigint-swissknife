import { buildConfigs, runBuild, buildBundle, buildUMD, generateDeclarations } from '../../build/esbuild.config.mjs';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  console.log('Building bigint-math...');

  // Clean dist directory
  const distDir = path.join(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // Standard builds with external dependencies
  const standardConfigs = [
    { format: 'esm', isBrowser: true, outfile: 'dist/browser.esm.mjs', external: ['crypto', '@vekexasia/bigint-uint8array'] },
    { format: 'cjs', isBrowser: true, outfile: 'dist/browser.cjs.js', external: ['crypto', '@vekexasia/bigint-uint8array'] },
    { format: 'esm', isBrowser: false, outfile: 'dist/node.esm.mjs', external: ['crypto', '@vekexasia/bigint-uint8array'] },
    { format: 'cjs', isBrowser: false, outfile: 'dist/node.cjs.js', external: ['crypto', '@vekexasia/bigint-uint8array'] },
  ];

  for (const config of standardConfigs) {
    console.log(`  Building ${config.outfile}...`);
    await buildBundle({
      entryPoint: 'src/index.ts',
      packageDir: __dirname,
      ...config,
    });
  }

  // IIFE/UMD: Bundle the bigint-uint8array dependency, only crypto is external
  const iifeConfig = {
    entryPoint: 'src/index.ts',
    format: 'iife',
    isBrowser: true,
    outfile: 'dist/browser.iife.js',
    globalName: 'BigIntMath',
    external: ['crypto'],
    packageDir: __dirname,
    // Alias to bundle the sibling package
    alias: {
      '@vekexasia/bigint-uint8array': path.join(__dirname, '../bigint-uint8array/dist/browser.esm.mjs'),
    },
  };

  console.log('  Building dist/browser.iife.js...');
  await buildBundle(iifeConfig);

  console.log('  Building dist/browser.umd.js...');
  await buildUMD({
    ...iifeConfig,
    outfile: 'dist/browser.umd.js',
  });

  // Generate TypeScript declarations
  console.log('  Generating type declarations...');
  await generateDeclarations(__dirname);

  console.log('bigint-math built successfully!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
