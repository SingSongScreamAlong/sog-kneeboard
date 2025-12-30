# Stripe Integration Readiness

> **Status:** Prepared, NOT integrated  
> **Date:** 2025-12-30

---

## Overview

This document maps Ok, Box Box plans to Stripe concepts for future integration.

**NO STRIPE CODE IS IMPLEMENTED YET.**

---

## Plan → Stripe Product Mapping

| Plan ID | Stripe Product ID (placeholder) | Display Name |
|---------|--------------------------------|--------------|
| `free` | — | Free |
| `team` | `prod_team_xxx` | Team |
| `league` | `prod_league_xxx` | League |
| `broadcast` | `prod_broadcast_xxx` | Broadcast |
| `enterprise` | — (custom) | Enterprise |

---

## Price IDs (Placeholder)

| Plan | Monthly Price ID | Yearly Price ID |
|------|-----------------|-----------------|
| Team | `price_team_monthly_xxx` | `price_team_yearly_xxx` |
| League | `price_league_monthly_xxx` | `price_league_yearly_xxx` |
| Broadcast | `price_broadcast_monthly_xxx` | `price_broadcast_yearly_xxx` |

---

## Webhook Events to Handle

| Event | Ok, Box Box Action |
|-------|-------------------|
| `customer.subscription.created` | Create license, activate plan |
| `customer.subscription.updated` | Update plan, prorate |
| `customer.subscription.deleted` | Downgrade to free |
| `invoice.payment_succeeded` | Extend license |
| `invoice.payment_failed` | Grace period, then suspend |
| `checkout.session.completed` | Initial signup complete |

---

## Data Model Integration

### License Table Updates

```sql
ALTER TABLE licenses ADD COLUMN stripe_subscription_id VARCHAR(100);
ALTER TABLE licenses ADD COLUMN stripe_customer_id VARCHAR(100);
```

### Organization Table Updates

```sql
ALTER TABLE organizations ADD COLUMN stripe_customer_id VARCHAR(100);
```

---

## API Endpoints to Implement

| Endpoint | Purpose |
|----------|---------|
| `POST /api/billing/checkout` | Create Stripe Checkout session |
| `POST /api/billing/portal` | Create Stripe Customer Portal session |
| `POST /api/billing/webhook` | Handle Stripe webhooks |
| `GET /api/billing/invoices` | List invoices |
| `GET /api/billing/subscription` | Get current subscription |

---

## Customer Portal Features

- Update payment method
- View invoices
- Cancel subscription
- Change plan (upgrade/downgrade)

---

## Implementation Checklist

- [ ] Create Stripe products and prices in dashboard
- [ ] Store product/price IDs in environment
- [ ] Implement checkout endpoint
- [ ] Implement webhook handler
- [ ] Implement portal redirect
- [ ] Test subscription lifecycle
- [ ] Test proration
- [ ] Test cancellation
- [ ] Test payment failure

---

## Environment Variables (Future)

```bash
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_TEAM_MONTHLY=price_xxx
STRIPE_PRICE_TEAM_YEARLY=price_xxx
STRIPE_PRICE_LEAGUE_MONTHLY=price_xxx
STRIPE_PRICE_LEAGUE_YEARLY=price_xxx
STRIPE_PRICE_BROADCAST_MONTHLY=price_xxx
STRIPE_PRICE_BROADCAST_YEARLY=price_xxx
```

---

## Notes

- Enterprise is handled via sales (no self-serve)
- Free tier has no Stripe integration
- Trial periods handled by Stripe subscription trials
- Proration is automatic via Stripe
