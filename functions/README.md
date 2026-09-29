# Starlight backend

Node 22 Cloud Functions, using Firebase Admin and Stripe. Install and test from this directory:

```sh
npm ci
npm test
```

## Stripe configuration

1. Create three **one-time Stripe Prices** for 10, 35, and 100 gems. Choose the actual prices in Stripe; use test-mode prices first.
2. Copy `.env.example` to `.env.starlight-fishing` and set the three `STRIPE_PRICE_*` IDs and your HTTPS `APP_URL`. Do not put secret keys in source code.
3. From the repository root, set production secrets through the CLI's hidden prompts:

```sh
firebase functions:secrets:set STRIPE_SECRET_KEY --project starlight-fishing
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET --project starlight-fishing
```

For local emulation use test values in `functions/.secret.local`. Production secret bindings expose these values through `process.env`. Environment files and secrets are gitignored; `.env.example` contains no credentials. Firebase Functions deployment requires a project with billing enabled; do not change billing plans implicitly.

4. Register a Stripe webhook endpoint at `https://us-central1-starlight-fishing.cloudfunctions.net/stripeWebhook` for `checkout.session.completed` (and optionally `checkout.session.async_payment_succeeded`). Set `STRIPE_WEBHOOK_SECRET` to that endpoint's signing secret. Test and live modes have separate prices, keys, and signing secrets.
5. Deploy from the root after configuring values:

```sh
firebase deploy --only "functions:createGemCheckoutSession,functions:stripeWebhook,firestore:rules" --project starlight-fishing
```

`createGemCheckoutSession` requires a non-anonymous Firebase identity. Pass `{packageId: 'pocket' | 'chest' | 'vault', userId: auth.currentUser.uid}`. The server checks that `userId` matches the authenticated caller, loads its own price and quantity, stores a private order, and returns `{url}`.

The webhook verifies the **raw request body** against the Stripe signature, requires a paid payment session, and validates its owner, package, amount and currency against the private order. One Firestore transaction increments `/players/{uid}.gems`, creates `/stripeReceipts/{sessionId}`, and marks the order fulfilled. Session receipts make retries idempotent. Unknown or mismatched orders receive an error and never grant gems. Return-page query parameters never grant credit.

The browser listens to its own player document and adds purchased gems to the HUD's gameplay-earned balance. Purchased gems are spent in a transaction; security rules permit only nonnegative balance decreases and deny client-created credit. Cosmetics are recorded in the wallet for cross-device ownership. Gameplay-earned gems and other game progression remain in the existing private captain save.

Use Stripe test mode to verify: signed-in checkout; successful payment; webhook replay; cancelled/unpaid checkout; another account attempting to buy for the first UID; realtime HUD update; and spending on two devices. Automated tests exercise signature tampering, owner checks, mismatched payments, atomic credit and concurrent duplicate delivery without charging a card.

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
