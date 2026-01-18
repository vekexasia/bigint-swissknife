#!/bin/bash
set -e

# Get the current git commit
CURRENT_COMMIT=$(git rev-parse HEAD)

echo "Current commit: $CURRENT_COMMIT"

# Find the latest successful workflow run for build_native.yaml on this commit
echo "Looking for CI artifacts built at commit $CURRENT_COMMIT..."

RUN_INFO=$(gh run list --workflow="Build Native Binaries" --json headSha,databaseId,conclusion --limit 20 | \
  jq -r ".[] | select(.headSha == \"$CURRENT_COMMIT\" and .conclusion == \"success\") | .databaseId" | head -1)

if [ -z "$RUN_INFO" ]; then
  echo "No successful CI build found for commit $CURRENT_COMMIT"
  echo "Triggering 'Build Native Binaries' workflow..."

  # Trigger the workflow
  gh workflow run build_native.yaml

  # Wait a moment for the run to be registered
  sleep 5

  # Find the new run ID
  echo "Waiting for workflow to start..."
  for i in {1..12}; do
    RUN_INFO=$(gh run list --workflow="Build Native Binaries" --json headSha,databaseId,status --limit 5 | \
      jq -r ".[] | select(.headSha == \"$CURRENT_COMMIT\") | .databaseId" | head -1)
    if [ -n "$RUN_INFO" ]; then
      break
    fi
    sleep 5
  done

  if [ -z "$RUN_INFO" ]; then
    echo "ERROR: Failed to find triggered workflow run"
    exit 1
  fi

  echo "Workflow started (run $RUN_INFO). Waiting for completion..."
  gh run watch "$RUN_INFO" --exit-status

  if [ $? -ne 0 ]; then
    echo "ERROR: Workflow failed. Check the logs with: gh run view $RUN_INFO --log"
    exit 1
  fi

  echo "Workflow completed successfully!"
else
  echo "Found existing successful CI run: $RUN_INFO"
fi

# Always download binaries from CI to ensure we have the correct artifacts
EXPECTED_BINARIES=(
  "index.darwin-arm64.node"
  "index.darwin-x64.node"
  "index.linux-arm64-gnu.node"
  "index.linux-x64-gnu.node"
  "index.win32-x64-msvc.node"
)

echo "Downloading artifacts from CI run $RUN_INFO..."

# Clean up old artifacts
rm -rf artifacts
rm -f *.node

# Download artifacts
gh run download "$RUN_INFO" -D artifacts

# Move binaries to package root
find artifacts -name "*.node" -exec mv {} . \;

# Clean up artifacts directory
rm -rf artifacts

echo "Downloaded binaries:"
ls -la *.node

# Verify all binaries exist
for binary in "${EXPECTED_BINARIES[@]}"; do
  if [ ! -f "$binary" ]; then
    echo "ERROR: Missing binary after download: $binary"
    exit 1
  fi
done

echo "All native binaries ready!"

# Verify TypeScript types exist
EXPECTED_TYPES=(
  "dist/types/packages/bigint-buffer2/src/index.d.ts"
  "dist/types/packages/bigint-buffer2/src/fallback.d.ts"
  "dist/types/packages/bigint-buffer2/src/native/index.d.ts"
  "dist/types/packages/bigint-buffer2/src/types.d.ts"
)

echo "Checking TypeScript declarations..."
for typefile in "${EXPECTED_TYPES[@]}"; do
  if [ ! -f "$typefile" ]; then
    echo "ERROR: Missing type declaration: $typefile"
    echo "Run 'yarn build' first to generate type declarations."
    exit 1
  fi
done

# Verify dist JS bundles exist
EXPECTED_BUNDLES=(
  "dist/node.esm.mjs"
  "dist/node.cjs.js"
  "dist/browser.esm.mjs"
  "dist/native.esm.mjs"
  "dist/js.esm.mjs"
)

echo "Checking JS bundles..."
for bundle in "${EXPECTED_BUNDLES[@]}"; do
  if [ ! -f "$bundle" ]; then
    echo "ERROR: Missing JS bundle: $bundle"
    echo "Run 'yarn build' first to generate bundles."
    exit 1
  fi
done

echo "All checks passed! Ready for publishing."
