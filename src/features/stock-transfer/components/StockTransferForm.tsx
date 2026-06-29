"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiCheck,
  FiChevronDown,
  FiInfo,
} from "react-icons/fi";

import type { WarehouseStock } from "@/features/products/context/ProductContext";
import type { StockTransferFormValues } from "../types/stockTransfer";

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

type StockTransferFormProps = {
  products: ProductOption[];
  warehouses: WarehouseOption[];
  onSubmit: (values: {
    productId: string;
    sourceWarehouseId: string;
    targetWarehouseId: string;
    quantity: number;
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

const initialValues: StockTransferFormValues = {
  productId: "",
  sourceWarehouseId: "",
  targetWarehouseId: "",
  quantity: "",
  documentNo: "",
  description: "",
};

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

export default function StockTransferForm({
  products,
  warehouses,
  onSubmit,
}: StockTransferFormProps) {
  const [values, setValues] = useState<StockTransferFormValues>(initialValues);
  const [error, setError] = useState("");

  const selectedProduct = products.find(
    (product) => product.id === values.productId
  );

  const sourceWarehouse = warehouses.find(
    (warehouse) => warehouse.id === values.sourceWarehouseId
  );

  const targetWarehouse = warehouses.find(
    (warehouse) => warehouse.id === values.targetWarehouseId
  );

  const quantity = parseNumber(values.quantity);

  const sourceAvailableStock =
    selectedProduct?.warehouseStocks.find(
      (item) => item.warehouseId === values.sourceWarehouseId
    )?.quantity ?? 0;

  const targetCurrentStock =
    selectedProduct?.warehouseStocks.find(
      (item) => item.warehouseId === values.targetWarehouseId
    )?.quantity ?? 0;

  const productOptions: SelectOption[] = useMemo(() => {
    return products.map((product) => ({
      value: product.id,
      label: `${product.sku} - ${product.name}`,
      description: `Toplam stok: ${product.currentStock} ${product.unit}`,
      disabled: product.currentStock <= 0,
    }));
  }, [products]);

  const sourceWarehouseOptions: SelectOption[] = useMemo(() => {
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

  const targetWarehouseOptions: SelectOption[] = useMemo(() => {
    if (!selectedProduct || !values.sourceWarehouseId) {
      return warehouses.map((warehouse) => ({
        value: warehouse.id,
        label: warehouse.name,
        description: "Önce kaynak depo seç",
        disabled: true,
      }));
    }

    return warehouses.map((warehouse) => {
      const warehouseStock =
        selectedProduct.warehouseStocks.find(
          (item) => item.warehouseId === warehouse.id
        )?.quantity ?? 0;

      const isSourceWarehouse = warehouse.id === values.sourceWarehouseId;

      return {
        value: warehouse.id,
        label: warehouse.name,
        description: isSourceWarehouse
          ? "Kaynak depo hedef olarak seçilemez"
          : `Mevcut stok: ${warehouseStock} ${selectedProduct.unit}`,
        disabled: isSourceWarehouse,
      };
    });
  }, [warehouses, selectedProduct, values.sourceWarehouseId]);

  const canSubmit =
    values.productId.trim().length > 0 &&
    values.sourceWarehouseId.trim().length > 0 &&
    values.targetWarehouseId.trim().length > 0 &&
    values.sourceWarehouseId !== values.targetWarehouseId &&
    quantity > 0 &&
    quantity <= sourceAvailableStock;

  const updateValue = <K extends keyof StockTransferFormValues>(
    key: K,
    value: StockTransferFormValues[K]
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
      sourceWarehouseId: "",
      targetWarehouseId: "",
      quantity: "",
    }));
  };

  const handleSourceWarehouseChange = (warehouseId: string) => {
    setError("");

    setValues((prev) => ({
      ...prev,
      sourceWarehouseId: warehouseId,
      targetWarehouseId:
        prev.targetWarehouseId === warehouseId ? "" : prev.targetWarehouseId,
      quantity: "",
    }));
  };

  const handleSubmit = () => {
    if (!selectedProduct || !sourceWarehouse || !targetWarehouse) {
      setError("Ürün, kaynak depo ve hedef depo seçmelisin.");
      return;
    }

    if (values.sourceWarehouseId === values.targetWarehouseId) {
      setError("Kaynak depo ile hedef depo aynı olamaz.");
      return;
    }

    if (quantity <= 0) {
      setError("Transfer miktarı sıfırdan büyük olmalı.");
      return;
    }

    if (sourceAvailableStock <= 0) {
      setError("Kaynak depoda bu ürün için stok yok.");
      return;
    }

    if (quantity > sourceAvailableStock) {
      setError(
        `Transfer miktarı kaynak depo stoğundan fazla olamaz. Mevcut stok: ${sourceAvailableStock} ${selectedProduct.unit}`
      );
      return;
    }

    const result = onSubmit({
      productId: values.productId,
      sourceWarehouseId: values.sourceWarehouseId,
      targetWarehouseId: values.targetWarehouseId,
      quantity,
      documentNo: values.documentNo,
      description: values.description,
    });

    if (!result.success) {
      setError(result.message ?? "Transfer kaydedilemedi.");
      return;
    }

    setValues(initialValues);
    setError("");
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-900">
          Yeni Depo Transferi
        </h2>

        <p className="text-sm text-slate-500">
          Ürünü kaynak depodan düşüp hedef depoya aktarabilirsin.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2 lg:col-span-2">
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
          <label className="text-sm font-medium text-slate-700">
            Kaynak depo
          </label>

          <InlineSelect
            value={values.sourceWarehouseId}
            options={sourceWarehouseOptions}
            placeholder="Kaynak depo seç"
            onChange={handleSourceWarehouseChange}
            disabled={!selectedProduct}
            helperText={
              selectedProduct && sourceWarehouse
                ? `Kaynak depodaki stok: ${sourceAvailableStock} ${selectedProduct.unit}`
                : undefined
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Hedef depo
          </label>

          <InlineSelect
            value={values.targetWarehouseId}
            options={targetWarehouseOptions}
            placeholder="Hedef depo seç"
            onChange={(value) => updateValue("targetWarehouseId", value)}
            disabled={!selectedProduct || !values.sourceWarehouseId}
            helperText={
              selectedProduct && targetWarehouse
                ? `Hedef depodaki mevcut stok: ${targetCurrentStock} ${selectedProduct.unit}`
                : undefined
            }
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 lg:col-span-2">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                <FiInfo />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Transfer özeti
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedProduct && sourceWarehouse && targetWarehouse
                    ? `${selectedProduct.name} ürünü ${sourceWarehouse.name} deposundan ${targetWarehouse.name} deposuna aktarılacak.`
                    : "Transfer özetini görmek için ürün, kaynak depo ve hedef depo seç."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm">
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Kaynak stok
                </p>

                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {selectedProduct && sourceWarehouse
                    ? `${sourceAvailableStock} ${selectedProduct.unit}`
                    : "-"}
                </p>
              </div>

              <FiArrowRight className="text-slate-300" />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Hedef stok
                </p>

                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {selectedProduct && targetWarehouse
                    ? `${targetCurrentStock} ${selectedProduct.unit}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {selectedProduct && sourceWarehouse && sourceAvailableStock <= 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <FiAlertTriangle />
              Kaynak depoda seçilen ürün için stok bulunmuyor.
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Transfer miktarı
          </label>

          <input
            value={values.quantity}
            onChange={(event) => updateValue("quantity", event.target.value)}
            inputMode="decimal"
            placeholder="Örn. 5"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />

          {selectedProduct &&
            sourceWarehouse &&
            quantity > sourceAvailableStock && (
              <p className="text-xs font-medium text-red-600">
                Kaynak depo stoğundan fazla transfer yapılamaz.
              </p>
            )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Belge / İşlem No
          </label>

          <input
            value={values.documentNo}
            onChange={(event) => updateValue("documentNo", event.target.value)}
            placeholder="Örn. TRF-2026-001"
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
            placeholder="Bu transfere ait kısa açıklama yazabilirsin."
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
          Transferi kaydet
        </button>
      </div>
    </div>
  );
}