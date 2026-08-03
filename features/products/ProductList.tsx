"use client";

import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, Plus } from "lucide-react";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: string;
  stock: number;
}

const MOCK_PRODUCTS: Product[] = [
  { id: "PRD-101", sku: "PRD-101", name: "Industrial Sewing Machine X1", category: "Machinery", price: "৳125,000", stock: 45 },
  { id: "PRD-102", sku: "PRD-102", name: "Cotton Yarn Super Grade", category: "Raw Materials", price: "৳1,200", stock: 1200 },
];

export function ProductList() {
  const columns: Column<Product>[] = [
    { header: "SKU", accessorKey: "sku", cell: (p) => <span className="font-mono text-xs font-bold">{p.sku}</span> },
    { header: "Product Name", accessorKey: "name", cell: (p) => <span className="font-bold">{p.name}</span> },
    { header: "Category", accessorKey: "category" },
    { header: "Price", accessorKey: "price" },
    { header: "Stock Qty", cell: (p) => <Badge variant={p.stock > 100 ? "success" : "warning"}>{p.stock} units</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold">Product Catalog</h3>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Add Product</Button>
      </div>
      <DataTable columns={columns} data={MOCK_PRODUCTS} />
    </div>
  );
}
