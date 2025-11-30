"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, message } from "antd";
import api from "@/lib/api";

export default function Preview() {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/invoice/${id}`)
      .then((res) => {
        setInvoice(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching invoice:", err);
        setLoading(false);
      });
  }, [id]);

  const download = async () => {
    if (!invoice) return;
    setDownloadLoading(true);
    try {
      const res = await api.post("/invoice/pdf", invoice, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], {
        type: res.headers["content-type"] || "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${invoice.invoiceNumber}.pdf`;
      a.click();
      message.success("PDF downloaded");
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      message.error("Failed to download PDF");
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 font-semibold">
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invoice Not Found
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <span>←</span> Back to Invoices
          </button>
          <div className="flex gap-3">
            <Button
              type="primary"
              icon={<span>📥</span>}
              loading={downloadLoading}
              onClick={download}
              className="bg-blue-600 border-blue-600"
            >
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Container */}
        <div className="bg-white rounded-lg shadow-lg p-12 border-t-4 border-blue-600">
          {/* Header Section */}
          <div className="grid grid-cols-3 gap-8 mb-8 pb-8 border-b-2 border-slate-200">
            {/* Vendor Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                From
              </h3>
              <p className="text-lg font-bold text-slate-900 mb-1">
                {invoice.vendorName}
              </p>
              <p className="text-sm text-slate-600">
                {invoice.vendorAddressLine1}
              </p>
              <p className="text-sm text-slate-600">
                {invoice.vendorAddressLine2}
              </p>
            </div>

            {/* Invoice Title & Number */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-blue-600 mb-4">INVOICE</h1>
              <div className="bg-slate-100 p-4 rounded">
                <p className="text-xs text-slate-600 uppercase mb-1">
                  Invoice Number
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {invoice.invoiceNumber}
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Bill To
              </h3>
              <p className="text-lg font-bold text-slate-900 mb-1">
                {invoice.clientName}
              </p>
              <p className="text-sm text-slate-600">{invoice.clientAddress}</p>
              <p className="text-sm text-slate-600">
                {invoice.clientCityCountry}
              </p>
              {invoice.clientPoc && (
                <p className="text-sm text-slate-600 mt-1">
                  POC: {invoice.clientPoc}
                </p>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded">
              <p className="text-xs text-slate-600 font-semibold uppercase mb-1">
                Invoice Date
              </p>
              <p className="text-sm font-bold text-slate-900">
                {formatDate(invoice.invoiceDate)}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded">
              <p className="text-xs text-slate-600 font-semibold uppercase mb-1">
                Due Date
              </p>
              <p className="text-sm font-bold text-slate-900">
                {formatDate(invoice.dueDate)}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded">
              <p className="text-xs text-slate-600 font-semibold uppercase mb-1">
                Terms
              </p>
              <p className="text-sm font-bold text-slate-900">
                {invoice.terms || "N/A"}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                Balance Due
              </p>
              <p className="text-sm font-bold text-blue-900">
                ₹{invoice.balanceDue.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-200 border-b-2 border-slate-300">
                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-900">
                    Description
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-900">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-900">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-900">
                    IGST %
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-900">
                    IGST Amt
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {item.description}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">
                      {item.qty}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">
                      ₹{item.rate.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">
                      {item.igstPercent}%
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">
                      ₹{item.igstAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900">
                      ₹{item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="grid grid-cols-12 gap-4 mb-8">
            <div className="col-span-8"></div>
            <div className="col-span-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <p className="text-sm font-semibold text-slate-600">
                    Subtotal:
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    ₹{invoice.subTotal.toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <p className="text-sm font-semibold text-slate-600">
                    IGST Total:
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    ₹{invoice.igstTotal.toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between items-center bg-blue-100 p-3 rounded border-2 border-blue-300">
                  <p className="text-sm font-bold text-blue-900">
                    Grand Total:
                  </p>
                  <p className="text-lg font-bold text-blue-900">
                    ₹{invoice.grandTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total in Words */}
          {invoice.totalInWords && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded p-4 mb-8">
              <p className="text-xs text-amber-700 font-semibold uppercase mb-1">
                Amount in Words
              </p>
              <p className="text-lg font-bold text-amber-900">
                {invoice.totalInWords}
              </p>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">
                Notes
              </h3>
              <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded border border-slate-200">
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Bank Details */}
          <div className="border-t-2 border-slate-200 pt-8 mb-8">
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-4">
              Bank Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-slate-600 font-semibold mb-1">
                  Account Holder
                </p>
                <p className="text-sm text-slate-900 font-medium">
                  {invoice.accountHolder}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-semibold mb-1">
                  Account No.
                </p>
                <p className="text-sm text-slate-900 font-medium">
                  {invoice.accountNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-semibold mb-1">
                  IFSC
                </p>
                <p className="text-sm text-slate-900 font-medium">
                  {invoice.ifsc}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-semibold mb-1">
                  Branch
                </p>
                <p className="text-sm text-slate-900 font-medium">
                  {invoice.branch}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-semibold mb-1">
                  Branch Code
                </p>
                <p className="text-sm text-slate-900 font-medium">
                  {invoice.branchCode}
                </p>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="border-t-2 border-slate-200 pt-8">
            <div className="text-right">
              <div className="inline-block text-center">
                <div className="h-16 mb-2 border-b-2 border-slate-400 w-48"></div>
                <p className="text-sm font-bold text-slate-900">
                  {invoice.signatureName}
                </p>
                <p className="text-xs text-slate-600">
                  {invoice.signatureTitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>This is a computer-generated invoice. No signature is required.</p>
        </div>
      </div>
    </div>
  );
}
