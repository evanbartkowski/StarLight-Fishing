# Firestore schema and rollout

No SQL database is used. Schemas below describe existing documents and additive
collections. Never copy Stripe secret keys into the frontend or Firestore.

| Path | Fields / ownership |
| --- | --- |
| `players/{uid}` | `gems: nonnegative integer` is the server wallet (purchased Gems and received tips); `cosmetics: string[]`; `updatedAt: Timestamp`. Existing constrained cosmetic debit rules retained. Stripe and tip credits use Admin SDK only. |
| `captainSaves/{uid}` | `snapshot: JSON string`, `revision: positive integer`, `updatedAt: Timestamp`. Premium purchases and tips update both snapshot and revision atomically. Client accepts both to avoid a stale subsequent cloud write. |
| snapshot `gems` | Earned Gems, separate from the wallet. Defaults to zero. Existing offline client trust model retained. |
| snapshot `cratePityCount` | Persistent **pity_counter**; integer 0–9, default zero. Reset on Epic/God; after nine other results, next result is guaranteed Epic/God. |
| snapshot `inventory[]` | **crates_inventory** is the subset with `isCrate === true && !unboxed`. Fields: `instanceId`, `id`, `crateRank` (1–5), `category: 'crate'`, `rarity`, `value`, `unboxed`. No second mutable copy of the vault is introduced. |
| snapshot fish inventory | Adds `weightClass`, `mutation`, `isBoss`; existing size, weight, scale, shiny/crown and speciesId retained. |
| snapshot premium metadata | `unlockedSoundtracks: string[]`, `boatSkins: string[]`, `boatSkin: string`; legacy upgrades/ownership remain intact. |
| `daily_tips/{visitorUid}_{utcDay}` | `uid`, `day = floor(serverMilliseconds/86400000)`, `count: 1..3`, `requests: string[]`, `updatedAt`. One transaction checks this document, spends a coin in visitor save and credits one host wallet Gem. Three tips total across all hosts. Self-tips rejected. |
| `aquariums/{uid}` | `username`, `theme`, `items[]` (display metadata only), `updatedAt`. Published by authenticated callable from private save; visitors use callable. No private snapshot or balances returned. |
| `aquariumTipReceipts/{visitorUid}_{requestId}` | Server-only durable tipping receipt with `uid`, `host`, `day`, `createdAt`. Prevents duplicate coin debits and Gem credits even when a retry crosses midnight UTC. Retain these receipts. |
| `premiumReceipts/{uid}_{requestId}` | `uid`, `kind`, `cost`, `earnedSpent`, `paidSpent`, `createdAt`. Created in same transaction as debit and delivery. Durable idempotency marker. |
| `gemCheckouts/{stripeSessionId}` | `uid`, `packageId`, `gems`, `amountTotal`, `currency`, `priceId`, `fulfilled`, `createdAt`. Private immutable order intent apart from fulfillment flag. |
| `stripeReceipts/{stripeSessionId}` | `uid`, `gems`, `eventId`, `creditedAt`. Transaction log and idempotency key for completed Checkout. |
| `catchAnnouncements/{uid}_{instanceId}` | `createdAt`; persistent retry-deduplication marker. |
| `fleetMessages/{id}` | Existing message fields; server may create `kind: 'event'`. Client create rule continues to permit only `kind: 'player'`. |

LocalStorage also stores `_pending_purchase` per account during uncertain network
responses. Retrying resolves the previous request before allowing another debit.

## Migration behavior

1. Back up production saves using your established Firestore export process before
   rollout. This pass has not run a production export or migration.
2. The save loader defaults missing fields and clamps existing pity counters to
   0–9. Existing crate metadata recovery remains active. Existing inventory IDs,
   owned items, realms, coins and wallet balances are preserved.
3. New collections are created lazily by Admin transactions. There is no backfill
   of paid Gems, no re-awarding old achievements, and no destructive document rewrite.
4. Deploy the updated rules and functions together. Admin-only collections are
   explicitly denied to client reads/writes; sanitized callables serve public data.
5. Configure four one-time USD Stripe Prices for 199, 499, 999 and 1999 cents. Set
   `STRIPE_PRICE_POCKET`, `STRIPE_PRICE_CHEST`, `STRIPE_PRICE_VAULT`,
   `STRIPE_PRICE_OCEAN`, and `APP_URL`; bind `STRIPE_SECRET_KEY` and
   `STRIPE_WEBHOOK_SECRET` through Secret Manager as described in functions/README.
6. Deploy `createGemCheckoutSession`, `stripeWebhook`, `buyPremium`,
   `aquariumAction`, `serverClock`, `announceCatch`, and existing radio-retention
   functions. Register Stripe Checkout completion events and verify test-mode
   fulfillment/retries before live enablement.

Webhook fulfillment validates the paid session against the private order and
credits the wallet, creates its receipt and fulfills the order in one Firestore
transaction. An exception commits none of those writes; a 500 response allows
Stripe retry. Failure before payment never grants Gems. Chargeback/refund policy
is separate from failure rollback and is not automated here.

See [Stripe fulfillment guidance](https://docs.stripe.com/payments/checkout/fulfill-orders)
and [signature verification](https://docs.stripe.com/webhooks/signature).
