# Stripe gem purchases: complete setup

This game uses hosted Stripe Checkout and Firebase Functions in `us-central1`.
The browser requests a checkout URL; a signed Stripe webhook credits the wallet.
No Stripe publishable key or Stripe.js installation is needed for this flow.
These instructions configure the existing `starlight-fishing` Firebase project.
No deployment or live payment was performed while writing this guide.

## 1. Prepare Firebase and your tools

Use Node.js 22. From the repository root in PowerShell:

```powershell
npm ci
npm ci --prefix functions
npm install -g firebase-tools
firebase login
firebase use starlight-fishing
```

In the Firebase console, enable Firestore and Authentication's Email/Password
provider. Keep Anonymous enabled for guest play; guests cannot purchase gems.
Authorize your game's domain under Authentication > Settings > Authorized domains.
Functions deployment requires the Blaze billing plan. Configure a billing budget
and alerts appropriate to your project. See [Firebase deployment prerequisites](https://firebase.google.com/docs/functions/get-started).

If using another Firebase project, also update `.firebaserc` and the Firebase
client configuration in `src/systems/CloudAccounts.js`, `FleetFirebase.js`,
`LeaderboardFirebase.js`, and `GemWalletFirebase.js` wherever project-specific
values occur. Merely changing the CLI project does not switch the browser app.

## 2. Create the four Stripe products and prices

Start in a Stripe sandbox/test environment. Create four products with active,
**one-time, USD** prices. Copy the **Price IDs** (`price_...`), not Product IDs.
The backend checks these exact amounts:

| Package ID | Gems | Price | Environment variable |
| --- | ---: | ---: | --- |
| pocket | 10 | $1.99 | `STRIPE_PRICE_POCKET` |
| chest | 35 | $4.99 | `STRIPE_PRICE_CHEST` |
| vault | 100 | $9.99 | `STRIPE_PRICE_VAULT` |
| ocean | 225 | $19.99 | `STRIPE_PRICE_OCEAN` |

Do not configure recurring prices. This integration does not enable discounts,
shipping charges or automatic tax; fulfillment requires the configured total.
Changing amounts requires coordinated changes to `functions/checkout.js`,
`src/ui/GemShop.js`, the Stripe Prices and their tests.

Copy the configuration template **once** (do not overwrite an existing configuration):

```powershell
Copy-Item functions/.env.example functions/.env.starlight-fishing
```

Edit that file to contain your four Price IDs and:

```dotenv
APP_URL=https://starlight-fishing.web.app
STRIPE_PRICE_POCKET=price_YOUR_POCKET_PRICE
STRIPE_PRICE_CHEST=price_YOUR_CHEST_PRICE
STRIPE_PRICE_VAULT=price_YOUR_VAULT_PRICE
STRIPE_PRICE_OCEAN=price_YOUR_OCEAN_PRICE
```

For a custom domain, set `APP_URL` to its HTTPS origin. The backend returns users
to the origin's root path. The environment file is gitignored.

## 3. Register the webhook and store secrets

In Stripe Workbench > Webhooks, create an event destination for **your account**,
using snapshot events and this expected Firebase endpoint:

```text
https://us-central1-starlight-fishing.cloudfunctions.net/stripeWebhook
```

Subscribe to `checkout.session.completed` and
`checkout.session.async_payment_succeeded`. Copy this destination's signing secret
(`whsec_...`). The URL becomes available after deployment in step 4; compare it
with the deployed function's URL and update the destination if necessary.
See [Stripe webhook setup and signatures](https://docs.stripe.com/webhooks).

From the repository root, run the following commands and paste the values only
into their interactive secret prompts:

```powershell
firebase functions:secrets:set STRIPE_SECRET_KEY --project starlight-fishing
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET --project starlight-fishing
```

Use the same sandbox's `sk_test_...` API secret key and `whsec_...` signing secret.
Never put these in `src`, `VITE_*` variables, screenshots or commits. The signing
secret from `stripe listen` is different from a Dashboard destination's secret.
New secret versions require redeploying the functions that consume them.
See [Firebase secret configuration](https://firebase.google.com/docs/functions/config-env).

## 4. Validate and deploy

```powershell
npm test
npm test --prefix functions
npm run typecheck
npm run build
firebase deploy --only "functions,firestore:rules,firestore:indexes" --project starlight-fishing
firebase deploy --only hosting --project starlight-fishing
```

Deploying all functions also installs the premium purchases, aquarium and radio
services required by the current game. Confirm deployment success, then inspect
the webhook URL in the CLI output or Firebase console. Stripe must be able to POST
to it without Firebase login; the handler authenticates requests by Stripe signature.
Callable purchase functions separately require an authenticated player.

Test mode on this project still writes its actual Firestore wallets. Use a
dedicated test captain before launch. For isolated staging, use a separate Firebase
project and matching client configuration; do not mix test gem credits into real
customers' wallets. This guide uses hosted testing because the browser is not
currently wired to Firebase emulators.

## 5. Test the actual purchase flow

1. Open the deployed game and register/sign in as a captain, not a guest.
2. Open the Gem Store and buy the 10-gem bundle.
3. In test Checkout, use `4242 4242 4242 4242`, a future expiration date and any
   three-digit CVC. Use only test cards in the test environment.
   See [Stripe testing](https://docs.stripe.com/testing).
4. Confirm the return to your game and a 10-gem increase. In Firestore, inspect
   `players/{uid}.gems`, `gemCheckouts/{sessionId}` (`fulfilled: true`), and
   `stripeReceipts/{sessionId}`. The webhook, not the success URL, grants credit.
5. In Stripe's event destination, confirm a successful 2xx delivery. Resend the
   same completed event: the wallet must remain unchanged because the receipt
   prevents double credit. Test all four bundles.
6. Cancel a new checkout and confirm no credit. Sign in on a second device and
   confirm the purchased balance synchronizes. Verify a guest cannot buy.

A generic CLI-generated Checkout event lacks this game's private order and is
not an end-to-end purchase test. Start Checkout through the game's Gem Store.
Local automated tests cover signatures, mismatches and concurrent duplicate delivery;
they do not substitute for this hosted integration test.

## 6. Switch to live payments

Complete Stripe's account activation, business information and payout bank setup.
In live mode, recreate the four products/prices with the same amounts, create the
live event destination, and replace the environment file's Price IDs. Set
`STRIPE_SECRET_KEY` to the live `sk_live_...` key and `STRIPE_WEBHOOK_SECRET` to
the **live destination's** signing secret, using the commands above. Redeploy
functions so the updated prices and secrets take effect.

Check live configuration and webhook delivery before opening purchases to players.
Test cards do not work in live mode. Any live verification purchase is a real
charge; perform it deliberately from your own account and track its receipt.

## Operations and troubleshooting

| Symptom | Check |
| --- | --- |
| Sign-in required | The current Firebase identity must be non-anonymous and match the captain. |
| Checkout not configured | All four Price IDs and HTTPS `APP_URL` must be deployed. |
| Checkout unavailable | Inspect function logs; the API key and Price IDs must belong to the same Stripe environment, with active one-time USD prices matching the table. |
| Webhook returns 400 | Check the destination's signing secret and redeploy. The handler verifies the original raw body. |
| Webhook returns 500 | Inspect logs and the matching private order. Unknown/mismatched orders are rejected. Fix the cause and resend the event from Stripe. |
| Paid but HUD unchanged | Check successful webhook delivery, receipt, correct player UID, then the wallet listener and deployed Firestore rules. Refresh after fulfillment. Never manually replay credit by editing the URL. |
| Deploy fails | Check project permissions, Blaze billing, Node 22, enabled APIs and the CLI's specific error. |

```powershell
firebase functions:log --only createGemCheckoutSession,stripeWebhook --project starlight-fishing
```

Refunds and chargebacks do **not** automatically revoke gems in this implementation.
Before public launch, establish a support/reconciliation process for those cases
or add tested reversal handlers. Automatic tax is not implemented. Purchased credit
is server-controlled, while earned progression still includes client-reported state;
see [the database trust boundaries](DATABASE_SCHEMA.md). Retain receipts when
handling support issues so webhook retries remain idempotent.
