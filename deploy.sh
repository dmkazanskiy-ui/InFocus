#!/usr/bin/env bash
# Build and publish dist/ to the gh-pages branch (GitHub Pages "Deploy from a branch").
# Requires git credentials for github.com to be cached (run a normal `git push`
# once from Terminal.app to store them in the macOS Keychain).
set -euo pipefail

REPO="https://github.com/dmkazanskiy-ui/InFocus.git"
cd "$(dirname "$0")"

export PATH="/opt/homebrew/bin:$PATH"
npm run build

cd dist
touch .nojekyll
rm -rf .git
git init -q
git checkout -q -b gh-pages
git add -A
git commit -q -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git push -f "$REPO" gh-pages
rm -rf .git
echo "Deployed → https://dmkazanskiy-ui.github.io/InFocus/"
