import { renderInvoiceHTML } from "@/utils/renderInvoiceHTML";
import { NextResponse } from "next/server";

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
    if (!html) {
      console.error("renderInvoiceHTML returned empty HTML");
      return NextResponse.json(
        { message: "Failed to render invoice HTML" },
        { status: 500 }
      );
    }

    let puppeteer;
    let launchOptions: any;

    const isVercel = process.env.VERCEL === "1";

    if (isVercel) {
      try {
        // On Vercel, chrome-aws-lambda provides the Chrome executable
        const getChromium = () => {
          try {
            // eslint-disable-next-line global-require
            return require("chrome-aws-lambda");
          } catch {
            return null;
          }
        };

        const chromium = getChromium();
        if (chromium) {
          // eslint-disable-next-line global-require
          puppeteer = require("puppeteer-core");

          const executablePath = await chromium.executablePath;
          launchOptions = {
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath,
            headless: chromium.headless,
          };
        } else {
          throw new Error("chrome-aws-lambda not found");
        }
      } catch {
        puppeteer = await import("puppeteer").then((m) => m.default || m);
        launchOptions = { headless: true };
      }
    } else {
      puppeteer = await import("puppeteer").then((m) => m.default || m);
      launchOptions = { headless: true };
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    await browser.close();

    const invoiceNumber = data.invoiceNumber || "invoice";
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Invoice_${invoiceNumber}.pdf`,
      },
    });
  } catch (error: any) {
    console.error("PDF Error:", error?.message || error);
    if (browser) {
      await browser.close().catch(() => {});
    }
    return NextResponse.json(
      {
        message: "Failed to generate PDF",
        details:
          process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}
