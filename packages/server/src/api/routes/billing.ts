// =====================================================================
// Billing Routes (Week 21)
// Checkout sessions and billing portal management.
// =====================================================================

import { Router } from 'express';
import { z } from 'zod';
import { restGuards } from '../../auth/rest-guards.js';
import { stripeService } from '../../services/stripe.service.js';
import { getConfig } from '../../config/env.js';
import { pool } from '../../db/pool.js';
import { getPlan } from '../../plans/plan-definitions.js';

const router = Router();

// =====================================================================
// Create Checkout Session (Subscribe/Upgrade)
// =====================================================================

const CheckoutSchema = z.object({
    planId: z.enum(['team', 'league', 'broadcast']),
    interval: z.enum(['monthly', 'annual']),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
});

router.post('/checkout', restGuards.requireAuth(), restGuards.requireRole('admin'), async (req, res, next) => {
    try {
        const { planId, interval, successUrl, cancelUrl } = CheckoutSchema.parse(req.body);
        const config = getConfig();
        const claims = req.claims!;

        // 1. Get plan details
        const plan = getPlan(planId);
        if (!plan) {
            res.status(400).json({ error: 'Invalid plan' });
            return;
        }

        // 2. Determine Stripe Price ID
        let priceId = '';
        if (planId === 'team') {
            priceId = interval === 'monthly' ? config.STRIPE_PRICE_TEAM_MONTHLY : config.STRIPE_PRICE_TEAM_ANNUAL;
        } else if (planId === 'league') {
            priceId = interval === 'monthly' ? config.STRIPE_PRICE_LEAGUE_MONTHLY : config.STRIPE_PRICE_LEAGUE_ANNUAL;
        } else if (planId === 'broadcast') {
            priceId = interval === 'monthly' ? config.STRIPE_PRICE_BROADCAST_MONTHLY : config.STRIPE_PRICE_BROADCAST_ANNUAL;
        }

        if (priceId === 'price_placeholder') {
            res.status(503).json({ error: 'Billing configuration missing' });
            return;
        }

        // 3. Get User Email from DB
        const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [claims.userId]);
        const email = userResult.rows[0]?.email || `billing-${claims.orgId}@example.com`;

        // 4. Get or Create Stripe Customer
        // Check if org already has a customer ID in DB (not currently stored, we store plan_id)
        // We really should store stripe_customer_id in `organizations` or `licenses` table.
        // For now, we search Stripe by metadata each time (a bit slow but robust).

        // Let's assume user.email is the billing email for now.
        // Ideally we should have a billing_email on the org.
        const customerId = await stripeService.getOrCreateCustomer(
            claims.orgId,
            email,
            claims.orgId // Org ID as Name is not great, but sufficient for alpha
        );

        // 5. Create Session
        const sessionUrl = await stripeService.createCheckoutSession({
            customerId,
            priceId,
            successUrl,
            cancelUrl,
            orgId: claims.orgId,
            planId,
        });

        res.json({ url: sessionUrl });

    } catch (err) {
        next(err);
    }
});

// =====================================================================
// Create Billing Portal Session (Manage)
// =====================================================================

const PortalSchema = z.object({
    returnUrl: z.string().url(),
});

router.post('/portal', restGuards.requireAuth(), restGuards.requireRole('admin'), async (req, res, next) => {
    try {
        const { returnUrl } = PortalSchema.parse(req.body);
        const claims = req.claims!;

        // 1. Get User Email from DB
        const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [claims.userId]);
        const email = userResult.rows[0]?.email || `billing-${claims.orgId}@example.com`;

        // 2. Find customer ID
        const customerId = await stripeService.getOrCreateCustomer(
            claims.orgId,
            email,
            claims.orgId
        );

        // 3. Create session
        const sessionUrl = await stripeService.createBillingPortalSession(customerId, returnUrl);

        res.json({ url: sessionUrl });

    } catch (err) {
        next(err);
    }
});

export const billingRouter = router;
