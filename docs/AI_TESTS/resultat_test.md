# Resultat dels tests

**Data:** 2026-06-09T08:38:22.234Z

❌ **3 test(s) han fallat** (de 76 totals)

## Possibles problemes i solucions

### PUT /projectes/2 → 404

**Error:** expected 200, got 404

**Possible solució:** Comprova que l'endpoint existeix a server.js i que la ruta està ben definida.

### DELETE /projectes/2 → 404

**Error:** expected 200, got 404

**Possible solució:** Comprova que l'endpoint existeix a server.js i que la ruta està ben definida.

### GET /projectes/2 (after delete) → 200

**Error:** expected 404, got 200

**Possible solució:** Comprova que l'endpoint existeix a server.js i que la ruta està ben definida.

---
*Aquest fitxer es sobrescriu en cada execució dels tests.*