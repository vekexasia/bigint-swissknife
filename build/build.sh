#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

ordered_packages=("bigint-buffer2" "bigint-uint8array" "bigint-constrained" "bigint-math" "bigint-buffer-polyfill")

for package in "${ordered_packages[@]}"; do
  echo "Building $package..."
  cd "$ROOT_DIR/packages/$package"
  yarn run build || {
    echo "Error: Failed to build $package"
    exit 1
  }
done

echo "All packages built successfully!"
