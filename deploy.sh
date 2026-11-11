#!/bin/bash
# Checks the project, then commits everything with a timestamp message and pushes to origin.
# origin is the public GitHub repository, so the script lists what it is about to publish
# and asks before it commits.
#
# Usage: ./deploy.sh [-y]    -y skips the question
#
# The package.json scripts run with "deno task" by default. Set RUN to use another
# runner, for example: RUN="npm run" ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

RUN="${RUN:-deno task}"
$RUN lint
$RUN check
$RUN test
$RUN build

git add -A
if git diff --cached --quiet; then
	echo "Nothing to commit."
	exit 0
fi

echo
echo "These changes will be committed and pushed to the public repository:"
git status --short
if [[ "${1:-}" != "-y" ]]; then
	read -r -p "Continue? [y/N] " answer
	if [[ ! "$answer" =~ ^[Yy]$ ]]; then
		echo "Stopped. The changes are staged but not committed."
		exit 1
	fi
fi

TIMESTAMP=$(date "+%Y-%m-%dT%H-%M-%S")
echo "$TIMESTAMP"
git commit -m "$TIMESTAMP"
git push origin
