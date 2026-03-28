import { prisma } from "@/lib/prisma";

export interface SupplierInventoryReportItem {
  productName: string;
  quantity: number;
  price: number;
  value: number;
}

export interface SupplierInventoryReport {
  supplierId: string;
  supplierName: string;
  city: string;
  inventory: SupplierInventoryReportItem[];
  totalValue: number;
}

export async function getInventoryGroupedBySupplier(): Promise<
  SupplierInventoryReport[]
> {
  const suppliers = await prisma.supplier.findMany({
    include: {
      inventory: true,
    },
  });

  return suppliers
    .map((supplier) => {
      const inventory = supplier.inventory.map((item) => {
        const price = item.price.toNumber();

        return {
          productName: item.productName,
          quantity: item.quantity,
          price,
          value: item.quantity * price,
        };
      });

      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        city: supplier.city,
        inventory,
        totalValue: inventory.reduce((sum, item) => sum + item.value, 0),
      };
    })
    .filter((supplier) => supplier.inventory.length > 0)
    .sort((a, b) => b.totalValue - a.totalValue);
}
