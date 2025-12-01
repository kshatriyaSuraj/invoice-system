import { renderInvoiceHTML } from "@/utils/renderInvoiceHTML";
import { NextResponse } from "next/server";

let chromium: any = null;
let puppeteer: any = null;

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  chromium = (await import("@sparticuz/chromium")).default;
  puppeteer = (await import("puppeteer-core")).default;
} else {
  puppeteer = (await import("puppeteer")).default;
}

export async function POST(req: Request) {
  let browser;

  try {
    const data = await req.json();

    if (!data) {
      return NextResponse.json(
        { message: "Invoice data is required" },
        { status: 400 }
      );
    }

    const html = renderInvoiceHTML(data);

    if (isProd) {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      browser = await puppeteer.launch({
        headless: true,
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    await browser.close();

    const invoiceNumber = data.invoiceNumber || "invoice";

    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Invoice_${invoiceNumber}.pdf`,
      },
    });
  } catch (error: any) {
    console.error("PDF Error:", error);
    if (browser) await browser.close().catch(() => {});
    return NextResponse.json(
      { message: "Failed to generate PDF", error: error.message },
      { status: 500 }
    );
  }
}
