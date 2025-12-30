import Stripe from 'stripe';
import { getConfig } from '../config/env.js';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
    if (!_stripe) {
        const config = getConfig();
        _stripe = new Stripe(config.STRIPE_SECRET_KEY, {
            apiVersion: '2025-12-15.clover', // Update to match latest or available
            typescript: true,
            appInfo: {
                name: 'Ok, Box Box',
                version: config.BUILD_VERSION,
            },
        });
    }
    return _stripe;
}

// =====================================================================
// Customer Management
// =====================================================================

export async function getOrCreateCustomer(
    orgId: string,
    email: string,
    name: string
): Promise<string> {
    const stripe = getStripe();

    // Search for existing customer by metadata
    const search = await stripe.customers.search({
        query: `metadata['orgId']:'${orgId}'`,
        limit: 1,
    });

    if (search.data.length > 0) {
        return search.data[0].id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
            orgId,
        },
    });

    return customer.id;
}

// =====================================================================
// Checkout Session (Upgrade/Subscribe)
// =====================================================================

export interface CheckoutSessionParams {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    orgId: string; // For metadata
    planId: string; // For metadata
}

export async function createCheckoutSession(params: CheckoutSessionParams): Promise<string> {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
        customer: params.customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: params.priceId,
                quantity: 1,
            },
        ],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        subscription_data: {
            metadata: {
                orgId: params.orgId,
                planId: params.planId,
            },
        },
        metadata: {
            orgId: params.orgId,
            planId: params.planId,
            action: 'subscribe',
        },
        allow_promotion_codes: true,
    });

    if (!session.url) {
        throw new Error('Failed to create checkout session URL');
    }

    return session.url;
}

// =====================================================================
// Billing Portal (Manage Subscription)
// =====================================================================

export async function createBillingPortalSession(
    customerId: string,
    returnUrl: string
): Promise<string> {
    const stripe = getStripe();

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });

    return session.url;
}

// =====================================================================
// Webhooks
// =====================================================================

export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string
): Stripe.Event {
    const stripe = getStripe();
    const config = getConfig();

    try {
        return stripe.webhooks.constructEvent(
            payload,
            signature,
            config.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        throw new Error(`Webhook Error: ${err.message}`);
    }
}

// =====================================================================
// Usage / Metadata
// =====================================================================

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = getStripe();
    return stripe.subscriptions.retrieve(subscriptionId);
}

export async function getCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    const stripe = getStripe();
    return stripe.customers.retrieve(customerId);
}

export const stripeService = {
    getOrCreateCustomer,
    createCheckoutSession,
    createBillingPortalSession,
    constructWebhookEvent,
    getSubscription,
    getCustomer,
};
