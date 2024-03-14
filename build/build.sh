#!/usr/bin/env bash

cd packages;

for package in $(ls -d */); do
  cd $package;
  npm run build;
  cd ..;
done
