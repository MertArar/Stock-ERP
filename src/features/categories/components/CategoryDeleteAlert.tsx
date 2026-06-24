"use client";

import { FiAlertTriangle, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import type { Category } from "@/features/categories/context/CategoryContext";

export type CategoryDeleteMode = "category-only" | "category-with-products";

type CategoryDeleteAlertProps = {
  deleteState: {
    category: Category;
    countdown: number;
    mode: CategoryDeleteMode;
    productCount: number;
  } | null;
  onUndo: () => void;
  onForceDelete: () => void;
};

function interpolateColor(countdown: number) {
  const progress = (10 - countdown) / 10;

  const start = {
    r: 244,
    g: 63,
    b: 94,
  };

  const end = {
    r: 127,
    g: 29,
    b: 29,
  };

  const r = Math.round(start.r + (end.r - start.r) * progress);
  const g = Math.round(start.g + (end.g - start.g) * progress);
  const b = Math.round(start.b + (end.b - start.b) * progress);

  return `rgb(${r}, ${g}, ${b})`;
}

export default function CategoryDeleteAlert({
  deleteState,
  onUndo,
  onForceDelete,
}: CategoryDeleteAlertProps) {
  if (!deleteState) return null;

  const progress = (deleteState.countdown / 10) * 100;
  const backgroundColor = interpolateColor(deleteState.countdown);

  const message =
    deleteState.mode === "category-with-products"
      ? `${deleteState.category.name} kategorisi ve bağlı ${deleteState.productCount} ürün ${deleteState.countdown} saniye içinde silinecek.`
      : `${deleteState.category.name} kategorisi ${deleteState.countdown} saniye içinde silinecek.`;

  return (
    <div
      className="fixed bottom-6 right-6 z-[90] w-[calc(100%-3rem)] max-w-md overflow-hidden rounded-3xl border border-rose-300 text-white shadow-2xl transition-colors duration-1000 ease-linear"
      style={{ backgroundColor }}
    >
      <div className="h-1 bg-black/20">
        <div
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <FiAlertTriangle size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {deleteState.mode === "category-with-products"
                ? "Kategori ve ürünler silinecek"
                : "Kategori silinecek"}
            </p>
            <p className="mt-1 text-sm text-white/90">{message}</p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-bold text-rose-700">
            {deleteState.countdown}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onUndo}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          >
            <FiRotateCcw size={17} />
            Geri Al
          </button>

          <button
            type="button"
            onClick={onForceDelete}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-black/30 px-4 text-sm font-semibold text-white transition hover:bg-black/45"
          >
            <FiTrash2 size={17} />
            Hızlı Sil
          </button>
        </div>
      </div>
    </div>
  );
}