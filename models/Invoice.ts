import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  itemNo: Number,
  description: String,
  qty: Number,
  rate: Number,
  igstPercent: Number,
  igstAmount: Number,
  amount: Number,
});

const InvoiceSchema = new mongoose.Schema(
  {
    // Vendor
    vendorName: String,
    vendorAddressLine1: String,
    vendorAddressLine2: String,

    // Invoice Meta
    invoiceNumber: String,
    invoiceDate: String,
    terms: String,
    dueDate: String,

    // Client
    clientName: String,
    clientAddress: String,
    clientCityCountry: String,
    clientPoc: String,

    // Items
    items: [ItemSchema],

    // Totals
    subTotal: Number,
    igstTotal: Number,
    grandTotal: Number,
    balanceDue: Number,
    totalInWords: String,

    // Notes
    notes: String,

    // Bank
    accountHolder: String,
    accountNumber: String,
    ifsc: String,
    branch: String,
    branchCode: String,

    // Signature
    signatureName: String,
    signatureTitle: String,
  },
  { timestamps: true }
);

// Indexes to improve search & sort performance
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ clientName: 1 });
InvoiceSchema.index({ createdAt: -1 });

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", InvoiceSchema);
