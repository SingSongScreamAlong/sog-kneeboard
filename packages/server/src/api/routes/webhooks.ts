// =====================================================================
// Webhook Routes (Week 21)
// Handle Stripe webhooks securely.
// =====================================================================

import { Router } from 'express';
import express from 'express';
import { stripeService } from '../../services/stripe.service.js';
import { planTransitions } from '../../plans/plan-transitions.js';

const router = Router();

// =====================================================================
// Stripe Webhook Handler
// =====================================================================

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
        res.status(400).send('Missing signature');
        return;
    }

    let event;

    try {
        event = stripeService.constructWebhookEvent(req.body, sig as string);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const metadata = session.metadata;

                if (metadata && metadata.orgId && metadata.planId) {
                    console.log(`✅ Checkout completed for org ${metadata.orgId} -> ${metadata.planId}`);

                    // Apply plan change (force confirm)
                    // We use 'system' as userId for audit logs
                    await planTransitions.applyPlanChange(
                        metadata.orgId,
                        metadata.planId,
                        'system',
                        true // confirmed
                    );
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                // Metadata might not be on the subscription object directly depending on how it was created
                // We might need to look up the customer -> metadata -> orgId

                // For now, we only trust checkout session for initial setup/upgrade.
                // We'll trust this for cancellation/past_due.

                if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
                    // Metadata might not be on the subscription object directly depending on how it was created
                    // We might need to look up the customer -> metadata -> orgId
                    const customer = await stripeService.getCustomer(subscription.customer as string);
                    if (!customer || customer.deleted) break;
                    const orgId = customer.metadata?.orgId;

                    if (orgId) {
                        console.log(`⚠️ Subscription canceled/unpaid for org ${orgId}. Downgrading to Free.`);
                        await planTransitions.applyPlanChange(orgId, 'free', 'system', true);
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                const customer = await stripeService.getCustomer(subscription.customer as string);
                if (!customer || customer.deleted) break;
                const orgId = customer.metadata?.orgId;

                if (orgId) {
                    console.log(`❌ Subscription deleted for org ${orgId}. Downgrading to Free.`);
                    await planTransitions.applyPlanChange(orgId, 'free', 'system', true);
                }
                break;
            }
        }

        res.json({ received: true });
    } catch (err: any) {
        console.error(`Webhook processing error: ${err.message}`);
        res.status(500).send('Webhook processing error');
    }
});

export const webhookRouter = router;
