#!/usr/bin/env bash
set -u

# Ferma soltanto i processi avviati dal Project Work.
# Non usa killall/pkill generici: individua i processi tramite cwd e percorso
# del progetto, proteggendo lo script e la shell da cui viene eseguito.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"

declare -A seen=()
declare -A protected=()
pids=()

add_protected_ancestors() {
  local pid="$1"
  while [[ "$pid" =~ ^[0-9]+$ ]] && [[ "$pid" != "1" ]] && [[ -z "${protected[$pid]+x}" ]]; do
    protected[$pid]=1
    pid="$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')"
  done
}

add_pid() {
  local pid="$1"
  [[ "$pid" =~ ^[0-9]+$ ]] || return 0
  [[ "$pid" == "1" ]] && return 0
  [[ -n "${protected[$pid]+x}" ]] && return 0
  [[ -n "${seen[$pid]+x}" ]] && return 0
  seen[$pid]=1
  pids+=("$pid")
}

add_descendants() {
  local parent="$1" child
  while read -r child; do
    [[ -n "$child" ]] || continue
    add_pid "$child"
    add_descendants "$child"
  done < <(pgrep -P "$parent" 2>/dev/null || true)
}

add_protected_ancestors "$$"
add_protected_ancestors "$PPID"

# I processi npm/node/ng/esbuild del progetto normalmente hanno cwd in
# backend o frontend. Il controllo sul comando copre anche processi con cwd
# cambiata ma con un riferimento assoluto alla cartella del progetto.
for proc in /proc/[0-9]*; do
  pid="${proc##*/}"
  [[ "$pid" =~ ^[0-9]+$ ]] || continue
  [[ -r "$proc/cmdline" ]] || continue

  cwd="$(readlink -f "$proc/cwd" 2>/dev/null || true)"
  cmd="$(tr '\0' ' ' < "$proc/cmdline" 2>/dev/null || true)"

  if [[ "$cwd" == "$BACKEND_DIR" || "$cwd" == "$FRONTEND_DIR" ||
        "$cmd" == *"$BACKEND_DIR"* || "$cmd" == *"$FRONTEND_DIR"* ||
        ("$cwd" == "$ROOT" && "$cmd" == *"avvia-portale.sh"*) ]]; then
    add_pid "$pid"
  fi
done

# Includi i figli (concurrently, node --watch, ng serve, esbuild, ecc.).
for pid in "${pids[@]}"; do
  add_descendants "$pid"
done

if [[ "${#pids[@]}" -eq 0 ]]; then
  echo "Nessun processo del Project Work da fermare."
  exit 0
fi

echo "Fermo ${#pids[@]} processi del Project Work..."
for pid in "${pids[@]}"; do
  if kill -0 "$pid" 2>/dev/null; then
    echo "  stop $pid: $(ps -o comm= -p "$pid" 2>/dev/null | tr -d ' ')"
    kill -TERM "$pid" 2>/dev/null || true
  fi
done

for _ in {1..20}; do
  remaining=0
  for pid in "${pids[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      remaining=1
      break
    fi
  done
  [[ "$remaining" -eq 0 ]] && break
  sleep 0.25
done

for pid in "${pids[@]}"; do
  kill -KILL "$pid" 2>/dev/null || true
done

echo "Processi del Project Work fermati."
