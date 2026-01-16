import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

const PLATFORM_COMMISSION_RATE = Number(process.env.PLATFORM_COMMISSION_RATE || 10) / 100;

export interface PayoutCalculation {
  grossAmount: number;
  platformFee: number;
  netAmount: number;
}

export interface VendorBalance {
  companyId: string;
  companyName: string;
  totalSales: number;
  totalCommission: number;
  pendingPayout: number;
  totalPaidOut: number;
}

export const payoutService = {
  calculatePayout(grossAmount: number, commissionRate?: number): PayoutCalculation {
    const rate = commissionRate ?? PLATFORM_COMMISSION_RATE;
    const platformFee = Number((grossAmount * rate).toFixed(2));
    const netAmount = Number((grossAmount - platformFee).toFixed(2));
    
    return {
      grossAmount: Number(grossAmount.toFixed(2)),
      platformFee,
      netAmount,
    };
  },

  async getVendorBalance(companyId: string): Promise<VendorBalance | null> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        products: {
          include: {
            orderItems: {
              include: {
                order: {
                  select: { status: true },
                },
              },
            },
          },
        },
        payouts: true,
      },
    });

    if (!company) return null;

    let totalSales = 0;
    company.products.forEach(product => {
      product.orderItems.forEach(item => {
        if (item.order.status === 'COMPLETED') {
          totalSales += Number(item.totalPrice);
        }
      });
    });

    const commissionRate = Number(company.commissionRate) / 100;
    const totalCommission = Number((totalSales * commissionRate).toFixed(2));
    
    const totalPaidOut = company.payouts
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.netAmount), 0);

    const pendingPayout = Number((totalSales - totalCommission - totalPaidOut).toFixed(2));

    return {
      companyId: company.id,
      companyName: company.name,
      totalSales: Number(totalSales.toFixed(2)),
      totalCommission,
      pendingPayout: Math.max(0, pendingPayout),
      totalPaidOut: Number(totalPaidOut.toFixed(2)),
    };
  },

  async getAllVendorBalances(): Promise<VendorBalance[]> {
    const companies = await prisma.company.findMany({
      include: {
        products: {
          include: {
            orderItems: {
              include: {
                order: {
                  select: { status: true },
                },
              },
            },
          },
        },
        payouts: true,
      },
    });

    return companies.map(company => {
      let totalSales = 0;
      company.products.forEach(product => {
        product.orderItems.forEach(item => {
          if (item.order.status === 'COMPLETED') {
            totalSales += Number(item.totalPrice);
          }
        });
      });

      const commissionRate = Number(company.commissionRate) / 100;
      const totalCommission = Number((totalSales * commissionRate).toFixed(2));
      
      const totalPaidOut = company.payouts
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + Number(p.netAmount), 0);

      const pendingPayout = Number((totalSales - totalCommission - totalPaidOut).toFixed(2));

      return {
        companyId: company.id,
        companyName: company.name,
        totalSales: Number(totalSales.toFixed(2)),
        totalCommission,
        pendingPayout: Math.max(0, pendingPayout),
        totalPaidOut: Number(totalPaidOut.toFixed(2)),
      };
    });
  },

  async createPayout(companyId: string, amount: number, notes?: string) {
    const balance = await this.getVendorBalance(companyId);
    if (!balance) {
      throw new Error('Company not found');
    }

    if (amount > balance.pendingPayout) {
      throw new Error(`Insufficient balance. Available: ${balance.pendingPayout}`);
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    const commissionRate = Number(company.commissionRate) / 100;
    const platformFee = Number((amount * commissionRate / (1 - commissionRate)).toFixed(2));

    const payout = await prisma.payout.create({
      data: {
        companyId,
        amount: new Decimal(amount + platformFee),
        platformFee: new Decimal(platformFee),
        netAmount: new Decimal(amount),
        status: 'PENDING',
        notes,
      },
      include: {
        company: true,
      },
    });

    return payout;
  },

  async processPayout(payoutId: string, bankReference?: string) {
    const payout = await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: 'PROCESSING',
      },
    });

    try {
      await prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: 'COMPLETED',
          bankReference,
          processedAt: new Date(),
        },
      });

      return { success: true, payout };
    } catch (error) {
      await prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: 'FAILED',
          notes: error instanceof Error ? error.message : 'Processing failed',
        },
      });

      throw error;
    }
  },

  async getPayoutHistory(companyId?: string) {
    const where = companyId ? { companyId } : {};
    
    return prisma.payout.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            gstin: true,
            bankAccountName: true,
            bankAccountNumber: true,
            bankIfscCode: true,
            bankName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
