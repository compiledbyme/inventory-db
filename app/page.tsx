"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SupplierInventoryReport } from "@/lib/inventory-report";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

export default function Home() {
  const [report, setReport] = useState<SupplierInventoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/inventory")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch inventory report");
        }

        return res.json();
      })
      .then((data: SupplierInventoryReport[]) => {
        setReport(data);
        setLoading(false);
      })
      .catch((fetchError) => {
        console.error(fetchError);
        setError("Unable to load inventory report.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading inventory report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Inventory Value Report</h1>

      <div className="grid gap-6">
        {report.map((supplier) => (
          <Card key={supplier.supplierId}>
            <CardHeader>
              <CardTitle>
                {supplier.supplierName} - {supplier.city}
              </CardTitle>
              <p className="text-2xl font-bold text-green-600">
                Total Value: {currencyFormatter.format(supplier.totalValue)}
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Product</th>
                      <th className="py-2 text-right">Quantity</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.inventory.map((item) => (
                      <tr
                        key={`${supplier.supplierId}-${item.productName}`}
                        className="border-b"
                      >
                        <td className="py-2">{item.productName}</td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">
                          {currencyFormatter.format(item.price)}
                        </td>
                        <td className="py-2 text-right">
                          {currencyFormatter.format(item.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
