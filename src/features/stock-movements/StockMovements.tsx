"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiActivity,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

import { useStockMovements } from "./context/StockMovementContext";
import type { StockMovement } from "./types/stockMovement";
import StockMovementsTable from "./components/StockMovementTable";

type SelectOption = {
  value: string;
  label: string;
  description?: string;
};

type InlineSelectProps = {
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
};

const PAGE_SIZE = 20;

const movementTypeOptions: SelectOption[] = [
  {
    value: "all",
    label: "Tüm hareketler",
    description: "Giriş, çıkış ve diğer işlemler",
  },
  {
    value: "stock-in",
    label: "Stok Girişi",
    description: "Depoya giren ürünler",
  },
  {
    value: "stock-out",
    label: "Stok Çıkışı",
    description: "Depodan çıkan ürünler",
  },
  {
    value: "transfer",
    label: "Transfer",
    description: "Depolar arası hareketler",
  },
  {
    value: "adjustment",
    label: "Düzeltme",
    description: "Sayım ve stok düzeltmeleri",
  },
];

const currencyOptions: SelectOption[] = [
  {
    value: "all",
    label: "Tüm dövizler",
  },
  {
    value: "TRY",
    label: "TRY",
  },
  {
    value: "USD",
    label: "USD",
  },
  {
    value: "EUR",
    label: "EUR",
  },
  {
    value: "GBP",
    label: "GBP",
  },
];

const reasonOptions: SelectOption[] = [
  {
    value: "all",
    label: "Tüm çıkış nedenleri",
  },
  {
    value: "Satış",
    label: "Satış",
  },
  {
    value: "Üretimde Kullanım",
    label: "Üretimde Kullanım",
  },
  {
    value: "Fire",
    label: "Fire",
  },
  {
    value: "İade",
    label: "İade",
  },
  {
    value: "Sayım Düzeltmesi",
    label: "Sayım Düzeltmesi",
  },
  {
    value: "Diğer",
    label: "Diğer",
  },
];

function InlineSelect({
  value,
  options,
  placeholder,
  onChange,
}: InlineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left text-sm text-slate-900 outline-none transition hover:bg-white focus:border-slate-400"
      >
        <span className="min-w-0 truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <FiChevronDown
          className={[
            "shrink-0 text-slate-400 transition",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={[
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition",
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {option.label}
                  </span>

                  {option.description && (
                    <span
                      className={[
                        "mt-0.5 block truncate text-xs",
                        isSelected ? "text-white/60" : "text-slate-400",
                      ].join(" ")}
                    >
                      {option.description}
                    </span>
                  )}
                </span>

                {isSelected && <FiCheck className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatMoneyTRY(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

function normalizeText(value: string) {
  return value.toLocaleLowerCase("tr-TR").trim();
}

function movementMatchesSearch(movement: StockMovement, searchTerm: string) {
  const search = normalizeText(searchTerm);

  if (!search) {
    return true;
  }

  const haystack = [
    movement.productName,
    movement.productSku,
    movement.warehouseName,
    movement.supplierName,
    movement.relatedName,
    movement.invoiceNo,
    movement.documentNo,
    movement.stockOutReason,
    movement.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");

  return haystack.includes(search);
}

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePageCount = 5;

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxVisiblePageCount - 1);

  startPage = Math.max(1, endPage - maxVisiblePageCount + 1);

  const pages: number[] = [];

  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page);
  }

  return pages;
}

export default function StockMovements() {
  const {
    movements,
    stockInMovements,
    stockOutMovements,
    totalStockInValueTRY,
    totalStockOutQuantity,
  } = useStockMovements();

  const [searchTerm, setSearchTerm] = useState("");
  const [movementType, setMovementType] = useState("all");
  const [productId, setProductId] = useState("all");
  const [warehouseId, setWarehouseId] = useState("all");
  const [currency, setCurrency] = useState("all");
  const [stockOutReason, setStockOutReason] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const productOptions: SelectOption[] = useMemo(() => {
    const uniqueProducts = Array.from(
      new Map(
        movements.map((movement) => [
          movement.productId,
          {
            value: movement.productId,
            label: movement.productName,
            description: movement.productSku,
          },
        ])
      ).values()
    );

    return [
      {
        value: "all",
        label: "Tüm ürünler",
      },
      ...uniqueProducts,
    ];
  }, [movements]);

  const warehouseOptions: SelectOption[] = useMemo(() => {
    const uniqueWarehouses = Array.from(
      new Map(
        movements.map((movement) => [
          movement.warehouseId,
          {
            value: movement.warehouseId,
            label: movement.warehouseName,
          },
        ])
      ).values()
    );

    return [
      {
        value: "all",
        label: "Tüm depolar",
      },
      ...uniqueWarehouses,
    ];
  }, [movements]);

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      if (movementType !== "all" && movement.type !== movementType) {
        return false;
      }

      if (productId !== "all" && movement.productId !== productId) {
        return false;
      }

      if (warehouseId !== "all" && movement.warehouseId !== warehouseId) {
        return false;
      }

      if (currency !== "all" && movement.currency !== currency) {
        return false;
      }

      if (
        stockOutReason !== "all" &&
        movement.stockOutReason !== stockOutReason
      ) {
        return false;
      }

      return movementMatchesSearch(movement, searchTerm);
    });
  }, [
    movements,
    movementType,
    productId,
    warehouseId,
    currency,
    stockOutReason,
    searchTerm,
  ]);

  const filteredStockInQuantity = useMemo(() => {
    return filteredMovements
      .filter((movement) => movement.type === "stock-in")
      .reduce((total, movement) => total + movement.quantity, 0);
  }, [filteredMovements]);

  const filteredStockOutQuantity = useMemo(() => {
    return filteredMovements
      .filter((movement) => movement.type === "stock-out")
      .reduce((total, movement) => total + movement.quantity, 0);
  }, [filteredMovements]);

  const totalPages = Math.max(1, Math.ceil(filteredMovements.length / PAGE_SIZE));

  const paginatedMovements = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    return filteredMovements.slice(startIndex, endIndex);
  }, [filteredMovements, currentPage]);

  const visiblePageNumbers = useMemo(() => {
    return getVisiblePageNumbers(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const visibleStartIndex =
    filteredMovements.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const visibleEndIndex = Math.min(
    currentPage * PAGE_SIZE,
    filteredMovements.length
  );

  const shouldShowPagination = filteredMovements.length > PAGE_SIZE;

  const activeFilterCount = [
    movementType !== "all",
    productId !== "all",
    warehouseId !== "all",
    currency !== "all",
    stockOutReason !== "all",
    searchTerm.trim().length > 0,
  ].filter(Boolean).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    movementType,
    productId,
    warehouseId,
    currency,
    stockOutReason,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);

    setCurrentPage(nextPage);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setMovementType("all");
    setProductId("all");
    setWarehouseId("all");
    setCurrency("all");
    setStockOutReason("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <FiActivity />
              Stok kayıtları
            </div>

            <h1 className="text-2xl font-semibold text-slate-900">
              Stok Hareketleri
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Stok girişi, stok çıkışı ve ileride eklenecek transfer/düzeltme
              işlemlerini tek ekranda takip et.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <FiArrowDownLeft />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Giriş hareketi
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {stockInMovements.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-red-700 shadow-sm">
                  <FiArrowUpRight />
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
              <p className="text-xs font-medium text-white/60">
                Girişlerin TL değeri
              </p>

              <p className="mt-1 text-xl font-semibold">
                {formatMoneyTRY(totalStockInValueTRY)}
              </p>

              <p className="mt-1 text-xs text-white/50">
                Toplam çıkış: {totalStockOutQuantity}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <FiFilter />
              Filtreler
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {activeFilterCount > 0
                ? `${activeFilterCount} aktif filtre uygulanıyor.`
                : "Tüm stok hareketleri listeleniyor."}
            </p>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FiRefreshCw />
            Filtreleri temizle
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-6">
          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Arama
            </label>

            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Ürün, SKU, belge, tedarikçi ara"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              İşlem tipi
            </label>

            <InlineSelect
              value={movementType}
              options={movementTypeOptions}
              placeholder="İşlem tipi"
              onChange={setMovementType}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Ürün
            </label>

            <InlineSelect
              value={productId}
              options={productOptions}
              placeholder="Ürün seç"
              onChange={setProductId}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Depo
            </label>

            <InlineSelect
              value={warehouseId}
              options={warehouseOptions}
              placeholder="Depo seç"
              onChange={setWarehouseId}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Döviz
            </label>

            <InlineSelect
              value={currency}
              options={currencyOptions}
              placeholder="Döviz seç"
              onChange={setCurrency}
            />
          </div>

          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Çıkış nedeni
            </label>

            <InlineSelect
              value={stockOutReason}
              options={reasonOptions}
              placeholder="Çıkış nedeni"
              onChange={setStockOutReason}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-400">
              Filtrelenen kayıt
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-900">
              {filteredMovements.length}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-4 py-3">
            <p className="text-xs font-medium text-emerald-600">
              Filtrelenen giriş miktarı
            </p>

            <p className="mt-1 text-lg font-semibold text-emerald-800">
              {filteredStockInQuantity}
            </p>
          </div>

          <div className="rounded-2xl bg-red-50 px-4 py-3">
            <p className="text-xs font-medium text-red-600">
              Filtrelenen çıkış miktarı
            </p>

            <p className="mt-1 text-lg font-semibold text-red-800">
              {filteredStockOutQuantity}
            </p>
          </div>
        </div>
      </div>

      <StockMovementsTable movements={paginatedMovements} />

      {shouldShowPagination && (
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">
              {visibleStartIndex}-{visibleEndIndex}
            </span>{" "}
            arası gösteriliyor. Toplam{" "}
            <span className="font-semibold text-slate-900">
              {filteredMovements.length}
            </span>{" "}
            kayıt.
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft />
              Önceki
            </button>

            {visiblePageNumbers[0] > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goToPage(1)}
                  className="h-10 min-w-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  1
                </button>

                {visiblePageNumbers[0] > 2 && (
                  <span className="px-1 text-sm font-semibold text-slate-400">
                    ...
                  </span>
                )}
              </>
            )}

            {visiblePageNumbers.map((page) => {
              const isSelected = page === currentPage;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={[
                    "h-10 min-w-10 rounded-2xl px-3 text-sm font-semibold transition",
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {page}
                </button>
              );
            })}

            {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages && (
              <>
                {visiblePageNumbers[visiblePageNumbers.length - 1] <
                  totalPages - 1 && (
                  <span className="px-1 text-sm font-semibold text-slate-400">
                    ...
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => goToPage(totalPages)}
                  className="h-10 min-w-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sonraki
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}