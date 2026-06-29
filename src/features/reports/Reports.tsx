"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiBarChart2,
  FiBox,
  FiCheck,
  FiChevronDown,
  FiDollarSign,
  FiHome,
  FiLayers,
  FiPackage,
  FiRefreshCw,
  FiRepeat,
  FiTrendingDown,
} from "react-icons/fi";

import {
  getProductTotalStock,
  type Product,
} from "@/features/products/context/ProductContext";
import { useProducts } from "@/features/products/context/ProductContext";
import { useStockMovements } from "@/features/stock-movements/context/StockMovementContext";
import type { StockMovement } from "@/features/stock-movements/types/stockMovement";
import { useWarehouses } from "@/features/warehouses/context/WarehouseContext";

type ReportPeriod = "all" | "today" | "last7" | "last30";

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

type ReportCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  tone?: "default" | "dark" | "red" | "emerald" | "blue" | "amber";
};

const periodOptions: SelectOption[] = [
  {
    value: "all",
    label: "Tüm zamanlar",
    description: "Kayıtlı tüm stok hareketleri",
  },
  {
    value: "today",
    label: "Bugün",
    description: "Bugün oluşturulan hareketler",
  },
  {
    value: "last7",
    label: "Son 7 gün",
    description: "Son bir haftalık hareketler",
  },
  {
    value: "last30",
    label: "Son 30 gün",
    description: "Son bir aylık hareketler",
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

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMoneyTRY(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

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

function getPeriodLabel(period: ReportPeriod) {
  if (period === "today") {
    return "Bugün";
  }

  if (period === "last7") {
    return "Son 7 gün";
  }

  if (period === "last30") {
    return "Son 30 gün";
  }

  return "Tüm zamanlar";
}

function isMovementInPeriod(createdAt: string, period: ReportPeriod) {
  if (period === "all") {
    return true;
  }

  const movementDate = new Date(createdAt);

  if (Number.isNaN(movementDate.getTime())) {
    return false;
  }

  const now = new Date();
  const startDate = new Date(now);

  startDate.setHours(0, 0, 0, 0);

  if (period === "today") {
    return movementDate >= startDate;
  }

  if (period === "last7") {
    startDate.setDate(startDate.getDate() - 6);
    return movementDate >= startDate;
  }

  startDate.setDate(startDate.getDate() - 29);
  return movementDate >= startDate;
}

function getCriticalProducts(products: Product[]) {
  return products.filter((product) => {
    if (product.status === "Pasif") {
      return false;
    }

    return getProductTotalStock(product) <= product.minStock;
  });
}

function getMissingQuantity(product: Product) {
  const totalStock = getProductTotalStock(product);

  return Math.max(0, product.minStock - totalStock);
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

function ReportCard({
  title,
  value,
  description,
  icon,
  tone = "default",
}: ReportCardProps) {
  const toneClassMap = {
    default: {
      wrapper: "border-slate-200 bg-white",
      icon: "bg-slate-100 text-slate-700",
      value: "text-slate-900",
      description: "text-slate-500",
    },
    dark: {
      wrapper: "border-slate-900 bg-slate-900",
      icon: "bg-white/10 text-white",
      value: "text-white",
      description: "text-white/60",
    },
    red: {
      wrapper: "border-red-100 bg-red-50",
      icon: "bg-white text-red-700",
      value: "text-red-800",
      description: "text-red-500",
    },
    emerald: {
      wrapper: "border-emerald-100 bg-emerald-50",
      icon: "bg-white text-emerald-700",
      value: "text-emerald-800",
      description: "text-emerald-600",
    },
    blue: {
      wrapper: "border-blue-100 bg-blue-50",
      icon: "bg-white text-blue-700",
      value: "text-blue-800",
      description: "text-blue-600",
    },
    amber: {
      wrapper: "border-amber-100 bg-amber-50",
      icon: "bg-white text-amber-700",
      value: "text-amber-800",
      description: "text-amber-600",
    },
  };

  const classes = toneClassMap[tone];

  return (
    <div className={["rounded-3xl border px-5 py-4", classes.wrapper].join(" ")}>
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm",
            classes.icon,
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">{title}</p>

          <p
            className={[
              "mt-1 truncate text-xl font-semibold",
              classes.value,
            ].join(" ")}
          >
            {value}
          </p>

          <p
            className={[
              "mt-1 truncate text-xs",
              classes.description,
            ].join(" ")}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const { products } = useProducts();
  const { warehouses } = useWarehouses();
  const {
    movements,
    stockInMovements,
    stockOutMovements,
    transferMovements,
    totalStockInValueTRY,
  } = useStockMovements();

  const [period, setPeriod] = useState<ReportPeriod>("all");

  const activeProducts = useMemo(() => {
    return products.filter((product) => product.status !== "Pasif");
  }, [products]);

  const criticalProducts = useMemo(() => {
    return getCriticalProducts(products);
  }, [products]);

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => isMovementInPeriod(movement.createdAt, period));
  }, [movements, period]);

  const filteredStockInMovements = useMemo(() => {
    return filteredMovements.filter((movement) => movement.type === "stock-in");
  }, [filteredMovements]);

  const filteredStockOutMovements = useMemo(() => {
    return filteredMovements.filter((movement) => movement.type === "stock-out");
  }, [filteredMovements]);

  const filteredTransferMovements = useMemo(() => {
    return filteredMovements.filter((movement) => movement.type === "transfer");
  }, [filteredMovements]);

  const totalStockQuantity = useMemo(() => {
    return activeProducts.reduce(
      (total, product) => total + getProductTotalStock(product),
      0
    );
  }, [activeProducts]);

  const outOfStockCount = useMemo(() => {
    return activeProducts.filter((product) => getProductTotalStock(product) <= 0)
      .length;
  }, [activeProducts]);

  const totalMissingQuantity = useMemo(() => {
    return criticalProducts.reduce((total, product) => {
      return total + getMissingQuantity(product);
    }, 0);
  }, [criticalProducts]);

  const filteredStockInValueTRY = useMemo(() => {
    return filteredStockInMovements.reduce((total, movement) => {
      return total + (movement.totalPriceTRY ?? 0);
    }, 0);
  }, [filteredStockInMovements]);

  const filteredStockInQuantity = useMemo(() => {
    return filteredStockInMovements.reduce((total, movement) => {
      return total + movement.quantity;
    }, 0);
  }, [filteredStockInMovements]);

  const filteredStockOutQuantity = useMemo(() => {
    return filteredStockOutMovements.reduce((total, movement) => {
      return total + movement.quantity;
    }, 0);
  }, [filteredStockOutMovements]);

  const filteredTransferQuantity = useMemo(() => {
    return filteredTransferMovements.reduce((total, movement) => {
      return total + movement.quantity;
    }, 0);
  }, [filteredTransferMovements]);

  const categoryReports = useMemo(() => {
    const categoryMap = new Map<
      string,
      {
        category: string;
        productCount: number;
        totalStock: number;
        criticalCount: number;
        missingQuantity: number;
      }
    >();

    activeProducts.forEach((product) => {
      const current = categoryMap.get(product.category) ?? {
        category: product.category,
        productCount: 0,
        totalStock: 0,
        criticalCount: 0,
        missingQuantity: 0,
      };

      const totalStock = getProductTotalStock(product);
      const isCritical = totalStock <= product.minStock;

      categoryMap.set(product.category, {
        category: product.category,
        productCount: current.productCount + 1,
        totalStock: current.totalStock + totalStock,
        criticalCount: current.criticalCount + (isCritical ? 1 : 0),
        missingQuantity: current.missingQuantity + getMissingQuantity(product),
      });
    });

    return Array.from(categoryMap.values()).sort(
      (a, b) => b.criticalCount - a.criticalCount
    );
  }, [activeProducts]);

  const warehouseReports = useMemo(() => {
    return warehouses.map((warehouse) => {
      const warehouseProducts = activeProducts.filter((product) => {
        const warehouseStock = product.warehouseStocks.find(
          (item) => item.warehouseId === warehouse.id
        );

        return (warehouseStock?.quantity ?? 0) > 0;
      });

      const totalStock = activeProducts.reduce((total, product) => {
        const warehouseStock = product.warehouseStocks.find(
          (item) => item.warehouseId === warehouse.id
        );

        return total + (warehouseStock?.quantity ?? 0);
      }, 0);

      const criticalCount = criticalProducts.filter((product) => {
        const warehouseStock = product.warehouseStocks.find(
          (item) => item.warehouseId === warehouse.id
        );

        return typeof warehouseStock !== "undefined";
      }).length;

      return {
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        productCount: warehouseProducts.length,
        totalStock,
        criticalCount,
      };
    });
  }, [warehouses, activeProducts, criticalProducts]);

  const topCriticalProducts = useMemo(() => {
    return [...criticalProducts]
      .sort((a, b) => getMissingQuantity(b) - getMissingQuantity(a))
      .slice(0, 5);
  }, [criticalProducts]);

  const recentMovements = useMemo(() => {
    return filteredMovements.slice(0, 6);
  }, [filteredMovements]);

  const selectedPeriodLabel = getPeriodLabel(period);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <FiBarChart2 />
              Rapor merkezi
            </div>

            <h1 className="text-2xl font-semibold text-slate-900">Raporlar</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Ürün, depo, kritik stok ve stok hareketlerini tek ekranda özetle.
              Alış değeri, hareket yoğunluğu ve eksik stok miktarlarını takip et.
            </p>
          </div>

          <div className="w-full max-w-xs">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Rapor dönemi
            </label>

            <InlineSelect
              value={period}
              options={periodOptions}
              placeholder="Dönem seç"
              onChange={(value) => setPeriod(value as ReportPeriod)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard
          title="Toplam ürün"
          value={activeProducts.length}
          description="Aktif ürün sayısı"
          icon={<FiBox />}
        />

        <ReportCard
          title="Toplam stok"
          value={formatNumber(totalStockQuantity)}
          description="Tüm depolardaki miktar"
          icon={<FiPackage />}
          tone="blue"
        />

        <ReportCard
          title="Kritik ürün"
          value={criticalProducts.length}
          description={`${outOfStockCount} ürün tükenmiş`}
          icon={<FiAlertTriangle />}
          tone="red"
        />

        <ReportCard
          title="Toplam alış değeri"
          value={formatMoneyTRY(totalStockInValueTRY)}
          description="Tüm stok girişlerinin TL karşılığı"
          icon={<FiDollarSign />}
          tone="dark"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <FiActivity />
              Hareket özeti
            </div>

            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              {selectedPeriodLabel} hareket raporu
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Seçilen dönemdeki stok girişi, stok çıkışı ve transfer
              hareketleri.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPeriod("all")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FiRefreshCw />
            Tüm zamanlara dön
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ReportCard
            title="Hareket sayısı"
            value={filteredMovements.length}
            description={selectedPeriodLabel}
            icon={<FiActivity />}
          />

          <ReportCard
            title="Giriş hareketi"
            value={filteredStockInMovements.length}
            description={`Miktar: ${formatNumber(filteredStockInQuantity)}`}
            icon={<FiArrowDownLeft />}
            tone="emerald"
          />

          <ReportCard
            title="Çıkış hareketi"
            value={filteredStockOutMovements.length}
            description={`Miktar: ${formatNumber(filteredStockOutQuantity)}`}
            icon={<FiArrowUpRight />}
            tone="red"
          />

          <ReportCard
            title="Transfer"
            value={filteredTransferMovements.length}
            description={`Miktar: ${formatNumber(filteredTransferQuantity)}`}
            icon={<FiRepeat />}
            tone="blue"
          />
        </div>

        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Seçilen dönem alış değeri
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Dövizli girişler TL karşılığı üzerinden hesaplanır.
              </p>
            </div>

            <p className="text-2xl font-semibold text-slate-900">
              {formatMoneyTRY(filteredStockInValueTRY)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <FiLayers />
              Kategori raporu
            </div>

            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              Kategoriye göre stok durumu
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4 font-semibold">Kategori</th>
                  <th className="px-5 py-4 font-semibold">Ürün</th>
                  <th className="px-5 py-4 font-semibold">Stok</th>
                  <th className="px-5 py-4 font-semibold">Kritik</th>
                  <th className="px-5 py-4 font-semibold">Eksik</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {categoryReports.map((item) => (
                  <tr
                    key={item.category}
                    className="text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {item.category}
                      </p>
                    </td>

                    <td className="px-5 py-4">{item.productCount}</td>

                    <td className="px-5 py-4">{formatNumber(item.totalStock)}</td>

                    <td className="px-5 py-4">
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          item.criticalCount > 0
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700",
                        ].join(" ")}
                      >
                        {item.criticalCount}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900">
                        {formatNumber(item.missingQuantity)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <FiHome />
              Depo raporu
            </div>

            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              Depolara göre stok dağılımı
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4 font-semibold">Depo</th>
                  <th className="px-5 py-4 font-semibold">Ürün</th>
                  <th className="px-5 py-4 font-semibold">Toplam stok</th>
                  <th className="px-5 py-4 font-semibold">Kritik ürün</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {warehouseReports.map((item) => (
                  <tr
                    key={item.warehouseId}
                    className="text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {item.warehouseName}
                      </p>
                    </td>

                    <td className="px-5 py-4">{item.productCount}</td>

                    <td className="px-5 py-4">
                      {formatNumber(item.totalStock)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          item.criticalCount > 0
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700",
                        ].join(" ")}
                      >
                        {item.criticalCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              <FiTrendingDown />
              Kritik öncelik
            </div>

            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              En fazla tamamlanması gereken ürünler
            </h2>
          </div>

          {topCriticalProducts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <FiCheck />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Kritik ürün yok
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Minimum stok seviyesinin altında ürün bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topCriticalProducts.map((product) => {
                const totalStock = getProductTotalStock(product);
                const missingQuantity = getMissingQuantity(product);

                return (
                  <div
                    key={product.id}
                    className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {product.sku} • {product.category}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-right">
                      <div>
                        <p className="text-xs text-slate-400">Mevcut</p>
                        <p className="font-semibold text-slate-900">
                          {formatNumber(totalStock)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Minimum</p>
                        <p className="font-semibold text-slate-900">
                          {formatNumber(product.minStock)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-red-500">Eksik</p>
                        <p className="font-semibold text-red-700">
                          {formatNumber(missingQuantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <FiActivity />
              Son hareketler
            </div>

            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              {selectedPeriodLabel} son kayıtlar
            </h2>
          </div>

          {recentMovements.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <FiActivity />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Hareket kaydı yok
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Seçilen dönem için stok hareketi bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div
                      className={[
                        "inline-flex items-center gap-2 text-sm font-semibold",
                        getMovementTextClass(movement.type),
                      ].join(" ")}
                    >
                      {getMovementLabel(movement.type)}
                    </div>

                    <p className="mt-1 font-semibold text-slate-900">
                      {movement.productName}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {movement.productSku} • {formatDateTime(movement.createdAt)}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="font-semibold text-slate-900">
                      {formatNumber(movement.quantity)} {movement.productUnit}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {movement.type === "transfer" &&
                      movement.targetWarehouseName
                        ? `${movement.warehouseName} → ${movement.targetWarehouseName}`
                        : movement.warehouseName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}