#!/bin/bash
# build-all.sh - Build both the Go sidecar and the Tauri application

set -e

echo "--- Building Go Sidecar ---"
mkdir -p bin
go build -o bin/sidecar ./src-tauri/background/main.go

echo "--- Building Frontend ---"
npm install
npm run build

echo "--- Building Tauri Application ---"
# Note: This requires Rust and tauri-cli to be installed
npm run tauri build

echo "--- Build Complete ---"
echo "Binaries are located in bin/ and src-tauri/target/release/"
