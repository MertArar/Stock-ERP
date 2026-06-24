"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { FiCheck, FiChevronDown, FiX } from "react-icons/fi";
import type { Product } from "@/features/products/components/ProductTable";

export type CategoryOption = {
  name: string;
  units: string[];
};

export type ProductFormValues = {
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
};

type ProductFormModalProps = {
  isOpen: boolean;
  mode: "add" | "edit";
  product: Product | null;
  products: Product[];
  categoryOptions: CategoryOption[];
  onGenerateSku: (
    category: string,
    name: string,
    ignoredProductId?: string
  ) => string;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
};

type FormDropdownProps = {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
};

function normalizeSkuInput(value: string) {
  return value
    .trim()
    .toLocaleUpperCase("tr-TR")
    .replaceAll("Ç", "C")
    .replaceAll("Ğ", "G")
    .replaceAll("İ", "I")
    .replaceAll("Ö", "O")
    .replaceAll("Ş", "S")
    .replaceAll("Ü", "U")
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function createInitialFormValues(
  categoryOptions: CategoryOption[]
): ProductFormValues {
  const firstCategory = categoryOptions[0];

  return {
    name: "",
    sku: "",
    category: firstCategory?.name ?? "",
    unit: firstCategory?.units[0] ?? "",
    currentStock: 0,
    minStock: 0,
  };
}

function FormDropdown({
  value,
  options,
  placeholder,
  onChange,
}: FormDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:bg-white focus:border-slate-400 focus:outline-none"
      >
        <span className="truncate">{value || placeholder}</span>
        <FiChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-14 z-[100] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-xl">
          {options.map((option) => {
            const isSelected = option === value;

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  isSelected
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <span className="truncate">{option}</span>
                {isSelected && <FiCheck size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductFormModal({
  isOpen,
  mode,
  product,
  products,
  categoryOptions,
  onGenerateSku,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const [formValues, setFormValues] = useState<ProductFormValues>(() =>
    createInitialFormValues(categoryOptions)
  );
  const [skuError, setSkuError] = useState("");

  const selectedCategory = categoryOptions.find(
    (category) => category.name === formValues.category
  );

  const unitOptions = selectedCategory?.units ?? [];

  const suggestedSku =
    formValues.name.trim() && formValues.category
      ? onGenerateSku(formValues.category, formValues.name, product?.id)
      : "";

  useEffect(() => {
    if (!isOpen) return;

    setSkuError("");

    if (mode === "edit" && product) {
      setFormValues({
        name: product.name,
        sku: product.sku,
        category: product.category,
        unit: product.unit,
        currentStock: product.currentStock,
        minStock: product.minStock,
      });

      return;
    }

    setFormValues(createInitialFormValues(categoryOptions));
  }, [isOpen, mode, product, categoryOptions]);

  if (!isOpen) return null;

  const title = mode === "add" ? "Ürün Ekle" : "Ürün Düzenle";
  const buttonText = mode === "add" ? "Ürünü Ekle" : "Değişiklikleri Kaydet";

  const handleChange = (
    field: keyof ProductFormValues,
    value: string | number
  ) => {
    setSkuError("");

    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryChange = (categoryName: string) => {
    const nextCategory = categoryOptions.find(
      (category) => category.name === categoryName
    );

    setSkuError("");

    setFormValues((prev) => ({
      ...prev,
      category: categoryName,
      unit: nextCategory?.units[0] ?? "",
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const finalSku = normalizeSkuInput(formValues.sku || suggestedSku);

    if (!formValues.name.trim() || !formValues.category || !formValues.unit) {
      return;
    }

    if (!finalSku) {
      setSkuError("Ürün kodu oluşturulamadı. Ürün adını kontrol et.");
      return;
    }

    const duplicateProduct = products.find(
      (item) =>
        item.id !== product?.id &&
        normalizeSkuInput(item.sku) === normalizeSkuInput(finalSku)
    );

    if (duplicateProduct) {
      setSkuError(
        `Bu ürün kodu ${duplicateProduct.name} ürününde kullanılıyor.`
      );
      return;
    }

    onSubmit({
      name: formValues.name.trim(),
      sku: finalSku,
      category: formValues.category,
      unit: formValues.unit,
      currentStock: Number(formValues.currentStock),
      minStock: Number(formValues.minStock),
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-visible rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              Kategori ve birim bilgileri tanımlı listelerden seçilir.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Modalı kapat"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Ürün Adı
              </span>
              <input
                value={formValues.name}
                onChange={(event) => handleChange("name", event.target.value)}
                type="text"
                placeholder="Örn. Ahşap Masa"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Kategori
              </span>
              <FormDropdown
                value={formValues.category}
                options={categoryOptions.map((category) => category.name)}
                placeholder="Kategori seç"
                onChange={handleCategoryChange}
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Birim</span>
              <FormDropdown
                value={formValues.unit}
                options={unitOptions}
                placeholder="Birim seç"
                onChange={(value) => handleChange("unit", value)}
              />
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Ürün Kodu
              </span>
              <input
                value={formValues.sku}
                onChange={(event) => handleChange("sku", event.target.value)}
                type="text"
                placeholder={suggestedSku || "Ürün kodu"}
                className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:bg-white ${
                  skuError
                    ? "border-rose-300 focus:border-rose-400"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />

              <p className="text-xs text-slate-500">
                Önerilen kod:{" "}
                <span className="font-semibold text-slate-700">
                  {suggestedSku || "Ürün adı girildiğinde oluşur"}
                </span>
              </p>

              {skuError && (
                <p className="text-xs font-medium text-rose-600">{skuError}</p>
              )}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Mevcut Stok
              </span>
              <input
                value={formValues.currentStock}
                onChange={(event) =>
                  handleChange("currentStock", Number(event.target.value))
                }
                type="number"
                min={0}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Minimum Stok
              </span>
              <input
                value={formValues.minStock}
                onChange={(event) =>
                  handleChange("minStock", Number(event.target.value))
                }
                type="number"
                min={0}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">
              Durum otomatik hesaplanır
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Mevcut stok minimum stok seviyesine eşit veya daha düşükse ürün
              kritik stok olarak görünür.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}