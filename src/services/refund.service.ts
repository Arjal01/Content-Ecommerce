import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

const REFUND_ELIGIBILITY_DAYS = 7;

export interface RefundRequest {
  orderId: string;
  amount?: number;
  reason?: string;
}

export const refundService = {
  async checkRefundEligibility(orderId: string): Promise<{ eligible: boolean; reason?: string; maxAmount?: number }> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        refunds: true,
      },
    });

    if (!order) {
      return { eligible: false, reason: 'Order not found' };
    }

    if (order.status !== 'COMPLETED') {
      return { eligible: false, reason: 'Only completed orders can be refunded' };
    }

    if (!order.payment || order.payment.status !== 'SUCCEEDED') {
      return { eligible: false, reason: 'No successful payment found for this order' };
    }

    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceOrder > REFUND_ELIGIBILITY_DAYS) {
      return { eligible: false, reason: `Refund period of ${REFUND_ELIGIBILITY_DAYS} days has expired` };
    }

    const totalRefunded = order.refunds
      .filter(r => r.status === 'SUCCEEDED')
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const maxAmount = Number(order.totalAmount) - totalRefunded;

    if (maxAmount <= 0) {
      return { eligible: false, reason: 'Order has already been fully refunded' };
    }

    return { eligible: true, maxAmount };
  },

  async initiateRefund(request: RefundRequest) {
    // TODO: Implement Razorpay Refunds
    const eligibility = await this.checkRefundEligibility(request.orderId);

    if (!eligibility.eligible) {
      throw new Error(eligibility.reason);
    }

    const amount = request.amount ?? eligibility.maxAmount!;

    if (amount > eligibility.maxAmount!) {
      throw new Error(`Refund amount exceeds maximum refundable amount of ${eligibility.maxAmount}`);
    }

    // Just Create Database Refund for now
    const refund = await prisma.refund.create({
      data: {
        orderId: request.orderId,
        amount: new Decimal(amount),
        reason: request.reason,
        status: 'PENDING',
      },
    });

    // Auto-mark as processing? Or Manual?
    // Let's leave as PENDING since no real refund hapened
    return { refund, message: "Refund recorded but not processed (Razorpay migration pending)" };
  },

  async handleRefundSuccess(refundId: string) {
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: { order: { include: { payment: true, refunds: true } } },
    });

    if (!refund) {
      throw new Error('Refund not found');
    }

    await prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: 'SUCCEEDED',
        processedAt: new Date(),
      },
    });

    const totalRefunded = refund.order.refunds
      .filter(r => r.status === 'SUCCEEDED' || r.id === refund.id)
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const isFullyRefunded = totalRefunded >= Number(refund.order.totalAmount);

    if (isFullyRefunded) {
      await prisma.order.update({
        where: { id: refund.orderId },
        data: { status: 'REFUNDED' },
      });

      await prisma.payment.update({
        where: { id: refund.order.payment!.id },
        data: { status: 'REFUNDED' },
      });
    } else {
      await prisma.payment.update({
        where: { id: refund.order.payment!.id },
        data: { status: 'PARTIALLY_REFUNDED' },
      });
    }

    return refund;
  },

  async handleRefundFailed(refundId: string, failureReason?: string) {
    await prisma.refund.update({
      where: { id: refundId },
      data: {
        status: 'FAILED',
        reason: failureReason || 'Refund failed',
      },
    });
  },

  async getRefundsByOrder(orderId: string) {
    return prisma.refund.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getAllRefunds(page = 1, pageSize = 10, status?: string) {
    const skip = (page - 1) * pageSize;
    const where = status ? { status: status as 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' } : {};

    const [refunds, total] = await Promise.all([
      prisma.refund.findMany({
        where,
        include: {
          order: {
            include: {
              user: { select: { id: true, email: true, name: true } },
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.refund.count({ where }),
    ]);

    return {
      refunds,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },
};
