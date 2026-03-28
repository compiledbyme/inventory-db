import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  city: z.string().min(1, "City is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = supplierSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { name, city } = validation.data;

    // Check if supplier already exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { name },
    });

    if (existingSupplier) {
      return NextResponse.json(
        { error: "Supplier with this name already exists" },
        { status: 409 },
      );
    }

    const supplier = await prisma.supplier.create({
      data: { name, city },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        inventory: true,
      },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
