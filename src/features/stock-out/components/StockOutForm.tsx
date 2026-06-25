"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiCheck,
  FiChevronDown,
  FiInfo,
} from "react-icons/fi";

import type { StockOutReason } from "@/features/stock-movements/types/stockMovement";
import type { WarehouseStock } from "@/features/products/context/ProductContext";
import type { StockOutFormValues } from "../types/stockOut";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  currentStock: number;
  warehouseStocks: WarehouseStock[];
};

type WarehouseOption = {
  id: string;
  name: string;
};

type StockOutFormProps = {
  products: ProductOption[];
  warehouses: WarehouseOption[];
  onSubmit: (values: {
    productId: string;
    warehouseId: string;
    quantity: number;
    reason: StockOutReason;
    relatedName?: string;
    documentNo?: string;
    description?: string;
  }) => {
    success: boolean;
    message?: string;
  };
};

type SelectOption = {
  value: string;
  label: string;
  description?: string;
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

const initialValues: StockOutFormValues = {
  productId: "",
  warehouseId: "",
  quantity: "",
  reason: "",
  relatedName: "",
  documentNo: "",
  description: "",
};

const reasonOptions: SelectOption[] = [
  {
    value: "Satış",
    label: "Satış",
    description: "Müşteriye satış nedeniyle çıkış",
  },
  {
    value: "Üretimde Kullanım",
    label: "Üretimde Kullanım",
    description: "Üretim sürecinde kullanılacak ürün",
  },
  {
    value: "Fire",
    label: "Fire",
    description: "Hasarlı, eksik veya kullanılamaz ürün",
  },
  {
    value: "İade",
    label: "İade",
    description: "Tedarikçiye veya ilgili tarafa iade",
  },
  {
    value: "Sayım Düzeltmesi",
    label: "Sayım Düzeltmesi",
    description: "Fiziki sayım sonrası stok düzeltmesi",
  },
  {
    value: "Diğer",
    label: "Diğer",
    description: "Diğer stok çıkışı nedeni",
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

function parseNumber(value: string) {
  const normalized = value.replace(",", ".");
  const number = Number(normalized);

  return Number.isFinite(number) ? number : 0;
}

export default function StockOutForm({
  products,
  warehouses,
  onSubmit,
}: StockOutFormProps) {
  const [values, setValues] = useState<StockOutFormValues>(initialValues);
  const [error, setError] = useState("");

  const selectedProduct = products.find(
    (product) => product.id === values.productId
  );

  const selectedWarehouse = warehouses.find(
    (warehouse) => warehouse.id === values.warehouseId
  );

  const quantity = parseNumber(values.quantity);

  const availableStock =
    selectedProduct?.warehouseStocks.find(
      (item) => item.warehouseId === values.warehouseId
    )?.quantity ?? 0;

  const productOptions: SelectOption[] = useMemo(() => {
    return products.map((product) => ({
      value: product.id,
      label: `${product.sku} - ${product.name}`,
      description: `Toplam stok: ${product.currentStock} ${product.unit}`,
      disabled: product.currentStock <= 0,
    }));
  }, [products]);

  const warehouseOptions: SelectOption[] = useMemo(() => {
    if (!selectedProduct) {
      return warehouses.map((warehouse) => ({
        value: warehouse.id,
        label: warehouse.name,
        description: "Önce ürün seç",
        disabled: true,
      }));
    }

    return warehouses.map((warehouse) => {
      const warehouseStock =
        selectedProduct.warehouseStocks.find(
          (item) => item.warehouseId === warehouse.id
        )?.quantity ?? 0;

      return {
        value: warehouse.id,
        label: warehouse.name,
        description: `Mevcut stok: ${warehouseStock} ${selectedProduct.unit}`,
        disabled: warehouseStock <= 0,
      };
    });
  }, [warehouses, selectedProduct]);

  const canSubmit =
    values.productId.trim().length > 0 &&
    values.warehouseId.trim().length > 0 &&
    values.reason.trim().length > 0 &&
    quantity > 0 &&
    quantity <= availableStock;

  const updateValue = <K extends keyof StockOutFormValues>(
    key: K,
    value: StockOutFormValues[K]
  ) => {
    setError("");

    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleProductChange = (productId: string) => {
    setError("");

    setValues((prev) => ({
      ...prev,
      productId,
      warehouseId: "",
      quantity: "",
    }));
  };

  const handleWarehouseChange = (warehouseId: string) => {
    setError("");

    setValues((prev) => ({
      ...prev,
      warehouseId,
      quantity: "",
    }));
  };

  const handleSubmit = () => {
    if (!selectedProduct || !selectedWarehouse) {
      setError("Ürün ve depo seçmelisin.");
      return;
    }

    if (!values.reason) {
      setError("Çıkış nedeni seçmelisin.");
      return;
    }

    if (quantity <= 0) {
      setError("Çıkış miktarı sıfırdan büyük olmalı.");
      return;
    }

    if (availableStock <= 0) {
      setError("Seçilen depoda bu ürün için stok yok.");
      return;
    }

    if (quantity > availableStock) {
      setError(
        `Çıkış miktarı mevcut depo stoğundan fazla olamaz. Mevcut stok: ${availableStock} ${selectedProduct.unit}`
      );
      return;
    }

    const result = onSubmit({
      productId: values.productId,
      warehouseId: values.warehouseId,
      quantity,
      reason: values.reason,
      relatedName: values.relatedName,
      documentNo: values.documentNo,
      description: values.description,
    });

    if (!result.success) {
      setError(result.message ?? "Stok çıkışı kaydedilemedi.");
      return;
    }

    setValues(initialValues);
    setError("");
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-900">
          Yeni Stok Çıkışı
        </h2>

        <p className="text-sm text-slate-500">
          Ürün, depo ve çıkış nedenini seçerek stoktan düşüm yapabilirsin.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Ürün</label>

          <InlineSelect
            value={values.productId}
            options={productOptions}
            placeholder="Ürün seç"
            onChange={handleProductChange}
            helperText={
              selectedProduct
                ? `Toplam stok: ${selectedProduct.currentStock} ${selectedProduct.unit}`
                : undefined
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Depo</label>

          <InlineSelect
            value={values.warehouseId}
            options={warehouseOptions}
            placeholder="Depo seç"
            onChange={handleWarehouseChange}
            disabled={!selectedProduct}
            helperText={
              selectedProduct && selectedWarehouse
                ? `Bu depodaki stok: ${availableStock} ${selectedProduct.unit}`
                : undefined
            }
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 lg:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                <FiInfo />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Seçilen depo stoğu
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedProduct && selectedWarehouse
                    ? `${selectedWarehouse.name} deposunda ${availableStock} ${selectedProduct.unit} mevcut.`
                    : "Depo stoğunu görmek için ürün ve depo seç."}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white px-5 py-3 text-right shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Mevcut
              </p>

              <p className="mt-1 text-xl font-semibold text-slate-900">
                {selectedProduct && selectedWarehouse
                  ? `${availableStock} ${selectedProduct.unit}`
                  : "-"}
              </p>
            </div>
          </div>

          {selectedProduct && selectedWarehouse && availableStock <= 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <FiAlertTriangle />
              Bu depoda seçilen ürün için stok bulunmuyor.
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Çıkış miktarı
          </label>

          <input
            value={values.quantity}
            onChange={(event) => updateValue("quantity", event.target.value)}
            inputMode="decimal"
            placeholder="Örn. 5"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />

          {selectedProduct && selectedWarehouse && quantity > availableStock && (
            <p className="text-xs font-medium text-red-600">
              Mevcut depo stoğundan fazla çıkış yapılamaz.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Çıkış nedeni
          </label>

          <InlineSelect
            value={values.reason}
            options={reasonOptions}
            placeholder="Neden seç"
            onChange={(value) =>
              updateValue("reason", value as StockOutReason)
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Müşteri / Proje / İlgili taraf
          </label>

          <input
            value={values.relatedName}
            onChange={(event) =>
              updateValue("relatedName", event.target.value)
            }
            placeholder="Örn. ABC Projesi"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Belge / İşlem No
          </label>

          <input
            value={values.documentNo}
            onChange={(event) => updateValue("documentNo", event.target.value)}
            placeholder="Örn. CKS-2026-001"
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
            placeholder="Bu çıkışa ait kısa açıklama yazabilirsin."
            rows={4}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
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
          Stok çıkışını kaydet
        </button>
      </div>
    </div>
  );
}