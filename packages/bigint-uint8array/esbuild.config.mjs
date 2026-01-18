import { buildConfigs, runBuild } from '../../build/esbuild.config.mjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  console.log('Building bigint-uint8array...');

  const config = buildConfigs.browserAndNode(['@vekexasia/bigint-buffer2']);

  await runBuild(__dirname, config);

  console.log('bigint-uint8array built successfully!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
