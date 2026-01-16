import { prisma } from '@/lib/prisma';

export interface CreateSubscriptionInput {
  userId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
}

export const subscriptionService = {
  async getPlans() {
    return prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: 'asc' },
    });
  },

  async getPlanById(planId: string) {
    return prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
  },

  async createSubscription(input: CreateSubscriptionInput) {
    // TODO: Implement Razorpay Subscriptions
    throw new Error('Subscriptions are currently disabled pending migration to Razorpay');
  },

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Stub: just update local status
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd,
        cancelledAt: cancelAtPeriodEnd ? null : new Date(),
        status: cancelAtPeriodEnd ? 'ACTIVE' : 'CANCELLED',
      },
      include: { plan: true },
    });

    return updatedSubscription;
  },

  async pauseSubscription(subscriptionId: string) {
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'PAUSED' },
      include: { plan: true },
    });
  },

  async resumeSubscription(subscriptionId: string) {
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'ACTIVE' },
      include: { plan: true },
    });
  },

  async handleSubscriptionUpdated(subscriptionId: string) {
    // Stub
  },

  async handleSubscriptionDeleted(subscriptionId: string) {
    // Stub
  },

  async getUserSubscriptions(userId: string) {
    return prisma.subscription.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getActiveSubscription(userId: string) {
    return prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'PAST_DUE'] },
      },
      include: { plan: true },
    });
  },

  async getAllSubscriptions(page = 1, pageSize = 10, status?: string) {
    const skip = (page - 1) * pageSize;
    const where = status ? { status: status as 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' } : {};

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          plan: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscription.count({ where }),
    ]);

    return {
      subscriptions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },
};
