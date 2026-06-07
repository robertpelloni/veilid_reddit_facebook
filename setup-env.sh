#!/bin/bash
# setup-env.sh - Environment setup for Veilid Reddit MySpace

set -e

echo "--- Updating System Packages ---"
sudo apt-get update

echo "--- Installing System Libraries ---"
sudo apt-get install -y \
    libgtk-3-dev \
    libwebkit2gtk-4.1-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libsoup2.4-dev \
    imagemagick \
    curl \
    build-essential \
    pkg-config

echo "--- Configuring WebKitGTK 4.0 Compatibility (Ubuntu 24.04) ---"
sudo ln -sf /usr/lib/x86_64-linux-gnu/pkgconfig/webkit2gtk-4.1.pc /usr/lib/x86_64-linux-gnu/pkgconfig/webkit2gtk-4.0.pc
sudo ln -sf /usr/lib/x86_64-linux-gnu/pkgconfig/javascriptcoregtk-4.1.pc /usr/lib/x86_64-linux-gnu/pkgconfig/javascriptcoregtk-4.0.pc
sudo ln -sf /usr/lib/x86_64-linux-gnu/libwebkit2gtk-4.1.so /usr/lib/x86_64-linux-gnu/libwebkit2gtk-4.0.so
sudo ln -sf /usr/lib/x86_64-linux-gnu/libjavascriptcoregtk-4.1.so /usr/lib/x86_64-linux-gnu/libjavascriptcoregtk-4.0.so

echo "--- Verifying Rust Installation ---"
if ! command -v rustc &> /dev/null; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
else
    echo "Rust already installed: $(rustc --version)"
fi

echo "--- Verifying Go Installation ---"
if ! command -v go &> /dev/null; then
    echo "Please install Go v1.22+ from https://go.dev/dl/"
else
    echo "Go already installed: $(go version)"
fi

echo "--- Verifying Node.js Installation ---"
if ! command -v node &> /dev/null; then
    echo "Please install Node.js (v20+) from https://nodejs.org/"
else
    echo "Node.js already installed: $(node -v)"
fi

echo "--- Environment Setup Complete ---"
