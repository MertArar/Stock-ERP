"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiCheck,
  FiChevronDown,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

import type { CurrencyCode } from "@/features/stock-movements/types/stockMovement";
import { useExchangeRates } from "../hooks/useExchangeRates";
import type { StockInFormValues } from "../types/stockIn";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  unit: string;
};

type WarehouseOption = {
  id: string;
  name: string;
};

type StockInFormProps = {
  products: ProductOption[];
  warehouses: WarehouseOption[];
  onSubmit: (values: {
    productId: string;
    warehouseId: string;
    quantity: number;
    unitPrice: number;
    currency: CurrencyCode;
    exchangeRate: number;
    supplierName?: string;
    invoiceNo?: string;
    description?: string;
  }) => void;
};

type SelectOption = {
  value: string;
  label: string;
  description?: string;
  prefix?: string;
  disabled?: boolean;
};

type InlineSelectProps = {
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  helperText?: string;
};

const initialValues: StockInFormValues = {
  productId: "",
  warehouseId: "",

  quantity: "",

  currency: "TRY",
  exchangeRate: "1",
  unitPrice: "",

  supplierName: "",
  invoiceNo: "",
  description: "",
};

const currencyOptions: SelectOption[] = [
  {
    value: "TRY",
    label: "TRY - Türk Lirası",
    description: "₺ ile alış",
    prefix: "₺",
  },
  {
    value: "USD",
    label: "USD - Amerikan Doları",
    description: "$ ile alış",
    prefix: "$",
  },
  {
    value: "EUR",
    label: "EUR - Euro",
    description: "€ ile alış",
    prefix: "€",
  },
  {
    value: "GBP",
    label: "GBP - İngiliz Sterlini",
    description: "£ ile alış",
    prefix: "£",
  },
];

function InlineSelect({
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
  helperText,
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
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={[
          "flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-left text-sm outline-none transition",
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-white focus:border-slate-400",
        ].join(" ")}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selectedOption?.prefix && (
            <span className="flex h-7 min-w-7 items-center justify-center rounded-xl bg-white px-2 text-xs font-bold text-slate-900 shadow-sm">
              {selectedOption.prefix}
            </span>
          )}

          <span className="min-w-0 truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <FiChevronDown
          className={[
            "shrink-0 text-slate-400 transition",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {helperText && <p className="mt-2 text-xs text-slate-500">{helperText}</p>}

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) {
                    return;
                  }

                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={[
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition",
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50",
                  option.disabled ? "cursor-not-allowed opacity-40" : "",
                ].join(" ")}
              >
                <span className="flex min-w-0 items-center gap-3">
                  {option.prefix && (
                    <span
                      className={[
                        "flex h-8 min-w-8 items-center justify-center rounded-xl px-2 text-xs font-bold",
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-800",
                      ].join(" ")}
                    >
                      {option.prefix}
                    </span>
                  )}

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

function parseNumber(value: string) {
  const normalized = value.replace(",", ".");
  const number = Number(normalized);

  return Number.isFinite(number) ? number : 0;
}

function formatRateInput(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return value.toFixed(4).replace(".", ",");
}

function formatMoney(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatTRYRate(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "Kur alınamadı";
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

function formatDateTime(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default function StockInForm({
  products,
  warehouses,
  onSubmit,
}: StockInFormProps) {
  const [values, setValues] = useState<StockInFormValues>(initialValues);
  const [error, setError] = useState("");
  const [rateInputTouched, setRateInputTouched] = useState(false);
  const [manualRateConfirmed, setManualRateConfirmed] = useState(false);

  const {
    rates,
    source,
    sourceDate,
    updatedAt,
    isLoading,
    errorMessage,
    refetch,
  } = useExchangeRates();

  const selectedProduct = products.find(
    (product) => product.id === values.productId
  );

  const selectedWarehouse = warehouses.find(
    (warehouse) => warehouse.id === values.warehouseId
  );

  const selectedCurrencyRate = rates[values.currency];

  const selectedCurrencySymbol =
    selectedCurrencyRate?.symbol ??
    currencyOptions.find((item) => item.value === values.currency)?.prefix ??
    "";

  const liveExchangeRate =
    values.currency === "TRY" ? 1 : selectedCurrencyRate?.rateToTRY ?? 0;

  const hasLiveExchangeRate =
    values.currency === "TRY" || liveExchangeRate > 0;

  const quantity = parseNumber(values.quantity);
  const unitPrice = parseNumber(values.unitPrice);
  const exchangeRate =
    values.currency === "TRY" ? 1 : parseNumber(values.exchangeRate);

  const totalPrice = quantity * unitPrice;
  const totalPriceTRY =
    values.currency === "TRY" ? totalPrice : totalPrice * exchangeRate;

  const hasManualExchangeRate =
    values.currency !== "TRY" &&
    liveExchangeRate > 0 &&
    exchangeRate > 0 &&
    Math.abs(exchangeRate - liveExchangeRate) > 0.0001;

  const productOptions: SelectOption[] = useMemo(() => {
    return products.map((product) => ({
      value: product.id,
      label: `${product.sku} - ${product.name}`,
      description: `Birim: ${product.unit}`,
    }));
  }, [products]);

  const warehouseOptions: SelectOption[] = useMemo(() => {
    return warehouses.map((warehouse) => ({
      value: warehouse.id,
      label: warehouse.name,
      description: "Stok girişi yapılacak depo",
    }));
  }, [warehouses]);

  const canSubmit = useMemo(() => {
    return (
      values.productId.trim().length > 0 &&
      values.warehouseId.trim().length > 0 &&
      quantity > 0 &&
      unitPrice > 0 &&
      exchangeRate > 0 &&
      (!hasManualExchangeRate || manualRateConfirmed)
    );
  }, [
    values.productId,
    values.warehouseId,
    quantity,
    unitPrice,
    exchangeRate,
    hasManualExchangeRate,
    manualRateConfirmed,
  ]);

  useEffect(() => {
    if (values.currency === "TRY") {
      setValues((prev) => ({
        ...prev,
        exchangeRate: "1",
      }));

      setRateInputTouched(false);
      setManualRateConfirmed(false);
      return;
    }

    if (!rateInputTouched && liveExchangeRate > 0) {
      setValues((prev) => ({
        ...prev,
        exchangeRate: formatRateInput(liveExchangeRate),
      }));
    }
  }, [values.currency, liveExchangeRate, rateInputTouched]);

  const updateValue = <K extends keyof StockInFormValues>(
    key: K,
    value: StockInFormValues[K]
  ) => {
    setError("");

    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCurrencyChange = (currency: CurrencyCode) => {
    const liveRate = currency === "TRY" ? 1 : rates[currency]?.rateToTRY ?? 0;

    setError("");
    setRateInputTouched(false);
    setManualRateConfirmed(false);

    setValues((prev) => ({
      ...prev,
      currency,
      exchangeRate: currency === "TRY" ? "1" : formatRateInput(liveRate),
      unitPrice: "",
    }));
  };

  const handleExchangeRateChange = (value: string) => {
    setError("");
    setRateInputTouched(true);
    setManualRateConfirmed(false);

    setValues((prev) => ({
      ...prev,
      exchangeRate: value,
    }));
  };

  const useLiveExchangeRate = () => {
    if (liveExchangeRate <= 0) {
      return;
    }

    setValues((prev) => ({
      ...prev,
      exchangeRate: formatRateInput(liveExchangeRate),
    }));

    setRateInputTouched(false);
    setManualRateConfirmed(false);
    setError("");
  };

  const handleSubmit = () => {
    if (hasManualExchangeRate && !manualRateConfirmed) {
      setError(
        "Güncel kurdan farklı bir kur girdin. Özel kurla devam etmek için önce onay vermelisin."
      );
      return;
    }

    if (!canSubmit) {
      setError(
        "Döviz, kur, ürün, depo, miktar ve birim fiyat bilgilerini kontrol et."
      );
      return;
    }

    onSubmit({
      productId: values.productId,
      warehouseId: values.warehouseId,
      quantity,
      unitPrice,
      currency: values.currency,
      exchangeRate,
      supplierName: values.supplierName,
      invoiceNo: values.invoiceNo,
      description: values.description,
    });

    setValues(initialValues);
    setRateInputTouched(false);
    setManualRateConfirmed(false);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-900">
          Yeni Stok Girişi
        </h2>

        <p className="text-sm text-slate-500">
          Önce döviz ve kur bilgisini seç, ardından ürünün birim alış fiyatını
          gir. Toplam ve TL karşılığı anlık hesaplanır.
        </p>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              <FiShield />
              Kur bilgisi
            </div>

            <h3 className="mt-3 text-lg font-semibold text-slate-900">
              Döviz ve kur seçimi
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Seçilen dövizin 1 birimlik TL karşılığı burada gösterilir.
            </p>
          </div>

          <button
            type="button"
            onClick={refetch}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
            Kuru yenile
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Döviz</label>

            <InlineSelect
              value={values.currency}
              options={currencyOptions}
              placeholder="Döviz seç"
              onChange={(value) => handleCurrencyChange(value as CurrencyCode)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Güncel TL karşılığı
            </label>

            <div className="flex min-h-12 items-center rounded-2xl border border-slate-200 bg-white px-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedCurrencySymbol} 1 {values.currency} ={" "}
                  {hasLiveExchangeRate
                    ? formatTRYRate(liveExchangeRate)
                    : "Kur alınamadı"}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {source ? `${source} kuru` : "Kur kaynağı yükleniyor"}
                  {sourceDate ? ` · ${sourceDate}` : ""}
                  {updatedAt ? ` · ${formatDateTime(updatedAt)}` : ""}
                </p>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs font-medium text-red-600">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Kullanılacak kur
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                ₺
              </span>

              <input
                value={values.exchangeRate}
                onChange={(event) =>
                  handleExchangeRateChange(event.target.value)
                }
                inputMode="decimal"
                disabled={values.currency === "TRY"}
                placeholder="Örn. 32,5000"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>

            <p className="text-xs text-slate-500">
              TRY seçildiğinde kur otomatik olarak 1 alınır.
            </p>
          </div>
        </div>

        {hasManualExchangeRate && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <FiAlertTriangle />
                </div>

                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Güncel kurdan farklı bir kur girdin.
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Güncel kur:{" "}
                    <span className="font-semibold">
                      {formatTRYRate(liveExchangeRate)}
                    </span>
                    . Senin girdiğin kur:{" "}
                    <span className="font-semibold">
                      {formatTRYRate(exchangeRate)}
                    </span>
                    . Özel kurla devam edeceksen onay vermelisin.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={useLiveExchangeRate}
                  className="h-10 rounded-xl border border-amber-200 bg-white px-4 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                >
                  Güncel kuru kullan
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setManualRateConfirmed(true);
                    setError("");
                  }}
                  className={[
                    "h-10 rounded-xl px-4 text-sm font-semibold transition",
                    manualRateConfirmed
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-900 text-white hover:bg-amber-800",
                  ].join(" ")}
                >
                  {manualRateConfirmed
                    ? "Özel kur onaylandı"
                    : "Özel kurla devam et"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Ürün</label>

          <InlineSelect
            value={values.productId}
            options={productOptions}
            placeholder="Ürün seç"
            onChange={(value) => updateValue("productId", value)}
            helperText={
              selectedProduct ? `Birim: ${selectedProduct.unit}` : undefined
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Depo</label>

          <InlineSelect
            value={values.warehouseId}
            options={warehouseOptions}
            placeholder="Depo seç"
            onChange={(value) => updateValue("warehouseId", value)}
            helperText={
              selectedWarehouse
                ? `Giriş yapılacak depo: ${selectedWarehouse.name}`
                : undefined
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Miktar</label>

          <input
            value={values.quantity}
            onChange={(event) => updateValue("quantity", event.target.value)}
            inputMode="decimal"
            placeholder="Örn. 25"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Birim fiyat
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
              {selectedCurrencySymbol}
            </span>

            <input
              value={values.unitPrice}
              onChange={(event) => updateValue("unitPrice", event.target.value)}
              inputMode="decimal"
              placeholder={`Örn. ${selectedCurrencySymbol} 120`}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />
          </div>

          <p className="text-xs text-slate-500">
            Birim fiyat seçili döviz cinsinden girilir.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Tedarikçi
          </label>

          <input
            value={values.supplierName}
            onChange={(event) =>
              updateValue("supplierName", event.target.value)
            }
            placeholder="Örn. ABC Tedarik"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Fatura / İrsaliye No
          </label>

          <input
            value={values.invoiceNo}
            onChange={(event) => updateValue("invoiceNo", event.target.value)}
            placeholder="Örn. FTR-2026-001"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <label className="text-sm font-medium text-slate-700">Not</label>

          <textarea
            value={values.description}
            onChange={(event) =>
              updateValue("description", event.target.value)
            }
            placeholder="Bu girişe ait kısa açıklama yazabilirsin."
            rows={4}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Ara toplam
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatMoney(totalPrice, values.currency)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              TL karşılığı
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatMoney(totalPriceTRY, "TRY")}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Hesap
            </p>

            <p className="mt-1 text-sm font-medium text-slate-700">
              {quantity || 0} × {formatMoney(unitPrice || 0, values.currency)} ·{" "}
              {values.currency === "TRY"
                ? "Kur: 1"
                : `Kur: ${formatTRYRate(exchangeRate || 0)}`}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <FiCheck />
          Stok girişini kaydet
        </button>
      </div>
    </div>
  );
}