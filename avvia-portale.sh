#!/usr/bin/env bash
# Avvio locale del Project Work (equivalente Linux di avvia-portale.bat)

BPORT=3000
FPORT=4200
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WAIT_SECONDS="${WAIT_SECONDS:-60}"

port_up() {
  (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null || return 1
  exec 3>&- 3<&-
}

install_dependencies() {
  if ! command -v npm >/dev/null 2>&1; then
    echo "ERRORE: npm non è disponibile nel PATH."
    exit 1
  fi

  echo "Installazione dipendenze backend..."
  (cd "$ROOT/backend" && npm install --no-audit --no-fund) || {
    echo "ERRORE: npm install del backend fallito."
    exit 1
  }

  echo "Installazione dipendenze frontend..."
  (cd "$ROOT/frontend" && npm install --no-audit --no-fund) || {
    echo "ERRORE: npm install del frontend fallito."
    exit 1
  }
}

install_dependencies

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

echo
echo "Monitoraggio: attendo che entrambi i servizi rispondano..."
deadline=$(( $(date +%s) + WAIT_SECONDS ))
until port_up "$BPORT" && port_up "$FPORT"; do
  if (( $(date +%s) >= deadline )); then
    echo
    echo "ERRORE: i servizi non sono entrambi disponibili entro ${WAIT_SECONDS}s."
    echo "--- ultime righe backend/dev.out ---"
    tail -20 "$ROOT/backend/dev.out" 2>/dev/null || true
    echo "--- ultime righe frontend/ng.out ---"
    tail -20 "$ROOT/frontend/ng.out" 2>/dev/null || true
    if [[ -x "$ROOT/ferma-portale.sh" ]]; then
      echo "Arresto dei processi avviati parzialmente..."
      "$ROOT/ferma-portale.sh"
    fi
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
echo "  Monitoraggio continuo  (premi Ctrl+C per fermare)"
echo "============================================================"
while true; do
  b=DOWN; f=DOWN
  port_up "$BPORT" && b=UP
  port_up "$FPORT" && f=UP
  printf '%s - Backend: %s | Frontend: %s\n' "$(date +%H:%M:%S)" "$b" "$f"
  sleep 5
done
