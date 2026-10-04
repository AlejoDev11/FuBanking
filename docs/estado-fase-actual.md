# Estado fase actual

> Temporal (bitácora, no convención). Fuente: `FUBANKING_HANDOFF.md` §§1,3,6,7,9,10.

## Dónde estábamos (handoff)

Rama `main`; frontend activo `frontend/` (ignorar `fronted/`); Fase 2 hecha (cuentas, transferencias, depósitos, retiros, historial base, toasts).

## Por requisito

| # | Requisito | Estado handoff |
|---|---|---|
| 1 | Usuarios | Hecho |
| 2 | Cuenta digital | Hecho |
| 3-5 | Transferencias, depósitos, retiros | Hecho base |
| 6 | Historial | Parcial (sin `resultingBalance`, sin filtros fecha/tipo/estado) |
| 7-15 | Tarjeta, notificaciones, pagos, solicitudes, bolsillos, crédito, préstamos, simulador | Backend listo, frontend pendiente/placeholder |
| 16 | 2FA | Hecho base |

**Nota:** el backend ya devuelve `resultingBalance` en `TransferHistoryItemDto` — no inventarlo en front, consumirlo del endpoint.

## Orden de ejecución sugerido

1. `/services` (pagos) 2. `/pockets` 3. `/loans` (simulador+solicitud) 4. `/cards` 5. `/requests` 6. `/notifications` (+badge) 7. `/history` (filtros + saldo resultante) 8. QA end-to-end (checklist §10 del handoff: registro→login→2FA→cuentas→operaciones→pagos→bolsillos→crédito→tarjetas→solicitudes→notificaciones; cero placeholders; feedback inline+toast).
