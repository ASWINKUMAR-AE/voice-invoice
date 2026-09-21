import { Invoice, InvoiceItem } from '../types';

export class InvoiceGenerator {
  static generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-4);
    return `INV-${year}${month}${day}-${time}`;
  }

  static calculateGST(amount: number, gstRate: number): { cgst: number; sgst: number; igst: number } {
    const gstAmount = (amount * gstRate) / 100;
    // For simplicity, we'll use CGST + SGST for intra-state transactions
    return {
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      igst: 0
    };
  }

  static calculateInvoiceTotal(items: InvoiceItem[]): {
    subtotal: number;
    totalGST: number;
    grandTotal: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const totalGST = items.reduce((sum, item) => {
      const gst = this.calculateGST(item.amount, item.gstRate);
      return sum + gst.cgst + gst.sgst + gst.igst;
    }, 0);
    
    return {
      subtotal,
      totalGST,
      grandTotal: subtotal + totalGST
    };
  }

  static parseVoiceToInvoice(transcription: string): Partial<Invoice> {
    console.log('Parsing transcription:', transcription);
    
    // Enhanced parsing logic with better pattern matching
    const text = transcription.toLowerCase();
    
    const invoice: Partial<Invoice> = {
      invoiceNumber: this.generateInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
      items: [],
      customer: {
        name: '',
        address: '',
        gstin: '',
        phone: '',
        email: ''
      }
    };

    // Extract customer name with multiple patterns
    const customerPatterns = [
      /(?:customer|client|buyer)(?:\s+name)?(?:\s+is)?\s+([a-zA-Z\s]+?)(?:\s+(?:address|phone|item|product|service|quantity|rate|price|gst|tax|rupees|rs)|\s*$)/i,
      /(?:bill\s+to|billing\s+name|customer)\s*:?\s*([a-zA-Z\s]+?)(?:\s+(?:address|phone|item|product|service|quantity|rate|price|gst|tax|rupees|rs)|\s*$)/i,
      /name\s+([a-zA-Z\s]+?)(?:\s+(?:address|phone|item|product|service|quantity|rate|price|gst|tax|rupees|rs)|\s*$)/i
    ];

    for (const pattern of customerPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && invoice.customer) {
        invoice.customer.name = match[1].trim();
        console.log('Found customer name:', invoice.customer.name);
        break;
      }
    }

    // Extract address
    const addressPatterns = [
      /address(?:\s+is)?\s+([^,]+?)(?:\s+(?:phone|item|product|service|quantity|rate|price|gst|tax|rupees|rs)|\s*$)/i,
      /(?:address|location)\s*:?\s*([^,]+?)(?:\s+(?:phone|item|product|service|quantity|rate|price|gst|tax|rupees|rs)|\s*$)/i
    ];

    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && invoice.customer) {
        invoice.customer.address = match[1].trim();
        console.log('Found address:', invoice.customer.address);
        break;
      }
    }

    // Extract phone number
    const phonePattern = /(?:phone|mobile|contact)(?:\s+number)?(?:\s+is)?\s+(\d{10,})/i;
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch && invoice.customer) {
      invoice.customer.phone = phoneMatch[1];
      console.log('Found phone:', invoice.customer.phone);
    }

    // Extract items with enhanced patterns
    const itemPatterns = [
      /(?:item|product|service)(?:\s+is)?\s+([a-zA-Z\s]+?)(?:\s+quantity|\s+qty|\s+rate|\s+price|\s+amount|\s+gst|\s+tax|\s*$)/i,
      /(?:selling|bought|purchase)\s+([a-zA-Z\s]+?)(?:\s+quantity|\s+qty|\s+rate|\s+price|\s+amount|\s+gst|\s+tax|\s*$)/i
    ];

    let currentItem: Partial<InvoiceItem> = {};
    
    for (const pattern of itemPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        currentItem.description = match[1].trim();
        console.log('Found item:', currentItem.description);
        break;
      }
    }

    // Extract quantity with multiple patterns
    const quantityPatterns = [
      /(?:quantity|qty)(?:\s+is)?\s+(\d+)/i,
      /(\d+)\s+(?:pieces|units|nos|numbers)/i,
      /(?:buy|buying|purchase|purchasing)\s+(\d+)/i
    ];

    for (const pattern of quantityPatterns) {
      const match = text.match(pattern);
      if (match) {
        currentItem.quantity = parseInt(match[1]);
        console.log('Found quantity:', currentItem.quantity);
        break;
      }
    }

    // Extract rate/price with multiple patterns
    const ratePatterns = [
      /(?:rate|price|cost)(?:\s+is)?\s+(?:rs\.?|rupees?)?\s*(\d+(?:\.\d+)?)/i,
      /(?:rs\.?|rupees?)\s*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:rs\.?|rupees?)/i,
      /(?:amount|total)\s+(?:rs\.?|rupees?)?\s*(\d+(?:\.\d+)?)/i
    ];

    for (const pattern of ratePatterns) {
      const match = text.match(pattern);
      if (match) {
        currentItem.rate = parseFloat(match[1]);
        console.log('Found rate:', currentItem.rate);
        break;
      }
    }

    // Extract GST rate
    const gstPatterns = [
      /(?:gst|tax)(?:\s+is)?\s+(\d+)\s*%?/i,
      /(\d+)\s*%\s*(?:gst|tax)/i,
      /(?:gst|tax)\s+rate\s+(\d+)/i
    ];

    for (const pattern of gstPatterns) {
      const match = text.match(pattern);
      if (match) {
        currentItem.gstRate = parseInt(match[1]);
        console.log('Found GST rate:', currentItem.gstRate);
        break;
      }
    }

    // Create item if we have at least description
    if (currentItem.description && invoice.items) {
      const item: InvoiceItem = {
        id: Date.now().toString(),
        description: currentItem.description,
        quantity: currentItem.quantity || 1,
        rate: currentItem.rate || 0,
        amount: (currentItem.quantity || 1) * (currentItem.rate || 0),
        gstRate: currentItem.gstRate || 18
      };
      
      invoice.items.push(item);
      console.log('Created item:', item);
    }

    // If no customer name found, set a default
    if (invoice.customer && !invoice.customer.name) {
      invoice.customer.name = 'Customer';
    }

    // If no items found, create a default item
    if (!invoice.items || invoice.items.length === 0) {
      invoice.items = [{
        id: Date.now().toString(),
        description: 'Product/Service',
        quantity: 1,
        rate: 0,
        amount: 0,
        gstRate: 18
      }];
    }

    console.log('Final parsed invoice:', invoice);
    return invoice;
  }

  static generatePDFContent(invoice: Invoice): string {
    const { subtotal, totalGST, grandTotal } = this.calculateInvoiceTotal(invoice.items);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .invoice-details { margin: 20px 0; }
        .customer-details { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total-row { background-color: #f9f9f9; font-weight: bold; }
        .signature { margin-top: 50px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>TAX INVOICE</h1>
        <p>Invoice No: ${invoice.invoiceNumber}</p>
        <p>Date: ${new Date(invoice.date).toLocaleDateString('en-IN')}</p>
    </div>

    <div class="customer-details">
        <h3>Bill To:</h3>
        <p><strong>${invoice.customer.name}</strong></p>
        <p>${invoice.customer.address}</p>
        ${invoice.customer.gstin ? `<p>GSTIN: ${invoice.customer.gstin}</p>` : ''}
        ${invoice.customer.phone ? `<p>Phone: ${invoice.customer.phone}</p>` : ''}
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>GST %</th>
                <th>GST Amount</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.items.map(item => {
              const gst = this.calculateGST(item.amount, item.gstRate);
              const gstAmount = gst.cgst + gst.sgst + gst.igst;
              return `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.rate.toFixed(2)}</td>
                    <td>₹${item.amount.toFixed(2)}</td>
                    <td>${item.gstRate}%</td>
                    <td>₹${gstAmount.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
        </tbody>
    </table>

    <div style="text-align: right; margin-top: 20px;">
        <p><strong>Subtotal: ₹${subtotal.toFixed(2)}</strong></p>
        <p><strong>Total GST: ₹${totalGST.toFixed(2)}</strong></p>
        <p style="font-size: 1.2em;"><strong>Grand Total: ₹${grandTotal.toFixed(2)}</strong></p>
    </div>

    <div class="signature">
        <p>Authorized Signatory</p>
        <br><br>
        <p>_________________</p>
    </div>
</body>
</html>
    `.trim();
  }
}