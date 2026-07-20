#!/usr/bin/env bash
#
# git-unlock.sh — safely remove a stale .git/index.lock.
#
# Background: when a Cowork/Claude session touches this repo over the desktop
# bridge, git's normal cleanup of its transient .git/index.lock can be blocked
# by the bridge's permission model, leaving a zero-byte lock behind. Native git
# then refuses to run with "Another git process seems to be running."
#
# This script removes the lock ONLY when it is genuinely stale — i.e. no git
# process is actually running and the lock is at least a couple of seconds old —
# so it can never race a legitimate concurrent git operation.
#
# Usage:  bash scripts/git-unlock.sh        (or: git unlock  — see alias below)

set -euo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
gitdir="$root/.git"
lock="$gitdir/index.lock"

[ -f "$lock" ] || { echo "No .git/index.lock present — nothing to do."; exit 0; }

# Guard 1: bail if a real git process is running.
if pgrep -x git >/dev/null 2>&1; then
  echo "A git process is currently running — leaving the lock in place."
  exit 0
fi

# Guard 2: only remove locks that are at least 2s old (avoids racing a git op
# that just started between the pgrep check and now).
now="$(date +%s)"
if command -v stat >/dev/null 2>&1; then
  mtime="$(stat -f %m "$lock" 2>/dev/null || stat -c %Y "$lock" 2>/dev/null || echo 0)"
  if [ "$mtime" -gt 0 ] && [ "$((now - mtime))" -lt 2 ]; then
    echo "Lock was just created (<2s ago) — leaving it in place to be safe."
    exit 0
  fi
fi

rm -f "$lock" && echo "Removed stale $lock"
