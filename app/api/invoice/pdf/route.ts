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
        // eslint-disable-next-line global-require
        const chromium = require("@sparticuz/chromium");
        // eslint-disable-next-line global-require
        puppeteer = require("puppeteer-core");

        launchOptions = {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        };
      } catch {
        puppeteer = await import("puppeteer").then((m) => m.default || m);
        launchOptions = { headless: true };
      }
    } else {
      puppeteer = await import("puppeteer").then((m) => m.default || m);
      launchOptions = { headless: true };
    }

    try {
      browser = await puppeteer.launch(launchOptions);
    } catch (launchError: any) {
      console.error(
        "Browser launch failed:",
        launchError?.message ?? launchError
      );

      // Fallback: if a remote PDF service is configured, send HTML to it
      const pdfServiceUrl = process.env.PDF_SERVICE_URL;
      const pdfServiceToken = process.env.PDF_SERVICE_TOKEN;
      if (pdfServiceUrl) {
        try {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (pdfServiceToken)
            headers["Authorization"] = `Bearer ${pdfServiceToken}`;

          const svcRes = await fetch(pdfServiceUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ html, invoiceNumber: data.invoiceNumber }),
          });

          if (!svcRes.ok) {
            const text = await svcRes.text().catch(() => "");
            console.error(
              "PDF service responded with error:",
              svcRes.status,
              text
            );
            throw new Error("PDF service error");
          }

          const arrayBuffer = await svcRes.arrayBuffer();
          const pdfBuffer = Buffer.from(arrayBuffer);

          const invoiceNumber = data.invoiceNumber || "invoice";
          return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename=Invoice_${invoiceNumber}.pdf`,
            },
          });
        } catch (svcError: any) {
          console.error(
            "PDF service fallback failed:",
            svcError?.message ?? svcError
          );
          // fall through to outer catch which returns a 500
        }
      }

      // If no fallback or fallback failed, rethrow to be handled below
      throw launchError;
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
