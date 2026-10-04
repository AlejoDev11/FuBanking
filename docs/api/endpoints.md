# Endpoints backend

Base `/api/v1`. La mayoría requiere `Authorization: Bearer <token>`.
Fuente original: `FUBANKING_HANDOFF.md` §5 (partido para versionar).

## Cuentas

```http
GET /accounts/me
GET /accounts/:id
POST /accounts
POST /accounts/:id/deposit
POST /accounts/:id/withdraw
GET /accounts/search?accountNumber=...
```

## Transferencias

```http
POST /transfers
GET /transfers/:id
GET /transfers/account/:accountId
GET /transfers/search/email?email=...
```

## Pagos de servicios

```http
POST /payments
GET /payments/me
```

```ts
{ accountId: string; serviceType: 'ENERGIA' | 'AGUA' | 'INTERNET' | 'CELULAR';
  providerReference: string; amount: number }
```

## Bolsillos

```http
POST /pockets
GET /pockets/account/:accountId
PATCH /pockets/:pocketId
POST /pockets/transfer
```

Crear: `{ accountId, name, amount }`. Actualizar: `{ name?, amount? }`.
Transferir: `{ fromPocketId, toPocketId, amount }`.

## Créditos / préstamos

```http
POST /loans/simulate
POST /loans
```

Simulación: `{ amount, installments, annualRate }`.
Solicitud: suma `monthlyIncome`, `documentVerified`, `ageVerified`, `incomeVerified`, `creditHistoryVerified` (booleans).

## Tarjetas virtuales

```http
POST /cards
GET /cards/me
PATCH /cards/:id/toggle-lock
```

Crear: `{ accountId }`. Respuesta pública: `cardHolderName, lastFour, expirationDate, cvvMasked, status`.

## Solicitar dinero

```http
POST /money-requests
GET /money-requests/me
PATCH /money-requests/:id/respond
```

Crear: `{ requestedUserEmail, amount, description? }`. Responder: `{ accept: boolean }`.

## Notificaciones

```http
GET /notifications/me
PATCH /notifications/:id/read
```
