#!/usr/bin/env bash
# ShellCheck lab + repo scripts (same set as CI). Skips with a warning if missing locally.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v shellcheck >/dev/null 2>&1; then
  echo "SKIP: shellcheck not installed (CI still runs it). Install shellcheck to check locally."
  exit 0
fi

shellcheck scripts/*.sh labs/*/run.sh
echo "ShellCheck passed."
