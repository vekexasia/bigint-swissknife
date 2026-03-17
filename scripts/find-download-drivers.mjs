#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULTS = {
  period: 'last-week',
  top: 20,
  perPage: 50,
  concurrency: 5,
  timeoutMs: 15000,
};

const USER_AGENT = 'bigint-swissknife-download-driver-inspector/1.0';
const DEPENDENCY_SECTIONS = [
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
  'devDependencies',
];
const CURRENT_STATUS_ORDER = {
  current_runtime: 0,
  current_non_runtime: 1,
  historical: 2,
  unknown: 3,
};

function printUsage() {
  console.log(`Usage:
  node scripts/find-download-drivers.mjs <package-name> [options]

Examples:
  node scripts/find-download-drivers.mjs bigint-buffer --compare @vekexasia/bigint-buffer2
  node scripts/find-download-drivers.mjs bigint-buffer --top 30 --json artifacts/bigint-buffer-drivers.json

Options:
  --compare <package>       Compare weekly downloads with another package (repeatable)
  --top <n>                 Number of rows to print (default: ${DEFAULTS.top})
  --per-page <n>            Dependents page size for ecosyste.ms (default: ${DEFAULTS.perPage})
  --concurrency <n>         Concurrent package lookups (default: ${DEFAULTS.concurrency})
  --period <period>         npm download window: last-week or last-month (default: ${DEFAULTS.period})
  --json <path>             Write a JSON report
  --csv <path>              Write a CSV report
  --max-dependents <n>      Analyze at most N dependents after discovery
  --include-zero            Keep dependents with 0 weekly downloads in printed results
  --help                    Show this message

Notes:
  - This is an estimator. npm does not expose exact “who downloaded my package” attribution.
  - Results are inferred from direct dependents + their download counts.
  - A dependent's downloads are an upper bound, not a guaranteed one-to-one source of target downloads.
`);
}

function parseArgs(argv) {
  const args = {
    compare: [],
    top: DEFAULTS.top,
    perPage: DEFAULTS.perPage,
    concurrency: DEFAULTS.concurrency,
    period: DEFAULTS.period,
    timeoutMs: DEFAULTS.timeoutMs,
    includeZero: false,
  };

  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];

    if (!value.startsWith('--')) {
      positionals.push(value);
      continue;
    }

    if (value === '--help') {
      args.help = true;
      continue;
    }

    if (value === '--include-zero') {
      args.includeZero = true;
      continue;
    }

    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      throw new Error(`Missing value for ${value}`);
    }

    switch (value) {
      case '--compare':
        args.compare.push(next);
        break;
      case '--top':
        args.top = parsePositiveInt(next, '--top');
        break;
      case '--per-page':
        args.perPage = parsePositiveInt(next, '--per-page');
        break;
      case '--concurrency':
        args.concurrency = parsePositiveInt(next, '--concurrency');
        break;
      case '--period':
        if (!['last-week', 'last-month'].includes(next)) {
          throw new Error(`Unsupported period: ${next}`);
        }
        args.period = next;
        break;
      case '--json':
        args.json = next;
        break;
      case '--csv':
        args.csv = next;
        break;
      case '--max-dependents':
        args.maxDependents = parsePositiveInt(next, '--max-dependents');
        break;
      default:
        throw new Error(`Unknown option: ${value}`);
    }

    i += 1;
  }

  if (positionals.length > 1) {
    throw new Error('Only one target package can be analyzed per run.');
  }

  if (positionals.length === 1) {
    args.target = positionals[0];
  }

  return args;
}

function parsePositiveInt(value, flag) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${flag} must be a positive integer. Received: ${value}`);
  }
  return parsed;
}

function encodePackageName(packageName) {
  return encodeURIComponent(packageName);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, { timeoutMs = DEFAULTS.timeoutMs, retries = 3 } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': USER_AGENT,
          accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.status === 404) {
        return null;
      }

      if (response.status === 429 || response.status >= 500) {
        const retryAfter = response.headers.get('retry-after');
        const waitMs = retryAfter ? Math.min(Number(retryAfter) * 1000, 30000) : 2000 * attempt;
        await sleep(waitMs);
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status}: ${body.slice(0, 300)}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < retries) {
        await sleep(300 * attempt);
      }
    }
  }

  throw lastError;
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(workers);
  return results;
}

function formatNumber(value) {
  if (value == null || Number.isNaN(value)) return 'n/a';
  return new Intl.NumberFormat('en-US').format(value);
}

function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return 'n/a';
  return `${value.toFixed(1)}%`;
}

function normalizeRepositoryUrl(repository) {
  if (!repository) return null;
  if (typeof repository === 'string') return repository;
  if (typeof repository.url === 'string') return repository.url;
  return null;
}

function inspectManifestSections(manifest, targetPackage) {
  const matches = [];

  for (const section of DEPENDENCY_SECTIONS) {
    const deps = manifest?.[section];
    if (deps && typeof deps === 'object' && targetPackage in deps) {
      matches.push({
        section,
        range: deps[targetPackage],
      });
    }
  }

  return matches;
}

function analyzeRegistryPackage(targetPackage, registryDoc) {
  if (!registryDoc) {
    return {
      latestVersion: null,
      latestStatus: 'unknown',
      latestDependencySections: [],
      latestDependencyRange: null,
      latestMatchedVersion: null,
      matchedVersionsCount: 0,
      repositoryUrl: null,
    };
  }

  const versions = registryDoc.versions ?? {};
  const time = registryDoc.time ?? {};
  const latestVersion = registryDoc['dist-tags']?.latest ?? null;
  const latestManifest = latestVersion ? versions[latestVersion] : null;
  const latestMatches = inspectManifestSections(latestManifest, targetPackage);

  const matchingVersions = Object.entries(versions)
    .map(([version, manifest]) => ({
      version,
      matches: inspectManifestSections(manifest, targetPackage),
      publishedAt: time[version] ?? null,
    }))
    .filter((entry) => entry.matches.length > 0)
    .sort((left, right) => {
      const leftTime = left.publishedAt ?? '';
      const rightTime = right.publishedAt ?? '';
      return leftTime.localeCompare(rightTime);
    });

  const latestMatched = matchingVersions.at(-1) ?? null;
  const latestStatus = latestMatches.length > 0
    ? (latestMatches.some((item) => item.section === 'dependencies' || item.section === 'optionalDependencies')
      ? 'current_runtime'
      : 'current_non_runtime')
    : (matchingVersions.length > 0 ? 'historical' : 'unknown');

  return {
    latestVersion,
    latestStatus,
    latestDependencySections: latestMatches.map((item) => item.section),
    latestDependencyRange: latestMatches.map((item) => `${item.section}:${item.range}`).join(' | ') || null,
    latestMatchedVersion: latestMatched?.version ?? null,
    matchedVersionsCount: matchingVersions.length,
    repositoryUrl:
      normalizeRepositoryUrl(latestManifest?.repository) ||
      normalizeRepositoryUrl(registryDoc.repository) ||
      normalizeRepositoryUrl(registryDoc.versions?.[latestVersion]?.homepage) ||
      null,
  };
}

async function getWeeklyDownloads(packageName, period, timeoutMs) {
  const encoded = encodePackageName(packageName);
  const response = await fetchJson(`https://api.npmjs.org/downloads/point/${period}/${encoded}`, {
    timeoutMs,
    retries: 3,
  });
  return response?.downloads ?? null;
}

async function getDependentList(packageName, totalDependents, perPage, timeoutMs) {
  if (!totalDependents || totalDependents <= 0) {
    return [];
  }

  const pageSizes = [...new Set([perPage, 25, 10].filter((size) => size > 0))];
  const encoded = encodePackageName(packageName);

  for (const currentPerPage of pageSizes) {
    const collected = [];
    let failed = false;
    let emptyPages = 0;

    for (let page = 1; page <= 20; page += 1) {
      const url = `https://packages.ecosyste.ms/api/v1/registries/npmjs.org/packages/${encoded}/dependent_packages?page=${page}&per_page=${currentPerPage}`;
      try {
        const pageItems = await fetchJson(url, { timeoutMs, retries: 3 });
        if (!Array.isArray(pageItems)) {
          failed = true;
          break;
        }

        if (pageItems.length === 0) {
          emptyPages += 1;
          if (emptyPages >= 1) {
            break;
          }
          continue;
        }

        emptyPages = 0;
        collected.push(...pageItems);
      } catch {
        failed = true;
        break;
      }
    }

    if (!failed && collected.length > 0) {
      const deduped = new Map();
      for (const item of collected) {
        if (item?.name && !deduped.has(item.name)) {
          deduped.set(item.name, item);
        }
      }
      return Array.from(deduped.values());
    }
  }

  throw new Error(`Unable to fetch dependents for ${packageName} from ecosyste.ms.`);
}

async function buildReport(targetPackage, options) {
  const encodedTarget = encodePackageName(targetPackage);
  const [targetDownloads, packageMeta, comparisonDownloads] = await Promise.all([
    getWeeklyDownloads(targetPackage, options.period, options.timeoutMs),
    fetchJson(`https://packages.ecosyste.ms/api/v1/registries/npmjs.org/packages/${encodedTarget}`, {
      timeoutMs: options.timeoutMs,
      retries: 3,
    }),
    Promise.all(
      options.compare.map(async (packageName) => ({
        name: packageName,
        downloads: await getWeeklyDownloads(packageName, options.period, options.timeoutMs),
      })),
    ),
  ]);

  if (!packageMeta) {
    throw new Error(`Package not found in ecosyste.ms: ${targetPackage}`);
  }

  let dependents = await getDependentList(
    targetPackage,
    packageMeta.dependent_packages_count ?? 0,
    options.perPage,
    options.timeoutMs,
  );

  if (options.maxDependents) {
    dependents = dependents.slice(0, options.maxDependents);
  }

  const dependentRows = await mapLimit(dependents, options.concurrency, async (dependent, index) => {
    const packageName = dependent.name;
    process.stderr.write(`\rInspecting dependent ${index + 1}/${dependents.length}: ${packageName}      `);

    const encoded = encodePackageName(packageName);
    // small delay to avoid rate limiting
    await sleep(100);
    const [downloads, registryDoc] = await Promise.all([
      getWeeklyDownloads(packageName, options.period, options.timeoutMs).catch(() => null),
      fetchJson(`https://registry.npmjs.org/${encoded}`, {
        timeoutMs: options.timeoutMs,
        retries: 2,
      }).catch(() => null),
    ]);

    const analysis = analyzeRegistryPackage(targetPackage, registryDoc);

    return {
      name: packageName,
      downloads,
      ratioVsTarget: targetDownloads ? (downloads ?? 0) / targetDownloads : null,
      latestStatus: analysis.latestStatus,
      latestVersion: analysis.latestVersion,
      latestDependencySections: analysis.latestDependencySections,
      latestDependencyRange: analysis.latestDependencyRange,
      latestMatchedVersion: analysis.latestMatchedVersion,
      matchedVersionsCount: analysis.matchedVersionsCount,
      repositoryUrl: analysis.repositoryUrl || dependent.repository_url || null,
      homepage: dependent.homepage || null,
      description: dependent.description || null,
    };
  });

  process.stderr.write('\n');

  const sortedRows = dependentRows
    .filter((row) => options.includeZero || (row.downloads ?? 0) > 0)
    .sort((left, right) => {
      const leftStatus = CURRENT_STATUS_ORDER[left.latestStatus] ?? CURRENT_STATUS_ORDER.unknown;
      const rightStatus = CURRENT_STATUS_ORDER[right.latestStatus] ?? CURRENT_STATUS_ORDER.unknown;
      if (leftStatus !== rightStatus) {
        return leftStatus - rightStatus;
      }
      return (right.downloads ?? -1) - (left.downloads ?? -1);
    });

  const statusBuckets = {
    current_runtime: sortedRows.filter((row) => row.latestStatus === 'current_runtime'),
    current_non_runtime: sortedRows.filter((row) => row.latestStatus === 'current_non_runtime'),
    historical: sortedRows.filter((row) => row.latestStatus === 'historical'),
    unknown: sortedRows.filter((row) => row.latestStatus === 'unknown'),
  };

  return {
    generatedAt: new Date().toISOString(),
    period: options.period,
    target: {
      name: targetPackage,
      downloads: targetDownloads,
      dependentPackagesCount: packageMeta.dependent_packages_count ?? dependents.length,
      repositoryUrl: packageMeta.repository_url ?? null,
      npmUrl: packageMeta.registry_url ?? null,
      description: packageMeta.description ?? null,
    },
    comparisons: comparisonDownloads.map((item) => ({
      ...item,
      ratioVsTarget: targetDownloads ? item.downloads / targetDownloads : null,
    })),
    analyzedDependents: dependents.length,
    rows: sortedRows,
    summary: {
      currentRuntimeCount: statusBuckets.current_runtime.length,
      currentNonRuntimeCount: statusBuckets.current_non_runtime.length,
      historicalCount: statusBuckets.historical.length,
      unknownCount: statusBuckets.unknown.length,
      currentRuntimeTopDownloads: statusBuckets.current_runtime
        .slice(0, options.top)
        .reduce((sum, row) => sum + (row.downloads ?? 0), 0),
    },
  };
}

function printSection(title, rows, targetDownloads, top) {
  console.log(`\n${title}`);
  if (rows.length === 0) {
    console.log('  none');
    return;
  }

  const subset = rows.slice(0, top);
  const header = [
    '#'.padEnd(4),
    'downloads'.padEnd(12),
    '%target'.padEnd(9),
    'status'.padEnd(18),
    'dependency'.padEnd(26),
    'package',
  ].join(' ');

  console.log(header);
  console.log('-'.repeat(header.length));

  subset.forEach((row, index) => {
    const ratio = targetDownloads ? ((row.downloads ?? 0) / targetDownloads) * 100 : null;
    const dependencySummary = row.latestDependencyRange ?? (row.latestMatchedVersion ? `historical via ${row.latestMatchedVersion}` : 'n/a');
    const columns = [
      `${index + 1}.`.padEnd(4),
      formatNumber(row.downloads).padEnd(12),
      formatPercent(ratio).padEnd(9),
      row.latestStatus.padEnd(18),
      dependencySummary.slice(0, 26).padEnd(26),
      row.name,
    ];

    console.log(columns.join(' '));
  });
}

function printReport(report, top) {
  console.log(`Target package: ${report.target.name}`);
  console.log(`Period: ${report.period}`);
  console.log(`Weekly downloads: ${formatNumber(report.target.downloads)}`);
  console.log(`Direct dependents discovered: ${formatNumber(report.target.dependentPackagesCount)}`);
  console.log(`Dependents analyzed: ${formatNumber(report.analyzedDependents)}`);
  console.log(
    `Status counts: current runtime ${formatNumber(report.summary.currentRuntimeCount)}, current non-runtime ${formatNumber(report.summary.currentNonRuntimeCount)}, historical ${formatNumber(report.summary.historicalCount)}, unknown ${formatNumber(report.summary.unknownCount)}`,
  );

  if (report.comparisons.length > 0) {
    console.log('\nComparison packages:');
    for (const comparison of report.comparisons) {
      console.log(
        `- ${comparison.name}: ${formatNumber(comparison.downloads)} (${comparison.ratioVsTarget != null ? `${(comparison.ratioVsTarget * 100).toFixed(2)}% of target` : 'ratio n/a'})`,
      );
    }
  }

  console.log('\nInterpretation tips:');
  console.log('- current_runtime = latest published version still depends on the target at runtime.');
  console.log('- current_non_runtime = latest version only depends via peer/dev dependency.');
  console.log('- historical = some older versions depended on the target, latest no longer does.');
  console.log('- dependent downloads are only an upper bound for who may be driving target downloads.');

  const rows = report.rows;
  printSection(
    'Top overall suspects',
    [...rows].sort((left, right) => (right.downloads ?? -1) - (left.downloads ?? -1)),
    report.target.downloads,
    top,
  );
  printSection(
    'Top current runtime dependents',
    rows.filter((row) => row.latestStatus === 'current_runtime'),
    report.target.downloads,
    top,
  );
  printSection(
    'Top current non-runtime dependents',
    rows.filter((row) => row.latestStatus === 'current_non_runtime'),
    report.target.downloads,
    top,
  );
  printSection(
    'Top historical dependents',
    rows.filter((row) => row.latestStatus === 'historical'),
    report.target.downloads,
    top,
  );
}

function toCsvValue(value) {
  const stringValue = value == null ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

async function writeReportFile(filePath, content) {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, content, 'utf8');
  console.log(`Wrote ${filePath}`);
}

async function maybeWriteJson(report, filePath) {
  if (!filePath) return;
  await writeReportFile(filePath, `${JSON.stringify(report, null, 2)}\n`);
}

async function maybeWriteCsv(report, filePath) {
  if (!filePath) return;
  const header = [
    'package',
    'downloads',
    'ratioVsTarget',
    'latestStatus',
    'latestVersion',
    'latestDependencySections',
    'latestDependencyRange',
    'latestMatchedVersion',
    'matchedVersionsCount',
    'repositoryUrl',
    'homepage',
    'description',
  ];

  const lines = [header.join(',')];
  for (const row of report.rows) {
    lines.push([
      row.name,
      row.downloads,
      row.ratioVsTarget,
      row.latestStatus,
      row.latestVersion,
      row.latestDependencySections.join('|'),
      row.latestDependencyRange,
      row.latestMatchedVersion,
      row.matchedVersionsCount,
      row.repositoryUrl,
      row.homepage,
      row.description,
    ].map(toCsvValue).join(','));
  }

  await writeReportFile(filePath, `${lines.join('\n')}\n`);
}

async function main() {
  let options;

  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (options.help || !options.target) {
    printUsage();
    return;
  }

  const report = await buildReport(options.target, options);
  printReport(report, options.top);
  await maybeWriteJson(report, options.json);
  await maybeWriteCsv(report, options.csv);
}

main().catch((error) => {
  console.error(`\nFailed: ${error?.message ?? error}`);
  process.exitCode = 1;
});
