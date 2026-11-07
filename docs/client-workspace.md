# KJL Designs client workspace

The live workspace is at [kjl-designs.vercel.app/portal](https://kjl-designs.vercel.app/portal). Use the private owner invitation on your Mac to enroll your first passkey. Every invitation expires after seven days and can be used once.

1. Choose **Add a client**. Copy the invitation and send it directly to that client. The studio does not automatically email it.
2. Choose **Add a project** and enter its scope. **Post a project update** changes its phase, adds a note or HTTPS preview, and optionally requests client approval. Clients can approve, request changes, and write back on the timeline.
3. Under **Payments**, create a request for the agreed deposit or milestone balance. The amount is in USD. Once Stripe is connected the client can open hosted checkout, and a verified payment appears on the project.
4. If a client loses a passkey, use **Client access → Replace invitation** after confirming the client’s identity. This signs out their devices. An owner can recover using the operator script below.

## Connect Stripe

Complete activation for KJL Designs on [Stripe](https://dashboard.stripe.com/account/onboarding). Use the business website and accurate business, representative, and payout details. Stripe determines the remaining requirements for your account.

Run `node scripts/connect-stripe.mjs` in this Vercel-linked checkout, or open the Mac launcher supplied with the handoff. Enter the KJL Designs live API key in the hidden terminal prompt. The helper checks the account, shows the account identifier before connection, adds a webhook, saves both secrets as sensitive production variables, deploys the project, and verifies the webhook signature at the live endpoint. A restricted key needs permissions for account identification, Checkout Sessions, and webhook endpoints. See [Stripe API keys](https://docs.stripe.com/keys) and [webhook setup](https://docs.stripe.com/webhooks).

The estimator on the public pricing page is for planning. A client pays only an explicit request in their own project. Refunds and disputes are handled in Stripe Dashboard. The portal records the original successful payment.

## Operate and recover

The portal uses a dedicated private Vercel Blob store. Access is enforced by the server for each project, update, review and payment. Passkeys are tied to the exact configured origin. Owner and client sessions expire after seven days. Sessions and invitations are stored as hashes. Optimistic conditional writes prevent one editor from silently overwriting another's changes. The studio dashboard is designed for a small client roster.

Use the linked production Blob token through a protected environment file to run `node --env-file=/private/path/env scripts/portal-owner.mjs /private/path/setup.html`. The script refuses to replace an existing owner unless you explicitly add `--recover-owner`. Keep the resulting file private. If storage or authentication configuration is unavailable, access fails closed.

For local testing set a separate `PORTAL_NAMESPACE`, a localhost `PORTAL_ORIGIN`, and a fresh `PORTAL_SIGNING_KEY`. Use sandbox credentials and the signing secret from `stripe listen --forward-to localhost:3189/api/stripe/webhook`. Production and test records must use distinct namespaces or stores. To run the authorization, concurrency and payment regression tests against an isolated local workspace see [the test script](../tests/portal-integration.mjs).
