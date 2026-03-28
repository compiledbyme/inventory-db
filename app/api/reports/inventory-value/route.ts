import { NextResponse } from "next/server";
import { getInventoryGroupedBySupplier } from "@/lib/inventory-report";

export async function GET() {
  try {
    const report = await getInventoryGroupedBySupplier();

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating inventory value report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
