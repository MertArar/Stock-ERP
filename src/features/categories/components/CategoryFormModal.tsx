"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import type {
  Category,
  CategoryStatus,
} from "@/features/categories/components/CategoryTable";

export type CategoryFormValues = {
  name: string;
  code: string;
  units: string[];
  description: string;
  status: CategoryStatus;
};

type CategoryFormModalProps = {
  isOpen: boolean;
  mode: "add" | "edit";
  category: Category | null;
  categories: Category[];
  onGenerateCode: (name: string, ignoredId?: string) => string;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
};

const initialFormValues: CategoryFormValues = {
  name: "",
  code: "",
  units: [],
  description: "",
  status: "Aktif",
};

function normalizeCode(value: string) {
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

function normalizeUnit(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export default function CategoryFormModal({
  isOpen,
  mode,
  category,
  categories,
  onGenerateCode,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [formValues, setFormValues] =
    useState<CategoryFormValues>(initialFormValues);
  const [unitInput, setUnitInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [unitError, setUnitError] = useState("");

  const suggestedCode = formValues.name.trim()
    ? onGenerateCode(formValues.name, category?.id)
    : "";

  useEffect(() => {
    if (!isOpen) return;

    setCodeError("");
    setUnitError("");
    setUnitInput("");

    if (mode === "edit" && category) {
      setFormValues({
        name: category.name,
        code: category.code,
        units: category.units,
        description: category.description,
        status: category.status,
      });

      return;
    }

    setFormValues(initialFormValues);
  }, [isOpen, mode, category]);

  if (!isOpen) return null;

  const title = mode === "add" ? "Kategori Ekle" : "Kategori Düzenle";
  const buttonText =
    mode === "add" ? "Kategoriyi Ekle" : "Değişiklikleri Kaydet";

  const handleChange = (
    field: keyof CategoryFormValues,
    value: string | string[] | CategoryStatus
  ) => {
    setCodeError("");
    setUnitError("");

    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddUnit = () => {
    const nextUnit = normalizeUnit(unitInput);

    if (!nextUnit) return;

    const isDuplicate = formValues.units.some(
      (unit) => unit.toLocaleLowerCase("tr-TR") === nextUnit.toLocaleLowerCase("tr-TR")
    );

    if (isDuplicate) {
      setUnitError("Bu birim zaten eklenmiş.");
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      units: [...prev.units, nextUnit],
    }));

    setUnitInput("");
    setUnitError("");
  };

  const handleRemoveUnit = (unit: string) => {
    setFormValues((prev) => ({
      ...prev,
      units: prev.units.filter((item) => item !== unit),
    }));
  };

  const handleUnitKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddUnit();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const finalCode = normalizeCode(formValues.code || suggestedCode);

    if (!formValues.name.trim()) {
      return;
    }

    if (!finalCode) {
      setCodeError("Kategori kodu oluşturulamadı.");
      return;
    }

    if (formValues.units.length === 0) {
      setUnitError("En az bir birim eklemelisin.");
      return;
    }

    const duplicateCode = categories.find(
      (item) =>
        item.id !== category?.id &&
        normalizeCode(item.code) === normalizeCode(finalCode)
    );

    if (duplicateCode) {
      setCodeError(
        `Bu kategori kodu ${duplicateCode.name} kategorisinde kullanılıyor.`
      );
      return;
    }

    onSubmit({
      name: formValues.name.trim(),
      code: finalCode,
      units: formValues.units,
      description: formValues.description.trim(),
      status: formValues.status,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              Kategoriye bağlı birimler ürün ekleme ekranında kullanılacak.
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
                Kategori Adı
              </span>
              <input
                value={formValues.name}
                onChange={(event) => handleChange("name", event.target.value)}
                type="text"
                placeholder="Örn. Mobilya"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Kategori Kodu
              </span>
              <input
                value={formValues.code}
                onChange={(event) => handleChange("code", event.target.value)}
                type="text"
                placeholder={suggestedCode || "Kategori kodu"}
                className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:bg-white ${
                  codeError
                    ? "border-rose-300 focus:border-rose-400"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />

              <p className="text-xs text-slate-500">
                Önerilen kod:{" "}
                <span className="font-semibold text-slate-700">
                  {suggestedCode || "Kategori adı girildiğinde oluşur"}
                </span>
              </p>

              {codeError && (
                <p className="text-xs font-medium text-rose-600">
                  {codeError}
                </p>
              )}
            </label>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Bağlı Birimler
            </span>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={unitInput}
                onChange={(event) => {
                  setUnitInput(event.target.value);
                  setUnitError("");
                }}
                onKeyDown={handleUnitKeyDown}
                type="text"
                placeholder="Adet, Kutu, Kg..."
                className="h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />

              <button
                type="button"
                onClick={handleAddUnit}
                className="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Birim Ekle
              </button>
            </div>

            {unitError && (
              <p className="text-xs font-medium text-rose-600">{unitError}</p>
            )}

            {formValues.units.length > 0 && (
              <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {formValues.units.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => handleRemoveUnit(unit)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    {unit}
                    <FiX size={14} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Açıklama
            </span>
            <textarea
              value={formValues.description}
              onChange={(event) =>
                handleChange("description", event.target.value)
              }
              rows={3}
              placeholder="Kategori açıklaması..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Durum</span>

            <div className="grid grid-cols-2 gap-3">
              {(["Aktif", "Pasif"] as CategoryStatus[]).map((status) => {
                const isSelected = formValues.status === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleChange("status", status)}
                    className={`flex h-11 items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition ${
                      isSelected
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                    }`}
                  >
                    {isSelected && <FiCheck size={16} />}
                    {status}
                  </button>
                );
              })}
            </div>
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