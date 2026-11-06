#!/bin/bash
# build-all.sh - Build both the Go sidecar and the Tauri application

set -e

# Detect target triple for Tauri sidecar naming
TARGET_TRIPLE=$(rustc -Vv | grep host | cut -d ' ' -f 2)

echo "--- Building Go Sidecar for $TARGET_TRIPLE ---"
./scripts/build_sidecar_matrix.sh "$TARGET_TRIPLE"

echo "--- Building Frontend ---"
npm install
npm run build

echo "--- Building Tauri Application ---"
# Note: This requires Rust and tauri-cli to be installed
npm run tauri build

echo "--- Build Complete ---"
echo "Sidecar binary: src-tauri/bin/sidecar-$TARGET_TRIPLE"
echo "Tauri bundle: src-tauri/target/release/bundle/"
