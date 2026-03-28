import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

const inventorySchema = z.object({
  supplierId: z.string().min(1, "Supplier ID is required"),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().int().min(0, "Quantity must be >= 0"),
  price: z.number().positive("Price must be > 0"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = inventorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { supplierId, productName, quantity, price } = validation.data;

    // Verify supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 },
      );
    }

    // Check if inventory item already exists for this supplier
    const existingItem = await prisma.inventory.findUnique({
      where: {
        supplierId_productName: {
          supplierId,
          productName,
        },
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Inventory item already exists for this supplier" },
        { status: 409 },
      );
    }

    const inventory = await prisma.inventory.create({
      data: {
        supplierId,
        productName,
        quantity,
        price,
      },
      include: {
        supplier: true,
      },
    });

    return NextResponse.json(inventory, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supplierId = searchParams.get("supplierId");
    const productName = searchParams.get("productName");

    const where: Prisma.InventoryWhereInput = {};

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (productName) {
      where.productName = {
        contains: productName,
        mode: "insensitive",
      };
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        supplier: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
