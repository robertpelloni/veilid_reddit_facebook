#!/bin/bash
# scripts/build_sidecar_matrix.sh
# Automates Go sidecar compilation across host and cross-compilation target triples for Tauri v2.

set -euo pipefail

TARGET="${1:-}"

# Supported targets
SUPPORTED_TARGETS=(
    "x86_64-unknown-linux-gnu"
    "aarch64-unknown-linux-gnu"
    "x86_64-pc-windows-msvc"
    "x86_64-pc-windows-gnu"
    "x86_64-apple-darwin"
    "aarch64-apple-darwin"
)

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
        echo "Warning: Target triple '$TARGET' is not in standard matrix (${SUPPORTED_TARGETS[*]}). Defaulting to host Go environment."
        ;;
esac

OUTPUT_BIN="$BIN_DIR/sidecar-$TARGET$EXTENSION"
ROOT_BIN="$ROOT_TAURI_DIR/sidecar-$TARGET$EXTENSION"

echo "Compiling ./src-tauri/background -> $OUTPUT_BIN (GOOS=${GOOS:-default}, GOARCH=${GOARCH:-default})"
go build -ldflags="-s -w" -o "$OUTPUT_BIN" ./src-tauri/background

# Verify binary was created and is non-empty
if [ ! -s "$OUTPUT_BIN" ]; then
    echo "Error: Output binary $OUTPUT_BIN was not created or is empty!" >&2
    exit 1
fi

# Satisfy Tauri v2 bundle & cargo check externalBin lookup
echo "Syncing binary to Tauri externalBin location -> $ROOT_BIN"
cp "$OUTPUT_BIN" "$ROOT_BIN"

# Compute SHA-256 for release verification
CHECKSUM=$(sha256sum "$OUTPUT_BIN" | cut -d ' ' -f 1)

echo "=== Build Successful: $OUTPUT_BIN ==="
echo "SHA-256: $CHECKSUM"
ls -lh "$OUTPUT_BIN" "$ROOT_BIN"
