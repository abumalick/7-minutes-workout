#!/usr/bin/env bash
#
# Start the Vite dev server for this worktree, registered with the running
# shared `portless-dev` proxy. The server becomes reachable (trusted HTTPS,
# no CA install) at:
#
#   https://my-workout-<branch-leaf>.dev.sageplex.com  (feat/foo -> my-workout-foo.…)
#   https://my-workout.dev.sageplex.com                (on main)
#
# The base label "my-workout" comes from package.json "portless"; the leaf is
# the branch's last "/"-separated segment. Run it directly (NOT via a package
# manager, whose env would make the portless fork refuse to start):
#
#   bash scripts/dev-server.sh
#
set -euo pipefail

cd "$(dirname "$0")/.."

# The portless fork refuses to start when launched via a package manager
# (npx/pnpm dlx). Agent shells leak npm_*/PNPM_*/COREPACK_* env that trips this;
# strip them so portless launches cleanly.
while IFS='=' read -r _name _; do
  case "$_name" in
    npm_* | PNPM_* | pnpm_* | COREPACK_*) unset "$_name" ;;
  esac
done < <(env)

# The shared systemd `portless-dev` service (tld dev.sageplex.com, port 8447)
# keeps its state outside portless's default ~/.portless, so point at it
# explicitly or `portless run` reports "Proxy is not running".
export PORTLESS_STATE_DIR="${PORTLESS_STATE_DIR:-$HOME/.portless-dev}"

PORTLESS_BIN="${PORTLESS_BIN:-$HOME/.local/share/mise/shims/portless}"

# IPv4-bound on purpose: the proxy dials 127.0.0.1, while Vite would otherwise
# bind [::1] and the proxy would 502.
exec "$PORTLESS_BIN" run \
  sh -c './node_modules/.bin/vite --port "$PORT" --strictPort --host 127.0.0.1'
