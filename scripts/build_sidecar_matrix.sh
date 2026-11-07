#!/bin/bash
# scripts/build_sidecar_matrix.sh
# Automates Go sidecar compilation across host and cross-compilation target triples for Tauri v2.

set -euo pipefail

TARGET="${1:-}"

if [ -z "$TARGET" ]; then
    if command -v rustc >/dev/null 2>&1; then
        TARGET=$(rustc -Vv | grep host | cut -d ' ' -f 2)
    else
        TARGET="x86_64-unknown-linux-gnu"
    fi
fi

echo "=== Building Veilid Go Sidecar for Target: $TARGET ==="

BIN_DIR="src-tauri/bin"
ROOT_TAURI_DIR="src-tauri"
mkdir -p "$BIN_DIR"

EXTENSION=""
case "$TARGET" in
    x86_64-unknown-linux-gnu)
        export GOOS=linux
        export GOARCH=amd64
        ;;
    aarch64-unknown-linux-gnu)
        export GOOS=linux
        export GOARCH=arm64
        ;;
    x86_64-pc-windows-msvc|x86_64-pc-windows-gnu)
        export GOOS=windows
        export GOARCH=amd64
        EXTENSION=".exe"
        ;;
    x86_64-apple-darwin)
        export GOOS=darwin
        export GOARCH=amd64
        ;;
    aarch64-apple-darwin)
        export GOOS=darwin
        export GOARCH=arm64
        ;;
    *)
        echo "Warning: Unrecognized target triple '$TARGET'. Defaulting to host Go environment."
        ;;
esac

OUTPUT_BIN="$BIN_DIR/sidecar-$TARGET$EXTENSION"
ROOT_BIN="$ROOT_TAURI_DIR/sidecar-$TARGET$EXTENSION"

echo "Compiling ./src-tauri/background -> $OUTPUT_BIN (GOOS=${GOOS:-default}, GOARCH=${GOARCH:-default})"
go build -ldflags="-s -w" -o "$OUTPUT_BIN" ./src-tauri/background

# Satisfy Tauri v2 bundle & cargo check externalBin lookup
echo "Syncing binary to Tauri externalBin location -> $ROOT_BIN"
cp "$OUTPUT_BIN" "$ROOT_BIN"

echo "=== Build Successful: $OUTPUT_BIN ==="
ls -lh "$OUTPUT_BIN" "$ROOT_BIN"
