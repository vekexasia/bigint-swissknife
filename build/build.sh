#!/usr/bin/env bash

cd packages;
ordered_packages=("bigint-uint8array" "bigint-constrained" "bigint-math" "bigint-buffer-polyfill")
for package in "${ordered_packages[@]}"; do
  cd $package;
  npm run build;
  cd ..;
done
