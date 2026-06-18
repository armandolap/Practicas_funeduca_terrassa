# AI Test Report

**Date:** 2026-06-09T08:38:22.232Z

## Summary

- **Passed:** 73
- **Failed:** 3
- **Total:** 76

## Results

```
  ✓ GET /paisos → 200
  ✓ GET /paisos/1 → 200
  ✓ GET /paisos/999999 → 404
  ✓ GET /estFamilia → 200
  ✓ GET /estFamilia/1 → 200
  ✓ GET /estFamilia/999999 → 404
  ✓ GET /motiuBaixa → 200
  ✓ GET /motiuBaixa/10 → 200
  ✓ GET /motiuBaixa/999999 → 404
  ✓ GET /neses → 200
  ✓ GET /neses/1 → 200
  ✓ GET /neses/999999 → 404
  ✓ POST /neses → 201
  ✓ PUT /neses/5 → 200
  ✓ DELETE /neses/5 → 200
  ✓ GET /neses/5 (after delete) → 404
  ✓ GET /resulAcad → 200
  ✓ GET /resulAcad/3 → 200
  ✓ GET /resulAcad/999999 → 404
  ✓ GET /risc → 200
  ✓ GET /risc/4 → 200
  ✓ GET /risc/999999 → 404
  ✓ GET /rol → 200
  ✓ GET /rol/4 → 200
  ✓ GET /rol/999999 → 404
  ✓ GET /sebas → 200
  ✓ GET /sebas/11 → 200
  ✓ GET /sebas/999999 → 404
  ✓ GET /sitEco → 200
  ✓ GET /sitEco/4 → 200
  ✓ GET /sitEco/999999 → 404
  ✓ GET /tipusDom → 200
  ✓ GET /tipusDom/7 → 200
  ✓ GET /tipusDom/999999 → 404
  ✓ GET /curso → 200
  ✓ GET /curso/1 → 200
  ✓ GET /curso/999999 → 404
  ✓ POST /curso → 201
  ✓ PUT /curso/26 → 200
  ✓ DELETE /curso/26 → 200
  ✓ GET /curso/26 (after delete) → 404
  ✓ GET /projectes → 200
  ✓ GET /projectes/1 → 200
  ✓ GET /projectes/999999 → 404
  ✓ POST /projectes → 201
  ✗ PUT /projectes/2 → 404 — expected 200, got 404
  ✗ DELETE /projectes/2 → 404 — expected 200, got 404
  ✗ GET /projectes/2 (after delete) → 200 — expected 404, got 200
  ✓ GET /usuario → 200
  ✓ GET /usuario/1 → 200
  ✓ GET /usuario/999999 → 404
  ✓ POST /usuario → 201
  ✓ PUT /usuario/2 → 200
  ✓ DELETE /usuario/2 → 200
  ✓ GET /usuario/2 (after delete) → 404
  ✓ GET /domicili → 200
  ✓ GET /domicili/1 → 200
  ✓ GET /domicili/999999 → 404
  ✓ POST /domicili → 201
  ✓ PUT /domicili/2 → 200
  ✓ DELETE /domicili/2 → 200
  ✓ GET /domicili/2 (after delete) → 404
  ✓ GET /familia → 200
  ✓ GET /familia/1 → 200
  ✓ GET /familia/999999 → 404
  ✓ POST /familia → 201
  ✓ PUT /familia/2 → 200
  ✓ DELETE /familia/2 → 200
  ✓ GET /familia/2 (after delete) → 404
  ✓ GET /client → 200
  ✓ GET /client/1 → 200
  ✓ GET /client/999999 → 404
  ✓ POST /client → 201
  ✓ PUT /client/2 → 200
  ✓ DELETE /client/2 → 200
  ✓ GET /client/2 (after delete) → 404
```

❌ **3 test(s) failed**