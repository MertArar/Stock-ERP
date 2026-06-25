"use client";

import { FiBox, FiMapPin, FiX } from "react-icons/fi";
import type { Product } from "@/features/products/context/ProductContext";
import type { Warehouse } from "@/features/warehouses/context/WarehouseContext";

type ProductDetailDrawerProps = {
  product: Product | null;
  warehouses: Warehouse[];
  onClose: () => void;
};

function getStockByWarehouse(product: Product, warehouseId: string) {
  return (
    product.warehouseStocks.find((item) => item.warehouseId === warehouseId)
      ?.quantity ?? 0
  );
}

export default function ProductDetailDrawer({
  product,
  warehouses,
  onClose,
}: ProductDetailDrawerProps) {
  if (!product) return null;

  const totalStock = product.warehouseStocks.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-[85] bg-slate-950/40 backdrop-blur-sm">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Detay panelini kapat"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Ürün Detayı
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-950">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{product.sku}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Detay panelini kapat"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Toplam Stok</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {totalStock} {product.unit}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Minimum Stok</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {product.minStock} {product.unit}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <FiBox size={21} />
              </div>

              <div>
                <h4 className="font-semibold text-slate-950">
                  Genel Ürün Bilgileri
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Kategori, birim ve stok durumu
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-slate-500">Kategori</p>
                <p className="mt-1 font-medium text-slate-950">
                  {product.category}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Birim</p>
                <p className="mt-1 font-medium text-slate-950">
                  {product.unit}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Durum</p>
                <p className="mt-1 font-medium text-slate-950">
                  {product.status}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Ürün Kodu</p>
                <p className="mt-1 font-medium text-slate-950">
                  {product.sku}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <FiMapPin size={21} />
              </div>

              <div>
                <h4 className="font-semibold text-slate-950">
                  Depo Bazlı Stok
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Ürünün hangi depoda kaç adet bulunduğu
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {warehouses.map((warehouse) => {
                const quantity = getStockByWarehouse(product, warehouse.id);
                const percentage =
                  totalStock > 0 ? Math.round((quantity / totalStock) * 100) : 0;

                return (
                  <div
                    key={warehouse.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-950">
                            {warehouse.name}
                          </p>

                          {warehouse.status === "Pasif" && (
                            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500">
                              Pasif
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {warehouse.location}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-slate-950">
                          {quantity} {product.unit}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          %{percentage}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}