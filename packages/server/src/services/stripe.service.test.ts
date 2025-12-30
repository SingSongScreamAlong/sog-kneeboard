
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { stripeService } from './stripe.service.js';

// Mock Config
jest.mock('../config/env.js', () => ({
    getConfig: () => ({
        STRIPE_SECRET_KEY: 'sk_test_mock',
        STRIPE_PUBLISHABLE_KEY: 'pk_test_mock',
        STRIPE_WEBHOOK_SECRET: 'whsec_mock',
        STRIPE_PRICE_TEAM_MONTHLY: 'price_team_mo',
    }),
}));

// Mock Stripe
const mockStripeInstance = {
    customers: {
        search: jest.fn(),
        create: jest.fn(),
        retrieve: jest.fn(),
    },
    checkout: {
        sessions: {
            create: jest.fn(),
        },
    },
    billingPortal: {
        sessions: {
            create: jest.fn(),
        },
    },
    webhooks: {
        constructEvent: jest.fn(),
    },
};

jest.mock('stripe', () => {
    return jest.fn(() => mockStripeInstance);
});

describe('StripeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getOrCreateCustomer', () => {
        it('should return existing customer if found', async () => {
            (mockStripeInstance.customers.search as jest.Mock).mockResolvedValue({
                data: [{ id: 'cus_existing', metadata: { orgId: 'org_1' } }]
            });

            const result = await stripeService.getOrCreateCustomer('org_1', 'test@example.com', 'Test Org');

            expect(result).toBe('cus_existing');
            expect(mockStripeInstance.customers.search).toHaveBeenCalledWith({
                query: "metadata['orgId']:'org_1'",
                limit: 1,
            });
            expect(mockStripeInstance.customers.create).not.toHaveBeenCalled();
        });

        it('should create new customer if not found', async () => {
            (mockStripeInstance.customers.search as jest.Mock).mockResolvedValue({ data: [] });
            (mockStripeInstance.customers.create as jest.Mock).mockResolvedValue({ id: 'cus_new' });

            const result = await stripeService.getOrCreateCustomer('org_1', 'new@example.com', 'New Org');

            expect(result).toBe('cus_new');
            expect(mockStripeInstance.customers.create).toHaveBeenCalledWith({
                email: 'new@example.com',
                name: 'New Org',
                metadata: { orgId: 'org_1' },
            });
        });
    });

    describe('createCheckoutSession', () => {
        it('should create session and return url', async () => {
            (mockStripeInstance.checkout.sessions.create as jest.Mock).mockResolvedValue({
                url: 'https://checkout.stripe.com/test-session'
            });

            const url = await stripeService.createCheckoutSession({
                customerId: 'cus_123',
                priceId: 'price_team_mo',
                successUrl: 'http://success',
                cancelUrl: 'http://cancel',
                orgId: 'org_1',
                planId: 'team',
            });

            expect(url).toBe('https://checkout.stripe.com/test-session');
            expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
                customer: 'cus_123',
                line_items: [{ price: 'price_team_mo', quantity: 1 }],
                mode: 'subscription',
                success_url: 'http://success',
                cancel_url: 'http://cancel',
                metadata: { orgId: 'org_1', planId: 'team' },
            }));
        });
    });

    describe('constructWebhookEvent', () => {
        it('should verify signature', () => {
            const payload = Buffer.from('{}');
            const sig = 'signature';
            (mockStripeInstance.webhooks.constructEvent as jest.Mock).mockReturnValue({ type: 'test' });

            const event = stripeService.constructWebhookEvent(payload, sig);

            expect(event).toEqual({ type: 'test' });
            expect(mockStripeInstance.webhooks.constructEvent).toHaveBeenCalledWith(payload, sig, 'whsec_mock');
        });
    });
});
