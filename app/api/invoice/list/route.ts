import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    const q = url.searchParams.get("q")?.trim() || "";

    const skip = (page - 1) * limit;

    const filter: any = {};
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { invoiceNumber: { $regex: regex } },
        { clientName: { $regex: regex } },
      ];
    }

    const [total, invoices] = await Promise.all([
      Invoice.countDocuments(filter),
      Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    return NextResponse.json({ invoices, total });
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
