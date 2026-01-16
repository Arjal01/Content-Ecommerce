import { gstService } from './gst.service';

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  issuedAt: Date;
  buyer: {
    name: string;
    email: string;
    gstin?: string;
    address?: string;
    state?: string;
  };
  seller: {
    name: string;
    gstin: string;
    address: string;
  };
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  discount: number;
  totalAmount: number;
}

export const invoiceService = {
  generateInvoiceHTML(data: InvoiceData): string {
    const itemRows = data.items.map(item => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 12px;">${item.name}</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${gstService.formatAmount(item.unitPrice)}</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${gstService.formatAmount(item.totalPrice)}</td>
      </tr>
    `).join('');

    const taxRows = [];
    if (data.cgst > 0) {
      taxRows.push(`
        <tr>
          <td colspan="3" style="border: 1px solid #ddd; padding: 12px; text-align: right;">CGST (9%)</td>
          <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${gstService.formatAmount(data.cgst)}</td>
        </tr>
      `);
    }
    if (data.sgst > 0) {
      taxRows.push(`
        <tr>
          <td colspan="3" style="border: 1px solid #ddd; padding: 12px; text-align: right;">SGST (9%)</td>
          <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${gstService.formatAmount(data.sgst)}</td>
        </tr>
      `);
    }
    if (data.igst > 0) {
      taxRows.push(`
        <tr>
          <td colspan="3" style="border: 1px solid #ddd; padding: 12px; text-align: right;">IGST (18%)</td>
          <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${gstService.formatAmount(data.igst)}</td>
        </tr>
      `);
    }

    const discountRow = data.discount > 0 ? `
      <tr>
        <td colspan="3" style="border: 1px solid #ddd; padding: 12px; text-align: right; color: #16a34a;">Discount</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; color: #16a34a;">-${gstService.formatAmount(data.discount)}</td>
      </tr>
    ` : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tax Invoice - ${data.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #333; }
    .invoice-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; }
    .company-info h1 { margin: 0; color: #1a1a2e; font-size: 28px; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { margin: 0; color: #667eea; font-size: 24px; }
    .invoice-meta { margin-top: 10px; color: #666; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .party { flex: 1; }
    .party h3 { margin: 0 0 10px 0; color: #667eea; font-size: 14px; text-transform: uppercase; }
    .party p { margin: 5px 0; color: #555; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #667eea; color: white; padding: 12px; text-align: left; }
    th:last-child, th:nth-child(2), th:nth-child(3) { text-align: right; }
    .total-row { font-weight: bold; background: #f8f9fa; }
    .total-row td:last-child { font-size: 18px; color: #667eea; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; }
    .footer p { margin: 5px 0; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div class="company-info">
      <h1>${data.seller.name}</h1>
      <p style="margin: 5px 0; color: #666;">${data.seller.address}</p>
      <p style="margin: 5px 0; color: #666;"><strong>GSTIN:</strong> ${data.seller.gstin}</p>
    </div>
    <div class="invoice-title">
      <h2>TAX INVOICE</h2>
      <div class="invoice-meta">
        <p><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
        <p><strong>Order #:</strong> ${data.orderNumber}</p>
        <p><strong>Date:</strong> ${data.issuedAt.toLocaleDateString('en-IN')}</p>
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Bill To</h3>
      <p><strong>${data.buyer.name}</strong></p>
      <p>${data.buyer.email}</p>
      ${data.buyer.address ? `<p>${data.buyer.address}</p>` : ''}
      ${data.buyer.state ? `<p>State: ${data.buyer.state}</p>` : ''}
      ${data.buyer.gstin ? `<p><strong>GSTIN:</strong> ${data.buyer.gstin}</p>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: center;">Qty</th>
        <th>Unit Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      <tr>
        <td colspan="3" style="border: 1px solid #ddd; padding: 12px; text-align: right;">Subtotal</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${gstService.formatAmount(data.subtotal)}</td>
      </tr>
      ${discountRow}
      ${taxRows.join('')}
      <tr class="total-row">
        <td colspan="3" style="border: 1px solid #ddd; padding: 12px; text-align: right;">Total Amount</td>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${gstService.formatAmount(data.totalAmount)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p><strong>Terms & Conditions:</strong></p>
    <p>1. This is a computer-generated invoice and does not require a signature.</p>
    <p>2. Goods once sold will not be taken back or exchanged.</p>
    <p>3. All disputes are subject to jurisdiction of courts in Bengaluru, Karnataka.</p>
  </div>
</body>
</html>
    `;
  },

  async createInvoiceFromOrder(order: {
    id: string;
    orderNumber: string;
    user: { name?: string | null; email: string; gstin?: string | null; address?: string | null; state?: string | null };
    items: { product: { name: string }; quantity: number; unitPrice: number; totalPrice: number }[];
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    discountAmount: number;
  }): Promise<InvoiceData> {
    const invoiceNumber = gstService.generateInvoiceNumber();
    
    return {
      invoiceNumber,
      orderNumber: order.orderNumber,
      issuedAt: new Date(),
      buyer: {
        name: order.user.name || 'Customer',
        email: order.user.email,
        gstin: order.user.gstin || undefined,
        address: order.user.address || undefined,
        state: order.user.state || undefined,
      },
      seller: {
        name: process.env.SELLER_NAME || 'PromoHub India Pvt Ltd',
        gstin: process.env.SELLER_GSTIN || '29AABCT1332L1ZT',
        address: process.env.SELLER_ADDRESS || '123 Tech Park, Bengaluru, Karnataka - 560001',
      },
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      subtotal: Number(order.subtotal),
      cgst: Number(order.cgst),
      sgst: Number(order.sgst),
      igst: Number(order.igst),
      totalTax: Number(order.cgst) + Number(order.sgst) + Number(order.igst),
      discount: Number(order.discountAmount),
      totalAmount: Number(order.totalAmount),
    };
  },
};
