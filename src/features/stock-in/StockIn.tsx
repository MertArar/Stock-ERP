"use client";

import { useMemo, useState } from "react";
import { FiPackage, FiShoppingCart, FiTrendingUp } from "react-icons/fi";

import StockInForm from "./components/StockInForm";

import { useProducts } from "@/features/products/context/ProductContext";
import { useStockMovements } from "@/features/stock-movements/context/StockMovementContext";
import type { CurrencyCode } from "@/features/stock-movements/types/stockMovement";
import { useWarehouses } from "@/features/warehouses/context/WarehouseContext";

function formatMoneyTRY(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function StockIn() {
  const [successMessage, setSuccessMessage] = useState("");

  const { products, increaseProductStock } = useProducts();
  const { warehouses } = useWarehouses();

  const { stockInMovements, addStockMovement, totalStockInValueTRY } =
    useStockMovements();

  const activeProducts = useMemo(() => {
    return products.filter((product) => product.status !== "Pasif");
  }, [products]);

  const handleStockIn = (values: {
    productId: string;
    warehouseId: string;
    quantity: number;
    unitPrice: number;
    currency: CurrencyCode;
    exchangeRate: number;
    supplierName?: string;
    invoiceNo?: string;
    description?: string;
  }) => {
    const product = products.find((item) => item.id === values.productId);
    const warehouse = warehouses.find((item) => item.id === values.warehouseId);

    if (!product || !warehouse) {
      return;
    }

    increaseProductStock(product.id, warehouse.id, values.quantity);

    const movement = addStockMovement({
      type: "stock-in",

      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productUnit: product.unit,

      warehouseId: warehouse.id,
      warehouseName: warehouse.name,

      quantity: values.quantity,

      unitPrice: values.unitPrice,
      currency: values.currency,
      exchangeRate: values.exchangeRate,

      supplierName: values.supplierName,
      invoiceNo: values.invoiceNo,
      description: values.description,
    });

    setSuccessMessage(
      `${movement.productName} için ${movement.quantity} ${movement.productUnit} stok girişi kaydedildi.`
    );

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <FiShoppingCart />
              Stok ve ön muhasebe
            </div>

            <h1 className="text-2xl font-semibold text-slate-900">
              Stok Girişi
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Depoya giren ürünleri miktar, alış fiyatı, döviz, kur, tedarikçi
              ve fatura bilgileriyle birlikte kaydet.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  <FiPackage />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Toplam giriş hareketi
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {stockInMovements.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <FiTrendingUp />
                </div>

                <div>
                  <p className="text-xs font-medium text-white/60">
                    Girişlerin TL değeri
                  </p>

                  <p className="mt-1 text-xl font-semibold">
                    {formatMoneyTRY(totalStockInValueTRY)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      <StockInForm
        products={activeProducts}
        warehouses={warehouses}
        onSubmit={handleStockIn}
      />
    </div>
  );
}