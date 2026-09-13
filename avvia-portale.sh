#!/usr/bin/env bash
# Avvio locale del Project Work (equivalente Linux di avvia-portale.bat)

set -u

BPORT=3000
FPORT=4200
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WAIT_SECONDS="${WAIT_SECONDS:-180}"
DB_FILE="$ROOT/backend/data/policlinico.sqlite"
started=0

port_up() {
  (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null || return 1
  exec 3>&- 3<&-
}

bootstrap_path() {
  local extras=(
    "$HOME/.local/share/mise/shims"
    "$HOME/.mise/shims"
    "$HOME/.local/share/fnm/aliases/default/bin"
    "$HOME/.volta/bin"
    "$HOME/.asdf/shims"
  )
  local d
  for d in "${extras[@]}"; do
    if [[ -d "$d" ]]; then
      PATH="$d:$PATH"
    fi
  done
  export PATH
  if ! command -v npm >/dev/null 2>&1 && [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    # shellcheck disable=SC1091
    . "$HOME/.nvm/nvm.sh"
  fi
}

node_major() {
  node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0
}

stop_started() {
  if [[ "$started" == "1" && -x "$ROOT/ferma-portale.sh" ]]; then
    echo
    echo "Arresto dei servizi del Project Work..."
    "$ROOT/ferma-portale.sh" || true
  fi
}

on_interrupt() {
  stop_started
  exit 130
}

prepare_backend_files() {
  mkdir -p "$ROOT/backend/data" "$ROOT/backend/uploads"
  if [[ ! -f "$ROOT/backend/.env" && -f "$ROOT/backend/.env.example" ]]; then
    cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
    echo "Creato backend/.env da .env.example."
  fi
}

seed_if_needed() {
  if [[ -s "$DB_FILE" ]]; then
    echo "Database demo già presente: non rieseguo il seed."
    return 0
  fi
  echo "Database demo assente: eseguo il seed (una sola volta)..."
  (cd "$ROOT/backend" && npm run seed) || {
    echo "ERRORE: seed del backend fallito."
    exit 1
  }
}

install_dependencies() {
  bootstrap_path

  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo "ERRORE: Node.js/npm non sono disponibili nel PATH."
    echo "Apri una shell in cui 'node -v' funziona, oppure installa Node.js 20 o superiore."
    exit 1
  fi

  local major
  major="$(node_major)"
  if [[ "$major" -lt 20 ]]; then
    echo "ERRORE: serve Node.js 20 o superiore (trovato $(node -v))."
    exit 1
  fi

  echo "Installazione dipendenze backend..."
  (cd "$ROOT/backend" && npm install --no-audit --no-fund) || {
    echo "ERRORE: npm install del backend fallito."
    echo "Su Windows better-sqlite3 richiede i Build Tools per Visual Studio."
    exit 1
  }

  echo "Installazione dipendenze frontend..."
  (cd "$ROOT/frontend" && npm install --no-audit --no-fund) || {
    echo "ERRORE: npm install del frontend fallito."
    exit 1
  }
}

trap on_interrupt INT TERM

prepare_backend_files
install_dependencies
seed_if_needed

echo "============================================================"
echo "  Project Work - applicazione full-stack"
echo "  Backend : http://localhost:$BPORT   (Swagger: /api-docs)"
echo "  Frontend: http://localhost:$FPORT"
echo "============================================================"
echo

if port_up "$BPORT"; then
  echo "[Backend] gia attivo su $BPORT."
else
  echo "[Backend] avvio su $BPORT..."
  (cd "$ROOT/backend" && nohup npm run dev >"$ROOT/backend/dev.out" 2>&1 &)
fi

if port_up "$FPORT"; then
  echo "[Frontend] gia attivo su $FPORT."
else
  echo "[Frontend] avvio su $FPORT..."
  (cd "$ROOT/frontend" && nohup npm start -- --host 127.0.0.1 >"$ROOT/frontend/ng.out" 2>&1 &)
fi

started=1

echo
echo "Monitoraggio: attendo che entrambi i servizi rispondano (max ${WAIT_SECONDS}s)..."
deadline=$(( $(date +%s) + WAIT_SECONDS ))
until port_up "$BPORT" && port_up "$FPORT"; do
  if (( $(date +%s) >= deadline )); then
    echo
    echo "ERRORE: i servizi non sono entrambi disponibili entro ${WAIT_SECONDS}s."
    echo "--- ultime righe backend/dev.out ---"
    tail -20 "$ROOT/backend/dev.out" 2>/dev/null || true
    echo "--- ultime righe frontend/ng.out ---"
    tail -20 "$ROOT/frontend/ng.out" 2>/dev/null || true
    stop_started
    exit 1
  fi
  sleep 3
done

echo
echo "Entrambi i servizi sono ATTIVI."
if [[ "${OPEN_BROWSER:-1}" == "1" ]]; then
  echo "Apro il browser: prima il Frontend, poi il Backend (Swagger)..."
  xdg-open "http://localhost:$FPORT" >/dev/null 2>&1 &
  sleep 2
  xdg-open "http://localhost:$BPORT/api-docs" >/dev/null 2>&1 &
else
  echo "Apertura browser disabilitata (OPEN_BROWSER=0)."
fi

echo
echo "============================================================"
echo "  Monitoraggio continuo  (Ctrl+C ferma backend e frontend)"
echo "============================================================"
while true; do
  b=DOWN; f=DOWN
  port_up "$BPORT" && b=UP
  port_up "$FPORT" && f=UP
  printf '%s - Backend: %s | Frontend: %s\n' "$(date +%H:%M:%S)" "$b" "$f"
  sleep 5
done
