#!/usr/bin/env bash
# Run gitleaks against the repo. Teaching demos are allowlisted in .gitleaks.toml.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Pin by release asset (same style as ShellCheck in CI). Refresh when upgrading.
GITLEAKS_VER="${GITLEAKS_VER:-8.21.2}"
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64 | amd64) GL_ARCH=x64 ;;
  aarch64 | arm64) GL_ARCH=arm64 ;;
  *)
    echo "Unsupported architecture for gitleaks: $ARCH" >&2
    exit 1
    ;;
esac

OS="$(uname -s)"
case "$OS" in
  Linux) GL_OS=linux ;;
  Darwin) GL_OS=darwin ;;
  *)
    echo "Unsupported OS for gitleaks: $OS" >&2
    exit 1
    ;;
esac

CACHE_DIR="${TMPDIR:-/tmp}/rean-gitleaks-${GITLEAKS_VER}"
BIN="${CACHE_DIR}/gitleaks"

if [[ ! -x "$BIN" ]]; then
  mkdir -p "$CACHE_DIR"
  TGZ="${CACHE_DIR}/gitleaks.tgz"
  URL="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VER}/gitleaks_${GITLEAKS_VER}_${GL_OS}_${GL_ARCH}.tar.gz"
  curl -fsSL -o "$TGZ" "$URL"
  tar -xzf "$TGZ" -C "$CACHE_DIR" gitleaks
  rm -f "$TGZ"
  chmod +x "$BIN"
fi

"$BIN" version
"$BIN" detect --source "$ROOT" --config "$ROOT/.gitleaks.toml" --no-banner --redact
echo "Secret scan passed."
