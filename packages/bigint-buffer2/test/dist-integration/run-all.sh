#!/bin/bash
# Integration tests for built dist files
# Run from package root: ./test/dist-integration/run-all.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PACKAGE_DIR"

echo "========================================"
echo "Running dist integration tests"
echo "========================================"
echo ""

# Check dist files exist
if [ ! -f "dist/node.cjs.js" ]; then
  echo "❌ dist/node.cjs.js not found. Run 'yarn build' first."
  exit 1
fi

if [ ! -f "dist/node.esm.mjs" ]; then
  echo "❌ dist/node.esm.mjs not found. Run 'yarn build' first."
  exit 1
fi

if [ ! -f "dist/browser.esm.mjs" ]; then
  echo "❌ dist/browser.esm.mjs not found. Run 'yarn build' first."
  exit 1
fi

echo "✓ All dist files present"
echo ""

# Test CJS
echo "----------------------------------------"
echo "Testing CJS build..."
echo "----------------------------------------"
node test/dist-integration/node-cjs.test.cjs
echo ""

# Test ESM
echo "----------------------------------------"
echo "Testing ESM build..."
echo "----------------------------------------"
node test/dist-integration/node-esm.test.mjs
echo ""

echo "========================================"
echo "✅ All dist integration tests passed!"
echo "========================================"
