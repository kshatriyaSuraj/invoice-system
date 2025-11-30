import { renderInvoiceHTML } from "@/utils/renderInvoiceHTML";
import { generatePDF } from "@/utils/pdf";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const html = renderInvoiceHTML(data);
    const pdfBuffer = await generatePDF(html); // Uint8Array

    const buffer = Buffer.from(pdfBuffer);
    const blob = new Blob([buffer], { type: "application/pdf" });

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=invoice.pdf",
      },
    });
  } catch (error) {
    console.error("PDF Error:", error);
    return NextResponse.json(
      { message: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
