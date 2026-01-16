const GST_RATE = 0.18;
const CGST_RATE = 0.09;
const SGST_RATE = 0.09;
const IGST_RATE = 0.18;

const SELLER_STATE = process.env.SELLER_STATE || 'Karnataka';

export interface GSTBreakdown {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalAmount: number;
  isIntraState: boolean;
}

export interface TaxCalculationInput {
  subtotal: number;
  buyerState?: string;
  sellerState?: string;
}

export const gstService = {
  calculateGST(input: TaxCalculationInput): GSTBreakdown {
    const { subtotal, buyerState, sellerState = SELLER_STATE } = input;
    
    const isIntraState = !buyerState || buyerState.toLowerCase() === sellerState.toLowerCase();
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    if (isIntraState) {
      cgst = Number((subtotal * CGST_RATE).toFixed(2));
      sgst = Number((subtotal * SGST_RATE).toFixed(2));
    } else {
      igst = Number((subtotal * IGST_RATE).toFixed(2));
    }
    
    const totalTax = Number((cgst + sgst + igst).toFixed(2));
    const totalAmount = Number((subtotal + totalTax).toFixed(2));
    
    return {
      subtotal: Number(subtotal.toFixed(2)),
      cgst,
      sgst,
      igst,
      totalTax,
      totalAmount,
      isIntraState,
    };
  },

  getGSTRate(): number {
    return GST_RATE;
  },

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  },

  generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  },

  validateGSTIN(gstin: string): boolean {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  },

  getStateFromGSTIN(gstin: string): string | null {
    if (!this.validateGSTIN(gstin)) return null;
    
    const stateCodeMap: Record<string, string> = {
      '01': 'Jammu and Kashmir',
      '02': 'Himachal Pradesh',
      '03': 'Punjab',
      '04': 'Chandigarh',
      '05': 'Uttarakhand',
      '06': 'Haryana',
      '07': 'Delhi',
      '08': 'Rajasthan',
      '09': 'Uttar Pradesh',
      '10': 'Bihar',
      '11': 'Sikkim',
      '12': 'Arunachal Pradesh',
      '13': 'Nagaland',
      '14': 'Manipur',
      '15': 'Mizoram',
      '16': 'Tripura',
      '17': 'Meghalaya',
      '18': 'Assam',
      '19': 'West Bengal',
      '20': 'Jharkhand',
      '21': 'Odisha',
      '22': 'Chhattisgarh',
      '23': 'Madhya Pradesh',
      '24': 'Gujarat',
      '26': 'Dadra and Nagar Haveli and Daman and Diu',
      '27': 'Maharashtra',
      '29': 'Karnataka',
      '30': 'Goa',
      '31': 'Lakshadweep',
      '32': 'Kerala',
      '33': 'Tamil Nadu',
      '34': 'Puducherry',
      '35': 'Andaman and Nicobar Islands',
      '36': 'Telangana',
      '37': 'Andhra Pradesh',
      '38': 'Ladakh',
    };
    
    const stateCode = gstin.substring(0, 2);
    return stateCodeMap[stateCode] || null;
  },
};
