#!/bin/bash
# run_tests.sh — Executa les suites de tests
# Ús: ./run_tests.sh [1|2|3]
#   1 = només AI_test
#   2 = AI_test + ADV_test
#   3 = AI_test + ADV_test + DEVIL_test (default)
set -e
MODE=${1:-3}
DIR="$(cd "$(dirname "$0")" && pwd)"

if [ "$MODE" -ge 1 ] && [ "$MODE" -le 3 ]; then
    echo ""
    echo "========================================="
    echo "   AI TESTS — Endpoints bàsics i CRUD"
    echo "========================================="
    node "$DIR/AI_test.js"
fi

if [ "$MODE" -ge 2 ]; then
    echo ""
    echo "========================================="
    echo "   ADV TESTS — Constraints i workflow"
    echo "========================================="
    node "$DIR/AI_test_advanced.js"
fi

if [ "$MODE" -ge 3 ]; then
    echo ""
    echo "========================================="
    echo "   DEVIL TESTS — Adversarial / seguretat"
    echo "========================================="
    node "$DIR/DEVIL_tests.js"
fi

echo ""
echo "========================================="
echo "   TOTES LES SUITES COMPLETADES"
echo "========================================="
