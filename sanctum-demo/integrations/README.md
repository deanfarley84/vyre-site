# The Sanctum Space | Private integrations (pre-production)

**Status: prepared specification + read-only Mindbody client scaffold; not connected to any live account.**

Live demo: https://adelante-sanctum-demo.onrender.com

## Integration architecture

Mindbody -> authorised server-side read-only importer -> encrypted Sanctum-only data -> Eudo/Sarah authenticated API -> Sanctum private portal.

Mindbody approved webhooks -> verified receiver -> idempotent queue -> refresh changed records -> nightly reconciliation.

Hostinger Reach -> consent-only contacts/segments -> approved campaigns -> tagged Mindbody booking links -> booking/revenue attribution and performance reports.

Public static demonstration must never show real names, phone numbers, email addresses, health notes, authentication details, or membership histories.

## Mindbody source fields

- Classes: schedules, reservations, class capacity, class visits, no-shows. Capacity fields must be checked against the actual approved v6 API response.
- Clients: stable client identifiers and optional staff-facing contact details, as permitted.
- Memberships: contracts, expiring passes, eligibility and renewal status.
- Visit history: first-time visits, repeat attendance, long gaps.
- Sales: purchases and transaction amounts for verified financial impact.
- Private sessions: approved appointments, with no health/treatment history.
- Consent: only recorded, verified, lawful marketing permission; never assumed from booking.

Official developer documentation: https://developers.mindbodyonline.com/ui/documentation/ui/PublicDocumentation/V6
Webhooks guide: https://developers.mindbodyonline.com/ui/documentation/webhooks-api

## Hostinger and Lovable integration

1. Confirm domain registrar and actual DNS authority for thesanctum.space (reported Hostinger). Preserve all existing website, MX and mailbox DNS records.
2. Verify current email provider, by MX and tenant administration, not by domain registrar alone.
3. Use Hostinger Reach for mass-marketing email. Connect verified domain or optional sending subdomain after reviewing SPF, DKIM and DMARC.
4. Use a separate reply-capable business mailbox for everyday inbound and outbound messages.
5. Hostinger Reach offers a public API for contact and segment upserts. Generate API token only in the owner's Hostinger console and store it in the backend secret manager.
6. With permission, use Mindbody read-only imports to build opt-in segments such as trial visitors not returned, members due to renew, and event subscribers. Apply unsubscribe and suppression across campaigns.
7. Website made with Lovable: use its authorised editor to add a newsletter consent form and a tracked Mindbody booking link. DNS edits are not needed just to add a form.
8. Only campaigns reviewed and activated by Sarah or Eudo are sent. Measure verified bookings, not only opens and clicks.

Reach API: https://www.hostinger.com/support/hostinger-reach-how-to-use-the-reach-public-api/
Domain setup: https://www.hostinger.com/support/11534612-hostinger-reach-connect-your-domain/

## Read-only Mindbody implementation scaffold

File: mindbody_client.py

Environment variable keys (never put actual values in GitHub, chat or browser):
SANCTUM_MINDBODY_SITE_ID
SANCTUM_MINDBODY_API_KEY
SANCTUM_MINDBODY_AUTHORIZATION (if required by the approved endpoint)

Requires: business authorisation, approved developer key and verified permission scopes. The adapter is read-only and allows only an explicit list of GET resources, with timeouts and response limits; it does not persist clients or build a live portal on its own.

## Remaining before production

- Confirm Mindbody developer approval and business activation, credentials and test permissions.
- Match API responses to exact Sanctum fields and provider quotas; test failure and retry behaviour.
- Add tenant-isolated authenticated backend and access-controlled data store.
- Define GDPR roles, data-processing terms, retention, consent and suppression.
- Implement nightly backfill/reconciliation and secured near-real-time event handling.
- Build an owner-only private front end using authenticated API endpoints, distinct from the public demo.
- Connect Hostinger Reach, verify DNS and sender domain and permissioned audience sync.
- Complete no-duplicates, unsubscribe, cancellation, deletion and revenue-attribution tests.
- Owner approval for campaign copy and automated sending policy.
