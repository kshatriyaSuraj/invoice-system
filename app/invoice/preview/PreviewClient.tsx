"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, message } from "antd";
import api from "@/lib/api";

export default function PreviewClient() {
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
    } catch (error) {
      console.error(error);
      message.error("Failed to download PDF");
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!invoice)
    return <div className="p-10 text-center">Invoice not found</div>;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN");

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-[800px] mx-auto bg-white p-10 shadow">
        {/* ACTION BAR */}
        <div className="flex justify-between mb-6">
          <button onClick={() => router.push("/")} className="text-blue-600">
            ← Back
          </button>
          <Button type="primary" loading={downloadLoading} onClick={download}>
            Download PDF
          </Button>
        </div>

        {/* HEADER */}
        <div className="flex justify-between mb-8">
          <div>
            <div className="text-xl font-bold text-gray-800">
              {invoice.vendorName}
            </div>
            <div className="text-sm text-gray-600 leading-5">
              {invoice.vendorAddressLine1}
              <br />
              {invoice.vendorAddressLine2}
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">TAX INVOICE</div>
        </div>

        {/* INVOICE DETAILS */}
        <div className="bg-gray-50 p-4 mb-6 rounded">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="font-semibold w-28">Invoice #</td>
                <td>:</td>
                <td>{invoice.invoiceNumber}</td>
                <td className="font-semibold w-28">Invoice Date</td>
                <td>:</td>
                <td>{formatDate(invoice.invoiceDate)}</td>
              </tr>
              <tr>
                <td className="font-semibold">Terms</td>
                <td>:</td>
                <td>{invoice.terms}</td>
                <td className="font-semibold">Due Date</td>
                <td>:</td>
                <td>{formatDate(invoice.dueDate)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BILL TO */}
        <div className="mb-6">
          <div className="font-bold text-gray-600 mb-1">Bill To</div>
          <div className="bg-blue-50 p-4 border-l-4 border-blue-500 flex justify-between">
            <div>
              <strong>{invoice.clientName}</strong>
              <br />
              {invoice.clientAddress}
              <br />
              {invoice.clientCityCountry}
            </div>
            <div className="text-right">
              <strong>Attn:</strong> {invoice.clientPoc}
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <table className="w-full border mb-8 text-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-2">#</th>
              <th className="p-2 text-left">Item & Description</th>
              <th className="p-2">Qty</th>
              <th className="p-2 text-right">Rate</th>
              <th className="p-2">IGST %</th>
              <th className="p-2 text-right">IGST Amt</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any, i: number) => (
              <tr key={i} className="border-b">
                <td className="p-2 text-center">{i + 1}</td>
                <td className="p-2 font-semibold">{item.description}</td>
                <td className="p-2 text-center">{item.qty}</td>
                <td className="p-2 text-right">₹{item.rate}</td>
                <td className="p-2 text-center">{item.igstPercent}%</td>
                <td className="p-2 text-right">₹{item.igstAmount}</td>
                <td className="p-2 text-right font-semibold">₹{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS + BANK SECTION */}
        <div className="flex gap-6">
          {/* LEFT */}
          <div className="flex-1 space-y-4">
            {/* TOTAL IN WORDS */}
            {invoice.totalInWords && (
              <div className="bg-yellow-50 p-3 rounded">
                <strong>Total In Words</strong>
                <br />
                {invoice.totalInWords}
              </div>
            )}

            {/* NOTES */}
            {invoice.notes && (
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                {invoice.notes}
              </div>
            )}

            {/* BANK DETAILS */}
            <div className="bg-blue-50 p-4 rounded border text-sm">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td>Account Holder</td>
                    <td>{invoice.accountHolder}</td>
                  </tr>
                  <tr>
                    <td>Account Number</td>
                    <td>{invoice.accountNumber}</td>
                  </tr>
                  <tr>
                    <td>IFSC</td>
                    <td>{invoice.ifsc}</td>
                  </tr>
                  <tr>
                    <td>Branch</td>
                    <td>{invoice.branch}</td>
                  </tr>
                  <tr>
                    <td>Branch Code</td>
                    <td>{invoice.branchCode}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-[280px]">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="text-right pr-3">Sub Total</td>
                  <td className="text-right font-semibold">
                    ₹{invoice.subTotal}
                  </td>
                </tr>
                <tr>
                  <td className="text-right pr-3">IGST</td>
                  <td className="text-right font-semibold">
                    ₹{invoice.igstTotal}
                  </td>
                </tr>
                <tr className="bg-gray-800 text-white font-bold">
                  <td className="text-right pr-3">Total</td>
                  <td className="text-right">₹{invoice.grandTotal}</td>
                </tr>
                <tr className="bg-red-500 text-white font-bold">
                  <td className="text-right pr-3">Balance Due</td>
                  <td className="text-right">₹{invoice.balanceDue}</td>
                </tr>
              </tbody>
            </table>

            {/* SIGNATURE */}
            <div className="mt-12 text-right">
              <div className="border-b w-48 ml-auto mb-1"></div>
              <div className="font-semibold">{invoice.signatureName}</div>
              <div className="text-xs">{invoice.signatureTitle}</div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 text-center text-xs text-gray-500">
          This is a computer-generated invoice. No signature required.
        </div>
      </div>
    </div>
  );
}
