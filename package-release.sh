#!/bin/bash
# package-release.sh - Package the Veilid Reddit MySpace release

set -e

# Detect target triple
TARGET_TRIPLE=$(rustc -Vv | grep host | cut -d ' ' -f 2)
VERSION=$(cat VERSION.md)

echo "--- Packaging Release v$VERSION for $TARGET_TRIPLE ---"

# 1. Build Artifacts
./build-all.sh

# 2. Organize Release Folder
RELEASE_DIR="release/v$VERSION"
mkdir -p "$RELEASE_DIR"

echo "--- Copying Artifacts to $RELEASE_DIR ---"

# Copy Go Sidecar
cp "src-tauri/bin/sidecar-$TARGET_TRIPLE" "$RELEASE_DIR/"

# Copy Tauri Bundles
if [ -d "src-tauri/target/release/bundle/deb" ]; then
    cp src-tauri/target/release/bundle/deb/*.deb "$RELEASE_DIR/"
fi
if [ -d "src-tauri/target/release/bundle/appimage" ]; then
    cp src-tauri/target/release/bundle/appimage/*.AppImage "$RELEASE_DIR/"
fi
if [ -d "src-tauri/target/release/bundle/rpm" ]; then
    cp src-tauri/target/release/bundle/rpm/*.rpm "$RELEASE_DIR/"
fi

# Copy Documentation for release
cp README.md "$RELEASE_DIR/"
cp USER_MANUAL.md "$RELEASE_DIR/"

echo "--- Packaging Complete ---"
ls -la "$RELEASE_DIR"
