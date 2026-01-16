import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invoiceService } from '@/services/invoice.service';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: { include: { product: true } },
          },
        },
        user: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.userId !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    if (format === 'html') {
      const invoiceData = {
        invoiceNumber: invoice.invoiceNumber,
        orderNumber: invoice.order.orderNumber,
        issuedAt: invoice.issuedAt,
        buyer: {
          name: invoice.buyerName || 'Customer',
          email: invoice.buyerEmail || invoice.user.email,
          gstin: invoice.buyerGstin || undefined,
          address: invoice.buyerAddress || undefined,
          state: invoice.buyerState || undefined,
        },
        seller: {
          name: invoice.sellerName,
          gstin: invoice.sellerGstin,
          address: invoice.sellerAddress,
        },
        items: invoice.order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: Number(item.discountPrice || item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
        subtotal: Number(invoice.subtotal),
        cgst: Number(invoice.cgst),
        sgst: Number(invoice.sgst),
        igst: Number(invoice.igst),
        totalTax: Number(invoice.totalTax),
        discount: Number(invoice.order.discountAmount),
        totalAmount: Number(invoice.totalAmount),
      };

      const html = invoiceService.generateInvoiceHTML(invoiceData);

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}
