import Razorpay from 'razorpay';
import crypto from 'crypto';

interface CreateOrderInput {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
    transfers?: {
        account: string;
        amount: number;
        currency: string;
        notes?: Record<string, string>;
        linked_account_notes?: string[];
        on_hold?: boolean;
        on_hold_until?: number;
    }[];
}

interface VerifyPaymentInput {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export const razorpayService = {
    getClient() {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay keys not configured');
        }
        return new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    },

    async createOrder(input: CreateOrderInput) {
        const instance = this.getClient();

        const options = {
            amount: Math.round(input.amount * 100), // Razorpay expects amount in paise
            currency: input.currency || 'INR',
            receipt: input.receipt,
            notes: input.notes,
            transfers: input.transfers,
        };

        return instance.orders.create(options);
    },

    async fetchOrder(orderId: string) {
        const instance = this.getClient();
        return instance.orders.fetch(orderId);
    },

    async fetchPayment(paymentId: string) {
        const instance = this.getClient();
        return instance.payments.fetch(paymentId);
    },

    verifyPaymentSignature(input: VerifyPaymentInput): boolean {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;
        const secret = process.env.RAZORPAY_KEY_SECRET!;

        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        return generatedSignature === razorpaySignature;
    },

    validateWebhookSignature(body: string, signature: string): boolean {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET not set');

        return Razorpay.validateWebhookSignature(body, signature, secret);
    },

    async createTransfer(paymentId: string, transfers: any[]) {
        const instance = this.getClient();
        return instance.payments.transfer(paymentId, { transfers });
    },
};
