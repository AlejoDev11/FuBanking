#!/bin/sh
# Suite de regresion FuBanking.
# Uso:
#   sh scripts/regression.sh            # todo (con cobertura)
#   sh scripts/regression.sh backend    # solo backend
#   sh scripts/regression.sh frontend   # solo frontend
#   sh scripts/regression.sh loans      # solo modulo creditos (sin cobertura)
# Codigo de salida != 0 si algo falla (apto para CI y para demostrar
# el ciclo cambio -> rojo -> fix -> verde del entregable).
set -e
SCOPE="${1:-all}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

run_backend() {
  echo "=== REGRESION BACKEND ==="
  (cd "$ROOT/backend" && npm run test:coverage)
}

run_frontend() {
  echo "=== REGRESION FRONTEND ==="
  (cd "$ROOT/frontend" && npm run test:coverage)
}

run_loans() {
  echo "=== REGRESION MODULO CREDITOS ==="
  (cd "$ROOT/backend" && npm run test:loans)
  (cd "$ROOT/frontend" && npm run test:loans)
}

case "$SCOPE" in
  backend) run_backend ;;
  frontend) run_frontend ;;
  loans) run_loans ;;
  *) run_backend; run_frontend ;;
esac

echo "=== REGRESION OK ==="
