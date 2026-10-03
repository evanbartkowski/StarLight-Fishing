# Starlight backend

Node 22 Cloud Functions, using Firebase Admin and Stripe. Install and test from this directory:

```sh
npm ci
npm test
```

## Stripe configuration

Follow the [complete Stripe setup guide](../docs/STRIPE_SETUP.md) for all four
bundles, Firebase secrets, webhook registration, hosted testing and live rollout.
The backend accepts only the configured one-time USD prices: 10/$1.99,
35/$4.99, 100/$9.99 and 225/$19.99. Guests cannot purchase.

A signed webhook validates a private order and credits the wallet atomically.
Receipts prevent duplicate credit on retries. Success-page parameters never grant
Gems. Refund/chargeback gem reversals are not automated.

## Permanent radio cleanup

```sh
firebase deploy --only "functions:trimFleetRadio,functions:expireFleetRadio,firestore:rules" --project starlight-fishing
```

`trimFleetRadio` runs after each message is created and transactionally removes all but the newest 30. `expireFleetRadio` runs every minute and permanently removes messages at least 24 hours old, including during periods with no players online. Concurrent triggers serialize through Firestore transactions. Existing long histories are drained in batches. Client-side expiry is immediate when the game updates, but physical database cleanup follows the next successful asynchronous invocation. Monitor function errors; a client alone cannot guarantee permanent deletion.

## Reference documentation

- [Firebase callable functions](https://firebase.google.com/docs/functions/callable)
- [Firebase environment variables and secrets](https://firebase.google.com/docs/functions/config-env)
- [Stripe webhook signature verification](https://docs.stripe.com/webhooks/signature)
- [Firestore realtime listeners and metadata events](https://firebase.google.com/docs/firestore/query-data/listen)
# Economy additions (2026-10-03)

The fourth bundle requires `STRIPE_PRICE_OCEAN` (225 Gems, USD $19.99). Existing
Pocket/Chest/Vault prices must be USD $1.99/$4.99/$9.99 respectively; checkout now
rejects mismatched Stripe Prices. Deploy `buyPremium`, `aquariumAction`,
`serverClock`, and `announceCatch` along with the existing checkout and radio
functions. See [database rollout](../docs/DATABASE_SCHEMA.md) for document schemas,
save-version handling, transaction guarantees, and the client-reported gameplay
trust boundary. No production rollout is performed by the local test commands.
