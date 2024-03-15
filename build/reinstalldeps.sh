#!/usr/bin/env bash
rm -rf node_modules;
yarn
cd packages;
ordered_packages=("bigint-uint8array" "bigint-constrained" "bigint-math" "bigint-buffer-polyfill")
for package in "${ordered_packages[@]}"; do
  cd $package;
  rm -rf node_modules;
  yarn
  cd ..;
done
