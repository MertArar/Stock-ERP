"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiArrowDownLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiMinus,
} from "react-icons/fi";

import type { StockMovement } from "../types/stockMovement";

type StockMovementsTableProps = {
  movements: StockMovement[];
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMoneyTRY(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMoney(value?: number, currency?: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || !currency) {
    return "-";
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function getMovementLabel(type: StockMovement["type"]) {
  if (type === "stock-in") {
    return "Stok Girişi";
  }

  if (type === "stock-out") {
    return "Stok Çıkışı";
  }

  if (type === "transfer") {
    return "Transfer";
  }

  return "Düzeltme";
}

function getMovementIcon(type: StockMovement["type"]) {
  if (type === "stock-in") {
    return <FiArrowDownLeft />;
  }

  if (type === "stock-out") {
    return <FiArrowUpRight />;
  }

  if (type === "transfer") {
    return <FiArrowRight />;
  }

  return <FiMinus />;
}

function getMovementTextClass(type: StockMovement["type"]) {
  if (type === "stock-in") {
    return "text-emerald-700";
  }

  if (type === "stock-out") {
    return "text-red-700";
  }

  if (type === "transfer") {
    return "text-blue-700";
  }

  return "text-amber-700";
}

function getDescriptionLimit(width: number) {
  if (width < 640) {
    return 46;
  }

  if (width < 1024) {
    return 70;
  }

  if (width < 1280) {
    return 95;
  }

  return 125;
}

function useResponsiveDescriptionLimit() {
  const [limit, setLimit] = useState(95);

  useEffect(() => {
    function updateLimit() {
      setLimit(getDescriptionLimit(window.innerWidth));
    }

    updateLimit();
    window.addEventListener("resize", updateLimit);

    return () => {
      window.removeEventListener("resize", updateLimit);
    };
  }, []);

  return limit;
}

export default function StockMovementsTable({
  movements,
}: StockMovementsTableProps) {
  const descriptionLimit = useResponsiveDescriptionLimit();
  const [expandedDescriptionIds, setExpandedDescriptionIds] = useState<
    string[]
  >([]);

  const expandedMap = useMemo(() => {
    return new Set(expandedDescriptionIds);
  }, [expandedDescriptionIds]);

  const toggleDescription = (movementId: string) => {
    setExpandedDescriptionIds((prev) => {
      if (prev.includes(movementId)) {
        return prev.filter((id) => id !== movementId);
      }

      return [...prev, movementId];
    });
  };

  if (movements.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <FiFileText />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          Hareket kaydı bulunamadı
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Stok girişi veya stok çıkışı yaptığında kayıtlar burada listelenecek.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-4 font-semibold">Tarih</th>
              <th className="px-5 py-4 font-semibold">İşlem</th>
              <th className="px-5 py-4 font-semibold">Ürün</th>
              <th className="px-5 py-4 font-semibold">Depo</th>
              <th className="px-5 py-4 font-semibold">Miktar</th>
              <th className="px-5 py-4 font-semibold">Birim fiyat</th>
              <th className="px-5 py-4 font-semibold">Döviz</th>
              <th className="px-5 py-4 font-semibold">Kur</th>
              <th className="px-5 py-4 font-semibold">Toplam</th>
              <th className="px-5 py-4 font-semibold">TL karşılığı</th>
              <th className="px-5 py-4 font-semibold">Tedarikçi / İlgili</th>
              <th className="px-5 py-4 font-semibold">Belge</th>
              <th className="px-5 py-4 font-semibold">Açıklama</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {movements.map((movement) => {
              const description = movement.description?.trim() || "";
              const isExpanded = expandedMap.has(movement.id);
              const hasLongDescription =
                description.length > descriptionLimit;

              const visibleDescription =
                !description || isExpanded || !hasLongDescription
                  ? description || "-"
                  : `${description.slice(0, descriptionLimit).trim()}...`;

              return (
                <tr
                  key={movement.id}
                  className="text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                    {formatDateTime(movement.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <div
                      className={[
                        "inline-flex items-center gap-2 text-sm font-semibold",
                        getMovementTextClass(movement.type),
                      ].join(" ")}
                    >
                      {getMovementIcon(movement.type)}
                      {getMovementLabel(movement.type)}
                    </div>

                    {movement.stockOutReason && (
                      <p className="mt-1 pl-6 text-xs font-medium text-red-600">
                        {movement.stockOutReason}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {movement.productName}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {movement.productSku}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    {movement.type === "transfer" &&
                    movement.targetWarehouseName ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">
                          {movement.warehouseName}
                        </span>

                        <FiArrowRight className="shrink-0 text-slate-400" />

                        <span className="font-medium text-slate-800">
                          {movement.targetWarehouseName}
                        </span>
                      </div>
                    ) : (
                      <p className="font-medium text-slate-800">
                        {movement.warehouseName}
                      </p>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="font-semibold text-slate-900">
                      {formatNumber(movement.quantity)}
                    </span>{" "}
                    <span className="text-slate-400">
                      {movement.productUnit}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    {formatMoney(movement.unitPrice, movement.currency)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    {movement.currency ?? "-"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    {typeof movement.exchangeRate === "number"
                      ? formatNumber(movement.exchangeRate)
                      : "-"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    {formatMoney(movement.totalPrice, movement.currency)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                    {formatMoneyTRY(movement.totalPriceTRY)}
                  </td>

                  <td className="px-5 py-4">
                    {movement.supplierName || movement.relatedName || "-"}
                  </td>

                  <td className="px-5 py-4">
                    {movement.invoiceNo || movement.documentNo || "-"}
                  </td>

                  <td className="max-w-[260px] px-5 py-4 sm:max-w-[320px] lg:max-w-[420px] xl:max-w-[520px]">
                    <div className="flex items-start gap-2">
                      <p
                        className={[
                          "min-w-0 text-slate-500",
                          isExpanded ? "whitespace-normal" : "line-clamp-2",
                        ].join(" ")}
                      >
                        {visibleDescription}
                      </p>

                      {hasLongDescription && (
                        <button
                          type="button"
                          onClick={() => toggleDescription(movement.id)}
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                          aria-label={
                            isExpanded
                              ? "Açıklamayı kısalt"
                              : "Açıklamanın tamamını göster"
                          }
                        >
                          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}