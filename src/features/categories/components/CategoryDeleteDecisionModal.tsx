"use client";

import { useState } from "react";
import {
  FiAlertTriangle,
  FiArchive,
  FiArrowRight,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import type { Category } from "@/features/categories/context/CategoryContext";

type CategoryDeleteDecisionModalProps = {
  category: Category | null;
  productCount: number;
  targetCategories: Category[];
  onClose: () => void;
  onDeactivate: () => void;
  onMoveProducts: (targetCategory: Category) => void;
  onDeleteWithProducts: () => void;
};

export default function CategoryDeleteDecisionModal({
  category,
  productCount,
  targetCategories,
  onClose,
  onDeactivate,
  onMoveProducts,
  onDeleteWithProducts,
}: CategoryDeleteDecisionModalProps) {
  const [selectedTargetId, setSelectedTargetId] = useState("");

  if (!category) return null;

  const selectedTarget = targetCategories.find(
    (item) => item.id === selectedTargetId
  );

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <FiAlertTriangle size={23} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Bu kategoriye bağlı ürünler var
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                <span className="font-semibold text-slate-700">
                  {category.name}
                </span>{" "}
                kategorisine bağlı{" "}
                <span className="font-semibold text-slate-700">
                  {productCount}
                </span>{" "}
                ürün bulunuyor. Ne yapmak istediğini seçmelisin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 cursor-pointer"
            aria-label="Modalı kapat"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-6">
          <button
            type="button"
            onClick={onDeactivate}
            className="flex w-full items-start gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <FiArchive size={21} />
            </div>

            <div className="cursor-pointer">
              <p className="font-semibold text-slate-950">
                Kategoriyi Pasife Al
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Kategori silinmez. Ürünler listede kalır ama pasif kategori
                olarak açık gri görünür. Yeni ürün ekleme ekranında bu kategori
                seçilemez.
              </p>
            </div>
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <FiArrowRight size={21} />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-slate-950">
                  Ürünleri Başka Kategoriye Taşı
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Bu kategoriye bağlı ürünler seçtiğin kategoriye taşınır.
                  Ardından eski kategori silinir.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="flex flex-wrap gap-2">
                    {targetCategories.length === 0 ? (
                      <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                        Taşınabilecek aktif kategori yok.
                      </p>
                    ) : (
                      targetCategories.map((targetCategory) => {
                        const isSelected = selectedTargetId === targetCategory.id;

                        return (
                          <button
                            key={targetCategory.id}
                            type="button"
                            onClick={() => setSelectedTargetId(targetCategory.id)}
                            className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                              isSelected
                                ? "border-slate-950 bg-slate-950 text-white"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:text-slate-950 cursor-pointer"
                            }`}
                          >
                            {targetCategory.name}
                          </button>
                        );
                      })
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!selectedTarget}
                    onClick={() => selectedTarget && onMoveProducts(selectedTarget)}
                    className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    Taşı ve Sil
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onDeleteWithProducts}
            className="flex w-full items-start gap-4 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-left transition hover:border-rose-300 hover:bg-rose-100"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white">
              <FiTrash2 size={21} />
            </div>

            <div className="cursor-pointer">
              <p className="font-semibold text-rose-700">
                Kategori ve Ürünleri Sil
              </p>
              <p className="mt-1 text-sm leading-6 text-rose-600">
                Kategoriyle birlikte bu kategoriye bağlı {productCount} ürün de
                silinir. Bu işlem için ayrıca 10 saniyelik geri alma uyarısı
                gösterilir.
              </p>
            </div>
          </button>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 cursor-pointer" 
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
}