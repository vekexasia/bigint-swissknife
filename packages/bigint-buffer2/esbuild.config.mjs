import { buildConfigs, runBuild } from '../../build/esbuild.config.mjs';
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

  console.log('bigint-buffer2 built successfully!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
