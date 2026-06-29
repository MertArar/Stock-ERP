"use client";

import { useMemo, useState } from "react";
import { FiGitBranch, FiPackage, FiRepeat } from "react-icons/fi";

import { useProducts } from "@/features/products/context/ProductContext";
import { useStockMovements } from "@/features/stock-movements/context/StockMovementContext";
import { useWarehouses } from "@/features/warehouses/context/WarehouseContext";

import StockTransferForm from "./components/StockTransferForm";

export default function StockTransfer() {
  const [successMessage, setSuccessMessage] = useState("");

  const { products, transferProductStock } = useProducts();
  const { warehouses } = useWarehouses();
  const { transferMovements, totalTransferQuantity, addStockMovement } =
    useStockMovements();

  const availableProducts = useMemo(() => {
    return products.filter(
      (product) => product.status !== "Pasif" && product.currentStock > 0
    );
  }, [products]);

  const handleTransfer = (values: {
    productId: string;
    sourceWarehouseId: string;
    targetWarehouseId: string;
    quantity: number;
    documentNo?: string;
    description?: string;
  }) => {
    const product = products.find((item) => item.id === values.productId);
    const sourceWarehouse = warehouses.find(
      (item) => item.id === values.sourceWarehouseId
    );
    const targetWarehouse = warehouses.find(
      (item) => item.id === values.targetWarehouseId
    );

    if (!product || !sourceWarehouse || !targetWarehouse) {
      return {
        success: false,
        message: "Ürün, kaynak depo veya hedef depo bulunamadı.",
      };
    }

    const result = transferProductStock(
      product.id,
      sourceWarehouse.id,
      targetWarehouse.id,
      values.quantity
    );

    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    const movement = addStockMovement({
      type: "transfer",

      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productUnit: product.unit,

      warehouseId: sourceWarehouse.id,
      warehouseName: sourceWarehouse.name,

      targetWarehouseId: targetWarehouse.id,
      targetWarehouseName: targetWarehouse.name,

      quantity: values.quantity,

      documentNo: values.documentNo,
      description: values.description,
    });

    setSuccessMessage(
      `${movement.productName} için ${movement.quantity} ${movement.productUnit} transfer kaydı oluşturuldu.`
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
              <FiRepeat />
              Depolar arası hareket
            </div>

            <h1 className="text-2xl font-semibold text-slate-900">
              Depo Transferi
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Ürünleri bir depodan başka bir depoya aktar, kaynak ve hedef depo
              stoklarını otomatik güncelle.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  <FiGitBranch />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Transfer hareketi
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {transferMovements.length}
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
                    Toplam transfer miktarı
                  </p>

                  <p className="mt-1 text-xl font-semibold">
                    {totalTransferQuantity}
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

      <StockTransferForm
        products={availableProducts}
        warehouses={warehouses}
        onSubmit={handleTransfer}
      />
    </div>
  );
}