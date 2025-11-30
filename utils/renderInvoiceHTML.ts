export function renderInvoiceHTML(d: any) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const rows = d.items
    .map(
      (it: any, i: number) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${it.description}</strong></td>
      <td class="text-center">${Number(it.qty).toFixed(2)}</td>
      <td class="text-right">₹${Number(it.rate).toFixed(2)}</td>
      <td class="text-center">${Number(it.igstPercent).toFixed(2)}%</td>
      <td class="text-right">₹${Number(it.igstAmount).toFixed(2)}</td>
      <td class="text-right">₹${Number(it.amount).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
    <style>
        /* BASE STYLES (unchanged) */
        body {
            font-family: Arial, sans-serif;
            font-size: 13px;
            color: #333;
            line-height: 1.5;
            background: #f5f5f5;
            padding: 8px;
            font-variant: normal;
            font-weight: normal;
            margin: 0;
        }

        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 25px;
            background: white;
        }

        .header-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 18px;
        }

        .company-name {
            font-size: 19px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 3px;
        }

        .company-address {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
        }

        .invoice-title {
            text-align: right;
            font-size: 26px;
            font-weight: bold;
            color: #2c3e50;
            letter-spacing: 1px;
        }

        .invoice-details {
            background-color: #f8f9fa;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 14px;
        }

        .invoice-details table {
            width: 100%;
        }

        .invoice-details td {
            padding: 4px 10px;
            font-size: 13px;
        }

        .invoice-details td:nth-child(1),
        .invoice-details td:nth-child(4) {
            font-weight: bold;
            color: #666;
            width: 110px;
        }

        .bill-to {
            margin-bottom: 14px;
        }

        .bill-to-title {
            font-size: 13px;
            font-weight: bold;
            color: #666;
            margin-bottom: 4px;
        }

        .bill-to-content {
            background-color: #f0f4f8;
            padding: 12px;
            border-left: 4px solid #3498db;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }

        .items-table th {
            background-color: #2c3e50;
            color: white;
            padding: 9px;
            text-align: left;
            font-size: 13px;
        }

        .items-table td {
            padding: 8px 9px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 13px;
        }

        .items-table .text-right {
            text-align: right;
        }

        .items-table .text-center {
            text-align: center;
        }

        .totals-section {
            display: flex;
            justify-content: space-between;
            margin-top: 16px;
            gap: 20px;
        }

        .left-section { flex: 1; }
        .right-section { width: 290px; }

        .total-words {
            background-color: #fff9e6;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
            font-size: 12px;
        }

        .notes-section {
            margin-bottom: 10px;
        }

        .notes-content {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            font-size: 12px;
            color: #666;
        }

        .bank-details {
            background-color: #e8f4fd;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #b3d7f2;
        }

        .bank-details table {
            width: 100%;
            font-size: 12px;
        }

        .bank-details td {
            padding: 3px 5px;
        }

        .bank-details td:first-child {
            font-weight: bold;
            width: 135px;
        }

        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals-table td {
            padding: 6px 10px;
            font-size: 13px;
            border-bottom: 1px solid #e0e0e0;
        }

        .totals-table .total-label {
            text-align: right;
            padding-right: 12px;
        }

        .totals-table .total-amount {
            text-align: right;
            font-weight: bold;
        }

        .totals-table .grand-total {
            background-color: #2c3e50;
            color: white;
            font-size: 13px;
        }

        .totals-table .balance-due {
            background-color: #e74c3c;
            color: white;
            font-size: 13px;
        }

        .signature-section {
            margin-top: 20px;
            text-align: right;
        }

        .signature-line {
            border-bottom: 1px solid #666;
            width: 180px;
            display: inline-block;
            margin-bottom: 3px;
        }

        .signature-name {
            font-weight: bold;
            font-size: 12px;
            margin-top: 2px;
        }

        .signature-title {
            font-size: 11px;
            color: #666;
        }

        /* --------------------------------------- */
        /*  PRINT QUALITY FIXES (MUST BE ABOVE)    */
        /* --------------------------------------- */

        * {
            -webkit-font-smoothing: subpixel-antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        @page {
            size: A4;
            margin: 10mm;
        }

        @media print {
            body {
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
            }

            .invoice-container {
                padding: 20px !important;
                margin: 0 !important;
                max-width: 100% !important;
            }

            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .bill-to-content,
            .invoice-details,
            .total-words,
            .notes-content,
            .bank-details,
            .items-table th,
            .totals-table .grand-total,
            .totals-table .balance-due {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
    </style>
</head>

<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header-section">
            <div>
                <div class="company-name">${d.vendorName}</div>
                <div class="company-address">
                    ${d.vendorAddressLine1}<br/>
                    ${d.vendorAddressLine2}
                </div>
            </div>

            <div class="invoice-title">TAX INVOICE</div>
        </div>

        <!-- Invoice Details -->
        <div class="invoice-details">
            <table>
                <tr>
                    <td>Invoice #</td><td>:</td><td>${d.invoiceNumber}</td>
                    <td>Invoice Date</td><td>:</td><td>${formatDate(
                      d.invoiceDate
                    )}</td>
                </tr>
                <tr>
                    <td>Terms</td><td>:</td><td>${d.terms}</td>
                    <td>Due Date</td><td>:</td><td>${formatDate(d.dueDate)}</td>
                </tr>
            </table>
        </div>

        <!-- Bill To -->
        <div class="bill-to">
            <div class="bill-to-title">Bill To</div>
            <div class="bill-to-content">
                <div style="display:flex; justify-content:space-between;">
                    <div>
                        <strong>${d.clientName}</strong><br/>
                        ${d.clientAddress}<br/>
                        ${d.clientCityCountry}
                    </div>
                    <div style="text-align:right;">
                        <strong>Attn:</strong> ${d.clientPoc}
                    </div>
                </div>
            </div>
        </div>

        <!-- Items -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Item & Description</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Rate</th>
                    <th class="text-center">IGST %</th>
                    <th class="text-right">IGST Amt</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>

        <!-- Totals + Bank -->
        <div class="totals-section">
            <div class="left-section">
                <div class="total-words">
                    <strong>Total In Words</strong><br/>
                    ${d.totalInWords}
                </div>

                <div class="notes-section">
                    <div class="notes-content">
                        ${d.notes}
                    </div>
                </div>

                <div class="bank-details">
                    <table>
                        <tr><td>Account Holder:</td><td>${
                          d.accountHolder
                        }</td></tr>
                        <tr><td>Account Number:</td><td>${
                          d.accountNumber
                        }</td></tr>
                        <tr><td>IFSC Code:</td><td>${d.ifsc}</td></tr>
                        <tr><td>Branch:</td><td>${d.branch}</td></tr>
                        <tr><td>Branch Code:</td><td>${d.branchCode}</td></tr>
                    </table>
                </div>
            </div>

            <div class="right-section">
                <table class="totals-table">
                    <tr><td class="total-label">Sub Total</td><td class="total-amount">₹${Number(
                      d.subTotal
                    ).toFixed(2)}</td></tr>
                    <tr><td class="total-label">IGST (0%)</td><td class="total-amount">₹${Number(
                      d.igstTotal
                    ).toFixed(2)}</td></tr>
                    <tr class="grand-total"><td class="total-label">Total</td><td class="total-amount">₹${Number(
                      d.grandTotal
                    ).toFixed(2)}</td></tr>
                    <tr class="balance-due"><td class="total-label">Balance Due</td><td class="total-amount">₹${Number(
                      d.balanceDue
                    ).toFixed(2)}</td></tr>
                </table>

                <div class="signature-section">
                    <div style="height:80px;"></div>
                    <div class="signature-line"></div>
                    <div class="signature-name">${d.signatureName}</div>
                    <div class="signature-title">Authorized Signature</div>
                </div>
            </div>
        </div>

    </div>
</body>
</html>
`;
}
