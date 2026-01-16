import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { gstService, GSTBreakdown } from './gst.service';
import { razorpayService } from './RazorpayService';
import { invoiceService } from './invoice.service';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  userId: string;
  items: CartItem[];
  couponCode?: string;
  buyerState?: string;
  shippingAddress?: string;
  billingAddress?: string;
}

export interface OrderSummary {
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    discountPrice?: number;
    totalPrice: number;
    companyId: string;
    commissionRate: number;
  }[];
  subtotal: number;
  discount: number;
  gst: GSTBreakdown;
  couponDiscount: number;
  totalAmount: number;
}

export const orderService = {
  async calculateOrderSummary(input: CreateOrderInput): Promise<OrderSummary> {
    const products = await prisma.product.findMany({
      where: { id: { in: input.items.map(i => i.productId) }, isActive: true },
      include: { company: true },
    });

    if (products.length !== input.items.length) {
      throw new Error('Some products are not available');
    }

    const items = input.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      const unitPrice = Number(product.discountPrice || product.price);
      const totalPrice = unitPrice * item.quantity;

      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: Number(product.price),
        discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
        totalPrice,
        companyId: product.companyId,
        commissionRate: Number(product.company.commissionRate),
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    let discount = items.reduce((sum, item) => {
      if (item.discountPrice) {
        return sum + (item.unitPrice - item.discountPrice) * item.quantity;
      }
      return sum;
    }, 0);

    let couponDiscount = 0;
    if (input.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: input.couponCode },
      });

      if (coupon && coupon.isActive && (!coupon.expiryDate || coupon.expiryDate > new Date())) {
        if (!coupon.minOrderValue || subtotal >= Number(coupon.minOrderValue)) {
          if (coupon.discountType === 'PERCENTAGE') {
            couponDiscount = subtotal * (Number(coupon.discountValue) / 100);
            if (coupon.maxDiscount) {
              couponDiscount = Math.min(couponDiscount, Number(coupon.maxDiscount));
            }
          } else {
            couponDiscount = Number(coupon.discountValue);
          }
        }
      }
    }

    const taxableAmount = subtotal - couponDiscount;
    const gst = gstService.calculateGST({ subtotal: taxableAmount, buyerState: input.buyerState });

    return {
      items,
      subtotal,
      discount,
      gst,
      couponDiscount,
      totalAmount: gst.totalAmount,
    };
  },

  async createOrder(input: CreateOrderInput) {
    const summary = await this.calculateOrderSummary(input);

    let couponId: string | undefined;
    if (input.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: input.couponCode },
      });
      if (coupon) {
        couponId = coupon.id;
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        userId: input.userId,
        subtotal: new Decimal(summary.subtotal),
        taxAmount: new Decimal(summary.gst.totalTax),
        cgst: new Decimal(summary.gst.cgst),
        sgst: new Decimal(summary.gst.sgst),
        igst: new Decimal(summary.gst.igst),
        totalAmount: new Decimal(summary.totalAmount),
        discountAmount: new Decimal(summary.couponDiscount),
        buyerState: input.buyerState,
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress,
        couponId,
        status: 'PENDING',
        items: {
          create: summary.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice),
            discountPrice: item.discountPrice ? new Decimal(item.discountPrice) : null,
            totalPrice: new Decimal(item.totalPrice),
          })),
        },
      },
      include: {
        user: true,
        items: { include: { product: { include: { company: true } } } },
      },
    });

    return order;
  },

  async createRazorpayOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        payment: true,
        items: { include: { product: { include: { company: true } } } }
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.payment?.razorpayOrderId) {
      return {
        razorpayOrderId: order.payment.razorpayOrderId,
        amount: Number(order.totalAmount),
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID
      };
    }

    const companyTotals = new Map<string, { amount: number, accountId: string }>();

    for (const item of order.items) {
      const company = item.product.company;
      if (!company.razorpayAccountId) continue;

      const current = companyTotals.get(company.id) || { amount: 0, accountId: company.razorpayAccountId };
      const itemTotal = Number(item.totalPrice);
      const commission = itemTotal * (Number(company.commissionRate) / 100);
      const vendorShare = itemTotal - commission;

      current.amount += vendorShare;
      companyTotals.set(company.id, current);
    }

    const transfers = Array.from(companyTotals.values()).map(t => ({
      account: t.accountId,
      amount: Math.round(t.amount * 100),
      currency: 'INR',
      notes: {
        orderId: order.id,
        type: 'vendor_payout'
      },
      on_hold: false
    }));

    const razorpayOrder = await razorpayService.createOrder({
      amount: Number(order.totalAmount),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      transfers: transfers.length > 0 ? transfers : undefined,
    });

    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: order.totalAmount,
        status: 'PENDING',
      },
      update: {
        razorpayOrderId: razorpayOrder.id,
        status: 'PENDING',
      },
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: Number(order.totalAmount),
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID
    };
  },

  async handlePaymentSuccess(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
      include: {
        order: {
          include: {
            user: true,
            items: { include: { product: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const isValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCEEDED',
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'COMPLETED' },
    });

    const invoiceData = await invoiceService.createInvoiceFromOrder({
      id: payment.order.id,
      orderNumber: payment.order.orderNumber,
      user: payment.order.user,
      items: payment.order.items.map(item => ({
        product: { name: item.product.name },
        quantity: item.quantity,
        unitPrice: Number(item.discountPrice || item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      subtotal: Number(payment.order.subtotal),
      cgst: Number(payment.order.cgst),
      sgst: Number(payment.order.sgst),
      igst: Number(payment.order.igst),
      totalAmount: Number(payment.order.totalAmount),
      discountAmount: Number(payment.order.discountAmount),
    });

    await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceData.invoiceNumber,
        orderId: payment.orderId,
        userId: payment.order.userId,
        subtotal: payment.order.subtotal,
        cgst: payment.order.cgst,
        sgst: payment.order.sgst,
        igst: payment.order.igst,
        totalTax: new Decimal(Number(payment.order.cgst) + Number(payment.order.sgst) + Number(payment.order.igst)),
        totalAmount: payment.order.totalAmount,
        buyerName: payment.order.user.name,
        buyerEmail: payment.order.user.email,
        buyerGstin: payment.order.user.gstin,
        buyerAddress: payment.order.user.address,
        buyerState: payment.order.buyerState,
      },
    });

    return payment;
  },

  async handlePaymentFailed(razorpayOrderId: string, failureReason?: string) {
    await prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        status: 'FAILED',
        failureReason,
      },
    });
  },

  async getOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: { include: { product: true } },
        payment: true,
        invoice: true,
        refunds: true,
      },
    });
  },

  async getUserOrders(userId: string, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: { include: { product: true } },
          payment: true,
          invoice: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },
};
