import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  console.log("Seeding database...");

  await prisma.inventory.deleteMany();
  await prisma.supplier.deleteMany();

  // Create suppliers
  const suppliers = await prisma.supplier.createMany({
    data: [
      { name: "Bharat Tech Distributors", city: "Bengaluru" },
      { name: "Mumbai Workspace Furnishings", city: "Mumbai" },
      { name: "Deccan Display Systems", city: "Hyderabad" },
      { name: "CableKart India", city: "Pune" },
      { name: "Prakash Lighting Solutions", city: "Chennai" },
      { name: "Capital Office Essentials", city: "New Delhi" },
    ],
  });

  console.log(`Created ${suppliers.count} suppliers`);

  const supplierRecords = await prisma.supplier.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  const supplierIds = new Map(
    supplierRecords.map((supplier) => [supplier.name, supplier.id]),
  );

  // Create inventory items with Decimal prices
  const inventoryData = [
    // Bharat Tech Distributors
    {
      supplierName: "Bharat Tech Distributors",
      productName: "Wireless Mouse",
      quantity: 180,
      price: 799,
    },
    {
      supplierName: "Bharat Tech Distributors",
      productName: "Mechanical Keyboard",
      quantity: 90,
      price: 2499,
    },
    {
      supplierName: "Bharat Tech Distributors",
      productName: "Laptop Stand",
      quantity: 140,
      price: 1299,
    },
    {
      supplierName: "Bharat Tech Distributors",
      productName: "Wireless Charger",
      quantity: 160,
      price: 1499,
    },
    {
      supplierName: "Bharat Tech Distributors",
      productName: "USB Hub",
      quantity: 130,
      price: 999,
    },

    // Mumbai Workspace Furnishings
    {
      supplierName: "Mumbai Workspace Furnishings",
      productName: "Ergonomic Office Chair",
      quantity: 45,
      price: 8999,
    },
    {
      supplierName: "Mumbai Workspace Furnishings",
      productName: "Height Adjustable Desk",
      quantity: 28,
      price: 18999,
    },
    {
      supplierName: "Mumbai Workspace Furnishings",
      productName: "Desk Mat",
      quantity: 110,
      price: 499,
    },
    {
      supplierName: "Mumbai Workspace Furnishings",
      productName: "Filing Cabinet",
      quantity: 35,
      price: 7499,
    },

    // Deccan Display Systems
    {
      supplierName: "Deccan Display Systems",
      productName: "27 Inch IPS Monitor",
      quantity: 60,
      price: 16499,
    },
    {
      supplierName: "Deccan Display Systems",
      productName: "Full HD Webcam",
      quantity: 75,
      price: 2999,
    },
    {
      supplierName: "Deccan Display Systems",
      productName: "Monitor Arm",
      quantity: 55,
      price: 2199,
    },

    // CableKart India
    {
      supplierName: "CableKart India",
      productName: "USB-C Cable",
      quantity: 650,
      price: 299,
    },
    {
      supplierName: "CableKart India",
      productName: "HDMI Cable",
      quantity: 420,
      price: 449,
    },
    {
      supplierName: "CableKart India",
      productName: "CAT6 Ethernet Cable",
      quantity: 320,
      price: 349,
    },

    // Prakash Lighting Solutions
    {
      supplierName: "Prakash Lighting Solutions",
      productName: "LED Desk Lamp",
      quantity: 95,
      price: 1599,
    },
    {
      supplierName: "Prakash Lighting Solutions",
      productName: "LED Strip Light",
      quantity: 150,
      price: 899,
    },

    // Capital Office Essentials
    {
      supplierName: "Capital Office Essentials",
      productName: "Magnetic Whiteboard",
      quantity: 50,
      price: 3599,
    },
    {
      supplierName: "Capital Office Essentials",
      productName: "Paper Shredder",
      quantity: 30,
      price: 6499,
    },
  ];

  let inventoryCount = 0;
  for (const item of inventoryData) {
    const supplierId = supplierIds.get(item.supplierName);

    if (!supplierId) {
      console.warn(`Skipping ${item.productName}: missing supplier ${item.supplierName}`);
      continue;
    }

    await prisma.inventory.upsert({
      where: {
        supplierId_productName: {
          supplierId,
          productName: item.productName,
        },
      },
      update: {
        quantity: item.quantity,
        price: item.price,
      },
      create: {
        supplierId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      },
    });
    inventoryCount++;
  }

  console.log(`Created ${inventoryCount} inventory items`);
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
