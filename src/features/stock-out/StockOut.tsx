"use client";

import { useMemo, useState } from "react";
import { FiArrowUpRight, FiPackage, FiShoppingBag } from "react-icons/fi";

import { useProducts } from "@/features/products/context/ProductContext";
import { useStockMovements } from "@/features/stock-movements/context/StockMovementContext";
import type { StockOutReason } from "@/features/stock-movements/types/stockMovement";
import { useWarehouses } from "@/features/warehouses/context/WarehouseContext";

import StockOutForm from "./components/StockOutForm";

export default function StockOut() {
  const [successMessage, setSuccessMessage] = useState("");

  const { products, decreaseProductStock } = useProducts();
  const { warehouses } = useWarehouses();
  const { stockOutMovements, totalStockOutQuantity, addStockMovement } =
    useStockMovements();

  const availableProducts = useMemo(() => {
    return products.filter(
      (product) => product.status !== "Pasif" && product.currentStock > 0
    );
  }, [products]);

  const handleStockOut = (values: {
    productId: string;
    warehouseId: string;
    quantity: number;
    reason: StockOutReason;
    relatedName?: string;
    documentNo?: string;
    description?: string;
  }) => {
    const product = products.find((item) => item.id === values.productId);
    const warehouse = warehouses.find((item) => item.id === values.warehouseId);

    if (!product || !warehouse) {
      return {
        success: false,
        message: "Ürün veya depo bulunamadı.",
      };
    }

    const result = decreaseProductStock(
      product.id,
      warehouse.id,
      values.quantity
    );

    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    const movement = addStockMovement({
      type: "stock-out",

      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productUnit: product.unit,

      warehouseId: warehouse.id,
      warehouseName: warehouse.name,

      quantity: values.quantity,

      stockOutReason: values.reason,
      relatedName: values.relatedName,
      documentNo: values.documentNo,
      description: values.description,
    });

    setSuccessMessage(
      `${movement.productName} için ${movement.quantity} ${movement.productUnit} stok çıkışı kaydedildi.`
    );

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return {
      success: true,
    };
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <FiArrowUpRight />
              Stoktan düşüm
            </div>

            <h1 className="text-2xl font-semibold text-slate-900">
              Stok Çıkışı
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Satış, üretimde kullanım, fire, iade veya sayım düzeltmesi gibi
              nedenlerle depodaki ürün stoğunu düş.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  <FiShoppingBag />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Çıkış hareketi
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {stockOutMovements.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <FiPackage />
                </div>

                <div>
                  <p className="text-xs font-medium text-white/60">
                    Toplam çıkan miktar
                  </p>

                  <p className="mt-1 text-xl font-semibold">
                    {totalStockOutQuantity}
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

      <StockOutForm
        products={availableProducts}
        warehouses={warehouses}
        onSubmit={handleStockOut}
      />
    </div>
  );
}