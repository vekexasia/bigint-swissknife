import * as esbuild from 'esbuild';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Plugin to preprocess TypeScript files before esbuild parses them
 * This allows us to transform syntax that esbuild doesn't support in certain formats
 */
function preprocessPlugin(replacements) {
  return {
    name: 'preprocess',
    setup(build) {
      build.onLoad({ filter: /\.ts$/ }, async (args) => {
        let contents = await fs.promises.readFile(args.path, 'utf8');

        for (const [from, to] of Object.entries(replacements)) {
          contents = contents.split(from).join(to);
        }

        return {
          contents,
          loader: 'ts',
        };
      });
    },
  };
}

/**
 * Build a single bundle with esbuild
 * @param {object} options
 * @param {string} options.entryPoint - Entry file (e.g., 'src/index.ts')
 * @param {string} options.outfile - Output file path
 * @param {'esm'|'cjs'|'iife'} options.format - Output format
 * @param {boolean} options.isBrowser - Whether this is a browser build
 * @param {string[]} options.external - External dependencies
 * @param {string} [options.globalName] - Global name for IIFE
 * @param {string} options.packageDir - Package directory
 * @param {boolean} [options.bundle] - Whether to bundle (default: true)
 * @param {Record<string, string>} [options.alias] - Alias mappings
 */
export async function buildBundle(options) {
  const {
    entryPoint,
    outfile,
    format,
    isBrowser,
    external = [],
    globalName,
    packageDir,
    bundle = true,
    alias = {},
  } = options;

  const replacements = {
    'IS_BROWSER': String(isBrowser),
  };

  // For browser builds, replace native.js imports with browser.js
  if (isBrowser) {
    replacements["'./native.js'"] = "'./browser.js'";
    replacements['"./native.js"'] = '"./browser.js"';
  }

  // For CJS builds, replace dynamic imports with require and remove other top-level awaits
  if (format === 'cjs') {
    replacements['await import('] = 'require(';
    // Remove await for initNative - in CJS it's already fire-and-forget at module load
    replacements['await initPromise;'] = '/* initPromise - native loads async in CJS */';
  }

  const plugins = [preprocessPlugin(replacements)];

  const buildOptions = {
    entryPoints: [path.join(packageDir, entryPoint)],
    outfile: path.join(packageDir, outfile),
    bundle,
    format,
    platform: isBrowser ? 'browser' : 'node',
    target: 'es2022',
    external,
    globalName: format === 'iife' ? globalName : undefined,
    plugins,
    alias,
    logLevel: 'warning',
  };

  await esbuild.build(buildOptions);
}

/**
 * Build UMD format (esbuild doesn't support UMD natively)
 * We build IIFE and wrap it with UMD boilerplate
 */
export async function buildUMD(options) {
  const { packageDir, outfile, globalName } = options;
  const tempFile = path.join(packageDir, outfile + '.temp');

  // Build IIFE first
  await buildBundle({
    ...options,
    format: 'iife',
    outfile: outfile + '.temp',
  });

  // Read IIFE content and wrap with UMD
  const iifeContent = fs.readFileSync(tempFile, 'utf-8');

  // Extract the content inside the IIFE
  const umdWrapper = `(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.${globalName} = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
${iifeContent}
return ${globalName};
}));`;

  fs.writeFileSync(path.join(packageDir, outfile), umdWrapper);
  fs.unlinkSync(tempFile);
}

/**
 * Generate TypeScript declarations using tsc
 * @param {string} packageDir - Package directory
 */
export async function generateDeclarations(packageDir) {
  const tsconfigPath = path.join(packageDir, 'tsconfig.build.json');

  // Check if tsconfig.build.json exists, otherwise use tsconfig.json
  const configFile = fs.existsSync(tsconfigPath)
    ? tsconfigPath
    : path.join(packageDir, 'tsconfig.json');

  execSync(`npx tsc -p ${configFile} --declaration --emitDeclarationOnly --outDir dist/types`, {
    cwd: packageDir,
    stdio: 'inherit',
  });
}

/**
 * Standard build configurations
 */
export const buildConfigs = {
  // For packages like bigint-uint8array and bigint-math
  // Output: browser.esm.mjs, browser.cjs.js, node.cjs.js, node.esm.mjs, browser.iife.js, browser.umd.js
  browserAndNode: (globalName, external = []) => ({
    configs: [
      { format: 'esm', isBrowser: true, outfile: 'dist/browser.esm.mjs', external },
      { format: 'cjs', isBrowser: true, outfile: 'dist/browser.cjs.js', external },
      { format: 'esm', isBrowser: false, outfile: 'dist/node.esm.mjs', external },
      { format: 'cjs', isBrowser: false, outfile: 'dist/node.cjs.js', external },
    ],
    iife: { format: 'iife', isBrowser: true, outfile: 'dist/browser.iife.js', globalName, external: [] },
    umd: { format: 'umd', isBrowser: true, outfile: 'dist/browser.umd.js', globalName, external: [] },
  }),

  // For bigint-constrained
  // Output: esm.js, cjs.js, browser.iife.js, browser.umd.js
  simpleWithIIFE: (globalName, external = []) => ({
    configs: [
      { format: 'esm', isBrowser: true, outfile: 'dist/esm.js', external },
      { format: 'cjs', isBrowser: true, outfile: 'dist/cjs.js', external },
    ],
    iife: { format: 'iife', isBrowser: true, outfile: 'dist/iife.js', globalName, external: [] },
    umd: { format: 'umd', isBrowser: true, outfile: 'dist/umd.js', globalName, external: [] },
  }),

  // For bigint-buffer-polyfill
  // Output: node.cjs.js, node.esm.mjs (no browser builds)
  nodeOnly: (external = []) => ({
    configs: [
      { format: 'esm', isBrowser: false, outfile: 'dist/node.esm.mjs', external },
      { format: 'cjs', isBrowser: false, outfile: 'dist/node.cjs.js', external },
    ],
  }),
};

/**
 * Run a full build for a package
 * @param {string} packageDir - Package directory
 * @param {object} buildConfig - Build configuration from buildConfigs
 * @param {object} [extraOptions] - Extra options for buildBundle (like alias)
 */
export async function runBuild(packageDir, buildConfig, extraOptions = {}) {
  // Clean dist directory
  const distDir = path.join(packageDir, 'dist');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // Build all configs
  for (const config of buildConfig.configs) {
    console.log(`  Building ${config.outfile}...`);
    await buildBundle({
      entryPoint: 'src/index.ts',
      packageDir,
      ...config,
      ...extraOptions,
    });
  }

  // Build IIFE if specified
  if (buildConfig.iife) {
    console.log(`  Building ${buildConfig.iife.outfile}...`);
    await buildBundle({
      entryPoint: 'src/index.ts',
      packageDir,
      ...buildConfig.iife,
      ...extraOptions,
    });
  }

  // Build UMD if specified
  if (buildConfig.umd) {
    console.log(`  Building ${buildConfig.umd.outfile}...`);
    await buildUMD({
      entryPoint: 'src/index.ts',
      packageDir,
      ...buildConfig.umd,
      ...extraOptions,
    });
  }

  // Generate TypeScript declarations
  console.log('  Generating type declarations...');
  await generateDeclarations(packageDir);
}
