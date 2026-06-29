"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiArrowDownCircle,
  FiBox,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiTrendingDown,
  FiXCircle,
} from "react-icons/fi";

import {
  getProductTotalStock,
  type Product,
} from "@/features/products/context/ProductContext";
import { useProducts } from "@/features/products/context/ProductContext";
import { useWarehouses } from "@/features/warehouses/context/WarehouseContext";

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

type CriticalLevel = "out" | "urgent" | "warning";

type SortType =
  | "severity"
  | "stock-asc"
  | "stock-desc"
  | "missing-desc"
  | "name";

const PAGE_SIZE = 20;

const criticalLevelOptions: SelectOption[] = [
  {
    value: "all",
    label: "Tüm kritikler",
    description: "Tükendi, acil ve kritik seviyedeki ürünler",
  },
  {
    value: "out",
    label: "Tükenenler",
    description: "Toplam stoğu sıfır olan ürünler",
  },
  {
    value: "urgent",
    label: "Acil seviye",
    description: "Minimum stoğun yarısının altına düşen ürünler",
  },
  {
    value: "warning",
    label: "Kritik seviye",
    description: "Minimum stok seviyesine yaklaşan ürünler",
  },
];

const sortOptions: SelectOption[] = [
  {
    value: "severity",
    label: "Önce en aciller",
  },
  {
    value: "missing-desc",
    label: "Eksik miktara göre",
  },
  {
    value: "stock-asc",
    label: "Stok azdan çoğa",
  },
  {
    value: "stock-desc",
    label: "Stok çoktan aza",
  },
  {
    value: "name",
    label: "Ürün adına göre",
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

function normalizeText(value: string) {
  return value.toLocaleLowerCase("tr-TR").trim();
}

function getCriticalLevel(product: Product): CriticalLevel {
  const totalStock = getProductTotalStock(product);

  if (totalStock <= 0) {
    return "out";
  }

  if (totalStock <= product.minStock / 2) {
    return "urgent";
  }

  return "warning";
}

function getCriticalLevelLabel(level: CriticalLevel) {
  if (level === "out") {
    return "Tükendi";
  }

  if (level === "urgent") {
    return "Acil";
  }

  return "Kritik";
}

function getCriticalLevelClass(level: CriticalLevel) {
  if (level === "out") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (level === "urgent") {
    return "bg-orange-100 text-orange-700 border-orange-200";
  }

  return "bg-amber-100 text-amber-700 border-amber-200";
}

function getProgressPercent(product: Product) {
  const totalStock = getProductTotalStock(product);

  if (product.minStock <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (totalStock / product.minStock) * 100));
}

function getSeverityOrder(level: CriticalLevel) {
  if (level === "out") {
    return 0;
  }

  if (level === "urgent") {
    return 1;
  }

  return 2;
}

function productMatchesSearch(product: Product, searchTerm: string) {
  const search = normalizeText(searchTerm);

  if (!search) {
    return true;
  }

  const haystack = [
    product.name,
    product.sku,
    product.category,
    product.unit,
    product.status,
  ]
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

export default function CriticalStocks() {
  const { products } = useProducts();
  const { warehouses } = useWarehouses();

  const [searchTerm, setSearchTerm] = useState("");
  const [criticalLevel, setCriticalLevel] = useState("all");
  const [category, setCategory] = useState("all");
  const [warehouseId, setWarehouseId] = useState("all");
  const [sortType, setSortType] = useState<SortType>("severity");
  const [currentPage, setCurrentPage] = useState(1);

  const criticalProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.status === "Pasif") {
        return false;
      }

      return getProductTotalStock(product) <= product.minStock;
    });
  }, [products]);

  const categoryOptions: SelectOption[] = useMemo(() => {
    const categories = Array.from(
      new Set(criticalProducts.map((product) => product.category))
    );

    return [
      {
        value: "all",
        label: "Tüm kategoriler",
      },
      ...categories.map((item) => ({
        value: item,
        label: item,
      })),
    ];
  }, [criticalProducts]);

  const warehouseOptions: SelectOption[] = useMemo(() => {
    return [
      {
        value: "all",
        label: "Tüm depolar",
        description: "Depo ayrımı olmadan kritik ürünler",
      },
      ...warehouses.map((warehouse) => ({
        value: warehouse.id,
        label: warehouse.name,
      })),
    ];
  }, [warehouses]);

  const filteredProducts = useMemo(() => {
    const filtered = criticalProducts.filter((product) => {
      const level = getCriticalLevel(product);

      if (criticalLevel !== "all" && level !== criticalLevel) {
        return false;
      }

      if (category !== "all" && product.category !== category) {
        return false;
      }

      if (warehouseId !== "all") {
        const warehouseStock = product.warehouseStocks.find(
          (item) => item.warehouseId === warehouseId
        );

        if (!warehouseStock) {
          return false;
        }
      }

      return productMatchesSearch(product, searchTerm);
    });

    return [...filtered].sort((a, b) => {
      const aStock = getProductTotalStock(a);
      const bStock = getProductTotalStock(b);

      const aMissing = Math.max(0, a.minStock - aStock);
      const bMissing = Math.max(0, b.minStock - bStock);

      if (sortType === "severity") {
        const aLevel = getCriticalLevel(a);
        const bLevel = getCriticalLevel(b);

        return getSeverityOrder(aLevel) - getSeverityOrder(bLevel);
      }

      if (sortType === "missing-desc") {
        return bMissing - aMissing;
      }

      if (sortType === "stock-asc") {
        return aStock - bStock;
      }

      if (sortType === "stock-desc") {
        return bStock - aStock;
      }

      return a.name.localeCompare(b.name, "tr-TR");
    });
  }, [
    criticalProducts,
    criticalLevel,
    category,
    warehouseId,
    searchTerm,
    sortType,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const visiblePageNumbers = useMemo(() => {
    return getVisiblePageNumbers(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const visibleStartIndex =
    filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const visibleEndIndex = Math.min(
    currentPage * PAGE_SIZE,
    filteredProducts.length
  );

  const shouldShowPagination = filteredProducts.length > PAGE_SIZE;

  const outOfStockCount = useMemo(() => {
    return criticalProducts.filter((product) => getProductTotalStock(product) <= 0)
      .length;
  }, [criticalProducts]);

  const urgentCount = useMemo(() => {
    return criticalProducts.filter((product) => {
      const level = getCriticalLevel(product);

      return level === "urgent";
    }).length;
  }, [criticalProducts]);

  const totalMissingQuantity = useMemo(() => {
    return criticalProducts.reduce((total, product) => {
      const totalStock = getProductTotalStock(product);

      return total + Math.max(0, product.minStock - totalStock);
    }, 0);
  }, [criticalProducts]);

  const activeFilterCount = [
    searchTerm.trim().length > 0,
    criticalLevel !== "all",
    category !== "all",
    warehouseId !== "all",
    sortType !== "severity",
  ].filter(Boolean).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, criticalLevel, category, warehouseId, sortType]);

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
    setCriticalLevel("all");
    setCategory("all");
    setWarehouseId("all");
    setSortType("severity");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              <FiAlertTriangle />
              Kritik stok takibi
            </div>

            <h1 className="text-2xl font-semibold text-slate-900">
              Kritik Stoklar
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Minimum stok seviyesine düşen ürünleri, tükenenleri ve acil
              tamamlanması gereken ürünleri tek ekranda takip et.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  <FiBox />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Kritik ürün
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {criticalProducts.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-red-700 shadow-sm">
                  <FiXCircle />
                </div>

                <div>
                  <p className="text-xs font-medium text-red-500">Tükenen</p>

                  <p className="mt-1 text-xl font-semibold text-red-800">
                    {outOfStockCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-orange-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-700 shadow-sm">
                  <FiTrendingDown />
                </div>

                <div>
                  <p className="text-xs font-medium text-orange-500">Acil</p>

                  <p className="mt-1 text-xl font-semibold text-orange-800">
                    {urgentCount}
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
                    Eksik miktar
                  </p>

                  <p className="mt-1 text-xl font-semibold">
                    {totalMissingQuantity}
                  </p>
                </div>
              </div>
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
                : "Tüm kritik ürünler listeleniyor."}
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
                placeholder="Ürün, SKU veya kategori ara"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Seviye
            </label>

            <InlineSelect
              value={criticalLevel}
              options={criticalLevelOptions}
              placeholder="Seviye seç"
              onChange={setCriticalLevel}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Kategori
            </label>

            <InlineSelect
              value={category}
              options={categoryOptions}
              placeholder="Kategori seç"
              onChange={setCategory}
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
              Sıralama
            </label>

            <InlineSelect
              value={sortType}
              options={sortOptions}
              placeholder="Sırala"
              onChange={(value) => setSortType(value as SortType)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <FiCheck />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Kritik stok bulunamadı
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Filtrelere göre minimum stok seviyesinin altında ürün yok.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4 font-semibold">Ürün</th>
                  <th className="px-5 py-4 font-semibold">Kategori</th>
                  <th className="px-5 py-4 font-semibold">Seviye</th>
                  <th className="px-5 py-4 font-semibold">Mevcut</th>
                  <th className="px-5 py-4 font-semibold">Minimum</th>
                  <th className="px-5 py-4 font-semibold">Eksik</th>
                  <th className="px-5 py-4 font-semibold">Doluluk</th>
                  <th className="px-5 py-4 font-semibold">Depo dağılımı</th>
                  <th className="px-5 py-4 font-semibold">Aksiyon</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map((product) => {
                  const totalStock = getProductTotalStock(product);
                  const missingQuantity = Math.max(
                    0,
                    product.minStock - totalStock
                  );
                  const level = getCriticalLevel(product);
                  const progressPercent = getProgressPercent(product);

                  return (
                    <tr
                      key={product.id}
                      className="text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {product.sku}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {product.category}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                            getCriticalLevelClass(level),
                          ].join(" ")}
                        >
                          {getCriticalLevelLabel(level)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="font-semibold text-slate-900">
                          {totalStock}
                        </span>{" "}
                        <span className="text-slate-400">{product.unit}</span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="font-semibold text-slate-900">
                          {product.minStock}
                        </span>{" "}
                        <span className="text-slate-400">{product.unit}</span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="font-semibold text-red-700">
                          {missingQuantity}
                        </span>{" "}
                        <span className="text-slate-400">{product.unit}</span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="w-36">
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-500">
                              %{Math.round(progressPercent)}
                            </span>

                            <span className="text-slate-400">min. stok</span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={[
                                "h-full rounded-full",
                                level === "out"
                                  ? "bg-red-500"
                                  : level === "urgent"
                                    ? "bg-orange-500"
                                    : "bg-amber-500",
                              ].join(" ")}
                              style={{
                                width: `${progressPercent}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex max-w-[360px] flex-wrap gap-2">
                          {product.warehouseStocks.map((stock) => {
                            const warehouse = warehouses.find(
                              (item) => item.id === stock.warehouseId
                            );

                            return (
                              <span
                                key={stock.warehouseId}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                              >
                                {warehouse?.name ?? "Depo"}:
                                <strong className="text-slate-900">
                                  {stock.quantity}
                                </strong>
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href="/stock-in"
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          <FiArrowDownCircle />
                          Stok gir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {shouldShowPagination && (
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">
              {visibleStartIndex}-{visibleEndIndex}
            </span>{" "}
            arası gösteriliyor. Toplam{" "}
            <span className="font-semibold text-slate-900">
              {filteredProducts.length}
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