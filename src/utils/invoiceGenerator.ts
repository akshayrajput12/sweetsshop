/**
 * Invoice generation utilities for Dare To Diet
 * Generates beautiful PDF invoices for orders
 */

interface InvoiceData {
  invoice_number: string;
  order_number: string;
  invoice_date: string;
  due_date: string;
  order_date: string;
  store_info: {
    store_name: string;
    store_address: string;
    store_phone: string;
    store_email: string;
    currency_symbol: string;
  };
  customer_info: {
    name: string;
    email: string;
    phone: string;
  };
  delivery_address: {
    plotNumber?: string;
    buildingName?: string;
    street?: string;
    landmark?: string;
    pincode?: string;
    complete_address?: string;
    // Location fields removed - manual address entry only
  };
  items: any[];
  pricing: {
    subtotal: number;
    tax: number;
    delivery_fee: number;
    cod_fee: number;
    discount: number;
    total: number;
  };
  payment_info: {
    method: string;
    status: string;
    razorpay_payment_id?: string;
  };
  order_status: string;
  coupon_code?: string;
  special_instructions?: string;
}

// Generate HTML invoice template
export function generateInvoiceHTML(data: InvoiceData): string {
  const {
    invoice_number,
    order_number,
    invoice_date,
    due_date,
    order_date,
    store_info,
    customer_info,
    delivery_address,
    items,
    pricing,
    payment_info,
    order_status,
    coupon_code,
    special_instructions
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice_number}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .invoice-header {
            background: linear-gradient(135deg, hsl(8, 94%, 47%) 0%, hsl(8, 94%, 42%) 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .invoice-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .invoice-header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .invoice-header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .invoice-body {
            padding: 30px;
        }
        
        .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .info-section h3 {
            color: hsl(8, 94%, 47%);
            margin-bottom: 15px;
            font-size: 1.2rem;
            border-bottom: 2px solid hsl(8, 94%, 47%);
            padding-bottom: 5px;
            position: relative;
        }
        
        .info-section h3::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 30px;
            height: 2px;
            background: hsl(48, 96%, 58%);
        }
        
        .info-section p {
            margin-bottom: 8px;
            color: #555;
        }
        
        .info-section strong {
            color: #333;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .items-table th {
            background: linear-gradient(135deg, hsl(8, 94%, 47%) 0%, hsl(8, 94%, 42%) 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.9rem;
            letter-spacing: 0.5px;
        }
        
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #eee;
        }
        
        .items-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .items-table tr:hover {
            background: hsl(8, 94%, 97%);
            transform: translateY(-1px);
            transition: all 0.2s ease;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .pricing-summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .pricing-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        
        .pricing-row.total {
            border-top: 3px solid hsl(8, 94%, 47%);
            padding-top: 15px;
            margin-top: 15px;
            font-weight: bold;
            font-size: 1.3rem;
            color: hsl(8, 94%, 47%);
            background: linear-gradient(90deg, hsl(8, 94%, 97%) 0%, transparent 100%);
            padding: 15px;
            border-radius: 8px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-paid {
            background: #d4edda;
            color: #155724;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-delivered {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .invoice-footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
        }
        
        .invoice-footer p {
            margin-bottom: 10px;
        }
        
        .company-details {
            font-size: 0.9rem;
            color: #888;
            margin-top: 15px;
        }
        
        .company-logo {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: hsl(8, 94%, 47%);
            margin-bottom: 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .invoice-badge {
            display: inline-block;
            background: hsl(48, 96%, 58%);
            color: hsl(0, 0%, 20%);
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 10px;
        }
        
        @media print {
            body {
                background: white;
            }
            
            .invoice-container {
                box-shadow: none;
                margin: 0;
            }
            
            .invoice-header {
                background: hsl(8, 94%, 47%) !important;
                -webkit-print-color-adjust: exact;
            }
            
            .items-table th {
                background: hsl(8, 94%, 47%) !important;
                -webkit-print-color-adjust: exact;
            }
        }
        
        @media (max-width: 600px) {
            .invoice-info {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .items-table {
                font-size: 0.9rem;
            }
            
            .items-table th,
            .items-table td {
                padding: 10px 8px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
            <div class="company-logo">B</div>
            <h1 style="position: relative; z-index: 1; margin: 0; font-size: 2.5rem; font-weight: 700;">${store_info.store_name}</h1>
            <div class="invoice-badge">Tax Invoice</div>
        </div>
        
        <!-- Body -->
        <div class="invoice-body">
            <!-- Invoice Info -->
            <div class="invoice-info">
                <div class="info-section">
                    <h3>Invoice Details</h3>
                    <p><strong>Invoice Number:</strong> ${invoice_number}</p>
                    <p><strong>Order Number:</strong> ${order_number}</p>
                    <p><strong>Invoice Date:</strong> ${invoice_date}</p>
                    <p><strong>Due Date:</strong> ${due_date}</p>
                    <p><strong>Order Date:</strong> ${order_date}</p>
                </div>
                
                <div class="info-section">
                    <h3>Company Details</h3>
                    <p><strong>${store_info.store_name}</strong></p>
                    <p>${store_info.store_address}</p>
                    <p><strong>Phone:</strong> ${store_info.store_phone}</p>
                    <p><strong>Email:</strong> ${store_info.store_email}</p>
                    <p><strong>GST:</strong> 27ABCDE1234F1Z5</p>
                </div>
            </div>
            
            <div class="invoice-info">
                <div class="info-section">
                    <h3>Bill To</h3>
                    <p><strong>${customer_info.name}</strong></p>
                    <p><strong>Email:</strong> ${customer_info.email}</p>
                    <p><strong>Phone:</strong> ${customer_info.phone}</p>
                </div>
                
                <div class="info-section">
                    <h3>Delivery Address</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid hsl(8, 94%, 47%);">
                        <p><strong>Address:</strong></p>
                        <p style="margin-left: 10px;">${delivery_address.plotNumber || ''} ${delivery_address.buildingName || ''}</p>
                        <p style="margin-left: 10px;">${delivery_address.street || ''}</p>
                        ${delivery_address.landmark ? `<p style="margin-left: 10px;"><em>Near ${delivery_address.landmark}</em></p>` : ''}
                        <p style="margin-left: 10px;"><strong>Pincode:</strong> ${delivery_address.pincode || ''}</p>
                        
                        ${delivery_address.complete_address ? `
                        <p style="margin-top: 10px;"><strong>Full Address:</strong></p>
                        <p style="margin-left: 10px; font-style: italic;">${delivery_address.complete_address}</p>
                        ` : ''}
                        
                        <!-- Location features removed - manual address entry only -->
                    </div>
                </div>
            </div>
            
            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Weight/Qty</th>
                        <th class="text-center">Quantity</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>
                                <strong>${item.name}</strong>
                                ${item.category ? `<br><small style="color: #666;">${item.category}</small>` : ''}
                            </td>
                            <td>${item.weight || item.pieces || 'N/A'}</td>
                            <td class="text-center">${item.quantity}</td>
                            <td class="text-right">${store_info.currency_symbol}${item.price.toFixed(2)}</td>
                            <td class="text-right"><strong>${store_info.currency_symbol}${(item.price * item.quantity).toFixed(2)}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <!-- Pricing Summary -->
            <div class="pricing-summary">
                <div class="pricing-row">
                    <span>Subtotal:</span>
                    <span>${store_info.currency_symbol}${pricing.subtotal.toFixed(2)}</span>
                </div>
                
                <div class="pricing-row">
                    <span>Tax (GST):</span>
                    <span>${store_info.currency_symbol}${pricing.tax.toFixed(2)}</span>
                </div>
                
                <div class="pricing-row">
                    <span>Delivery Fee:</span>
                    <span>${pricing.delivery_fee > 0 ? store_info.currency_symbol + pricing.delivery_fee.toFixed(2) : 'FREE'}</span>
                </div>
                
                ${pricing.cod_fee > 0 ? `
                <div class="pricing-row">
                    <span>COD Fee:</span>
                    <span>${store_info.currency_symbol}${pricing.cod_fee.toFixed(2)}</span>
                </div>
                ` : ''}
                
                ${pricing.discount > 0 ? `
                <div class="pricing-row" style="color: #28a745;">
                    <span>Discount ${coupon_code ? `(${coupon_code})` : ''}:</span>
                    <span>-${store_info.currency_symbol}${pricing.discount.toFixed(2)}</span>
                </div>
                ` : ''}
                
                <div class="pricing-row total">
                    <span>Total Amount:</span>
                    <span>${store_info.currency_symbol}${pricing.total.toFixed(2)}</span>
                </div>
            </div>
            
            <!-- Payment & Status Info -->
            <div class="invoice-info">
                <div class="info-section">
                    <h3>Payment Information</h3>
                    <p><strong>Payment Method:</strong> ${payment_info.method.toUpperCase()}</p>
                    <p><strong>Payment Status:</strong> <span class="status-badge status-${payment_info.status}">${payment_info.status}</span></p>
                    ${payment_info.razorpay_payment_id ? `<p><strong>Transaction ID:</strong> ${payment_info.razorpay_payment_id}</p>` : ''}
                </div>
                
                <div class="info-section">
                    <h3>Order Status</h3>
                    <p><span class="status-badge status-${order_status}">${order_status}</span></p>
                    ${special_instructions ? `<p><strong>Special Instructions:</strong><br>${special_instructions}</p>` : ''}
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="invoice-footer">
            <p><strong>Thank you for choosing ${store_info.store_name}!</strong></p>
            <p>For any queries regarding this invoice, please contact us at ${store_info.store_email}</p>
            
            <div class="company-details">
                <p>This is a computer-generated invoice and does not require a physical signature.</p>
                <p>CIN: U12345MH2024PTC123456 | FSSAI: 12345678901234</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Generate and download PDF invoice
export async function downloadInvoice(invoiceData: InvoiceData): Promise<void> {
  try {
    // Generate HTML content
    const htmlContent = generateInvoiceHTML(invoiceData);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please allow popups.');
    }
    
    // Write HTML content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing (optional)
        // printWindow.close();
      }, 500);
    };
    
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error('Failed to generate invoice. Please try again.');
  }
}

// Alternative method using HTML5 download
export function downloadInvoiceHTML(invoiceData: InvoiceData): void {
  const htmlContent = generateInvoiceHTML(invoiceData);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${invoiceData.invoice_number}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Format currency for display
export function formatCurrency(amount: number, symbol: string = '₹'): string {
  return `${symbol}${amount.toFixed(2)}`;
}

// Validate invoice data
export function validateInvoiceData(data: any): data is InvoiceData {
  return (
    data &&
    data.invoice_number &&
    data.order_number &&
    data.store_info &&
    data.customer_info &&
    data.items &&
    Array.isArray(data.items) &&
    data.pricing
  );
}