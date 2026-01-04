import { buildConfigs, runBuild } from '../../build/esbuild.config.mjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  console.log('Building bigint-buffer-polyfill...');

  const config = buildConfigs.nodeOnly(['@vekexasia/bigint-uint8array']);

  await runBuild(__dirname, config);

  console.log('bigint-buffer-polyfill built successfully!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
