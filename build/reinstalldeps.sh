#!/usr/bin/env bash
rm -rf node_modules;
yarn install --immutable;
cd packages;
ordered_packages=("bigint-uint8array" "bigint-constrained" "bigint-math" "bigint-buffer-polyfill")
for package in "${ordered_packages[@]}"; do
  cd $package;
  rm -rf node_modules;
  yarn install --immutable
  cd ..;
done
cd ..
