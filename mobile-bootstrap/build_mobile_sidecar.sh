#!/bin/bash
echo "Building Go sidecar for Android/iOS..."
# GOOS=android GOARCH=arm64 go build -buildmode=c-shared -o sidecar_android.so ../src-tauri/background/main.go
# GOOS=ios GOARCH=arm64 go build -buildmode=c-archive -o sidecar_ios.a ../src-tauri/background/main.go
echo "Cross-compilation scaffold complete."
