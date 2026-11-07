# Separate studio and client entrances

- Owner sign-in: /studio/login. Private dashboard: /studio.
- Client sign-in and invitation activation: /portal/login. Client workspace: /portal.
- Existing passkeys and sessions remain valid on the same production domain. No account or passkey reset is performed.
- The server checks the current account before rendering each dashboard. A client visiting /studio returns to /portal; the owner visiting /portal returns to /studio. Anonymous visitors go to the matching login page.
- Each WebAuthn challenge includes a signed audience. Verification rejects a client credential in an owner challenge, or an owner credential in a client challenge, before a session can be issued. Registration invitations must match the intended audience. Owner access requires the existing designated owner email and role.
- Owner login filters to the owner passkey. Client login uses discoverable passkeys without publishing the client account/credential directory. Both require device user verification. Existing server API role checks remain in place.
- New client invitation URLs target /portal/login. Owner recovery invitations target /studio/login. Legacy client invitations at /portal retain their fragment through the browser redirect and activate on the client login page. Raw invitation fragments are removed from the address bar after capture.
- Stripe checkout return state is carried through client sign-in. New Google connection callbacks return to /studio; the existing token connection is preserved.
- Both route families have no-store, no-referrer, noindex and frame protection. Analytics is excluded on their pages.

The corrected logo uses one gold KJL monogram followed by Designs, with no repeated KJL wordmark. The header, footer and both login pages share the same image component.

Validation: 26 automated checks passed, including signed login-audience boundaries, invitation-role mismatch, challenge replay rejection and successful existing passkeys in each role. The HTTP integration suite verified anonymous/wrong-role redirects, private headers, client checkout return state and existing project/billing/notification isolation. Browser review covered both login designs at desktop and phone widths, and a legacy /portal invitation activating on the new client login with its fragment cleared.
