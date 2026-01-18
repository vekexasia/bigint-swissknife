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
  echo "ERROR: No successful CI build found for commit $CURRENT_COMMIT"
  echo ""
  echo "Either:"
  echo "  1. Push your changes and wait for CI to complete"
  echo "  2. Manually trigger the 'Build Native Binaries' workflow"
  echo ""
  echo "Then run this script again."
  exit 1
fi

echo "Found successful CI run: $RUN_INFO"

# Check if we already have all binaries
EXPECTED_BINARIES=(
  "index.darwin-arm64.node"
  "index.darwin-x64.node"
  "index.linux-arm64-gnu.node"
  "index.linux-x64-gnu.node"
  "index.win32-x64-msvc.node"
)

MISSING_BINARIES=false
for binary in "${EXPECTED_BINARIES[@]}"; do
  if [ ! -f "$binary" ]; then
    MISSING_BINARIES=true
    echo "Missing: $binary"
  fi
done

if [ "$MISSING_BINARIES" = true ]; then
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
else
  echo "All binaries already present"
fi

# Verify all binaries exist
for binary in "${EXPECTED_BINARIES[@]}"; do
  if [ ! -f "$binary" ]; then
    echo "ERROR: Missing binary after download: $binary"
    exit 1
  fi
done

echo "All native binaries ready for publishing!"
