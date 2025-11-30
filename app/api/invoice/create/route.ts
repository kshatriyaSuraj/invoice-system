import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body) {
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 }
      );
    }

    // Basic server-side validation
    const errors: string[] = [];

    if (
      !body.invoiceNumber ||
      typeof body.invoiceNumber !== "string" ||
      !body.invoiceNumber.trim()
    ) {
      errors.push("invoiceNumber is required");
    } else if (body.invoiceNumber.length > 100) {
      errors.push("invoiceNumber is too long (max 100 chars)");
    }

    if (!body.invoiceDate || isNaN(Date.parse(body.invoiceDate))) {
      errors.push("invoiceDate is required and must be a valid date");
    }

    if (
      !body.clientName ||
      typeof body.clientName !== "string" ||
      !body.clientName.trim()
    ) {
      errors.push("clientName is required");
    } else if (body.clientName.length > 200) {
      errors.push("clientName is too long (max 200 chars)");
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      errors.push("At least one invoice item is required");
    } else if (body.items.length > 200) {
      errors.push("Too many items in invoice");
    } else {
      body.items.forEach((it: any, idx: number) => {
        if (!it.description || typeof it.description !== "string") {
          errors.push(`items[${idx}].description is required`);
        }
        const qty = Number(it.qty);
        const rate = Number(it.rate);
        if (!isFinite(qty) || qty <= 0) {
          errors.push(`items[${idx}].qty must be a number greater than 0`);
        }
        if (!isFinite(rate) || rate < 0) {
          errors.push(`items[${idx}].rate must be a number >= 0`);
        }
      });
    }

    // grandTotal should be numeric
    if (body.grandTotal == null || !isFinite(Number(body.grandTotal))) {
      errors.push("grandTotal is required and must be a number");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    await connectDB();

    const invoice = await Invoice.create(body);

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
