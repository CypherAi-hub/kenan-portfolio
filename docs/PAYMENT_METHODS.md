# Cards, wallets and crypto readiness

The portal uses Stripe-hosted Checkout with dynamic payment methods. Session creation no longer imposes the old allowed_payment_method_types: [card] restriction. Stripe selects from the account’s enabled methods for the buyer’s device, country, invoice amount and currency. Invoices remain in USD, with the existing exact amount, client, project, bill, session and attempt validation.

Verified on the KJL Designs live account on November 7, 2026:

- Cards, Apple Pay and Cash App Pay were already enabled.
- Google Pay was enabled during this update.
- Other existing enabled methods include Link, Amazon Pay, Klarna and regional payment methods. Eligibility is decided by Stripe per checkout.
- Stablecoins and Crypto activation was requested and approved during this update. Stripe now shows Enabled. It can be offered dynamically to eligible customers. The account details show a USD 0.01–10,000 transaction range and USD presentment.

Live unpaid checkout verification confirmed the crypto redirect and wallet choices: Coinbase Wallet, Phantom, MetaMask, Crypto.com Pay and Trust. Direct-deposit token choices include USDC on Ethereum, Polygon, Solana, Base and Tempo; USDG on Solana; OUSD on Tempo, Base, Solana and Ethereum; and CASH on Solana. These are observed provider choices as of November 7, not hardcoded token/network support in the application.

Crypto.com Pay is offered in this account’s crypto checkout. Its current provider documentation lists BTC as a supported payment currency. This is a provider-mediated Bitcoin payment route; no BTC transaction was performed in QA. Native SOL was not confirmed; Solana-network stablecoin payments were confirmed. No merchant wallet address, seed phrase or custodial account was created.

The temporary live verification link was for an unpaid USD 1 item, with no real payment submitted. It is deactivated and its verification product archived after review.

Old open sessions with an explicit card-only filter are expired and replaced with a new idempotent invoice attempt. If a customer completes payment during that refresh, the server reconciles the payment instead of creating another checkout.

Completed but unpaid sessions remain open invoices marked processing. They are never credited as paid until a verified success notification arrives. An async failure clears processing and allows one new attempt; duplicate/stale failure messages cannot repeatedly advance or reset the invoice. Paid requests do not regress. The live webhook destination remains the same, now subscribed to:

- checkout.session.completed
- checkout.session.async_payment_succeeded
- checkout.session.async_payment_failed

The public pricing FAQ and client Payments tab describe eligible cards, wallets and crypto without promising that every method or token appears for every buyer. The assistant receives processing/failure state to avoid asking for another payment while confirmation is pending, plus a dated guide to the enabled methods and verified crypto routes.

Validation includes 32 automated tests; a real Stripe sandbox checkout created through the portal API with card, Link, Cash App Pay, Amazon Pay and Klarna eligible; signed endpoint tests for pending/failure/success, mismatched amounts, signature rejection, cross-client isolation and webhook replay. Sandbox Checkout UI is inspected separately from live method enablement. No real payment is collected during QA.

References:

- https://docs.stripe.com/payments/payment-methods/dynamic-payment-methods
- https://docs.stripe.com/apple-pay?platform=web
- https://docs.stripe.com/payments/accept-stablecoin-payments?payment-ui=checkout
- https://support.stripe.com/user/topics/stablecoin-and-crypto-payments?locale=en-GB

- https://help.crypto.com/en/articles/6075352-what-are-the-supported-payment-currencies
