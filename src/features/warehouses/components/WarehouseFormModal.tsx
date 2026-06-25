"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import type {
  Warehouse,
  WarehouseStatus,
} from "@/features/warehouses/context/WarehouseContext";

export type WarehouseFormValues = {
  name: string;
  code: string;
  location: string;
  responsible: string;
  description: string;
  status: WarehouseStatus;
};

type WarehouseFormModalProps = {
  isOpen: boolean;
  mode: "add" | "edit";
  warehouse: Warehouse | null;
  warehouses: Warehouse[];
  onGenerateCode: (name: string, ignoreId?: string) => string;
  onClose: () => void;
  onSubmit: (values: WarehouseFormValues) => void;
};

const initialFormValues: WarehouseFormValues = {
  name: "",
  code: "",
  location: "",
  responsible: "",
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

export default function WarehouseFormModal({
  isOpen,
  mode,
  warehouse,
  warehouses,
  onGenerateCode,
  onClose,
  onSubmit,
}: WarehouseFormModalProps) {
  const [formValues, setFormValues] =
    useState<WarehouseFormValues>(initialFormValues);
  const [codeError, setCodeError] = useState("");

  const suggestedCode = formValues.name
    ? onGenerateCode(formValues.name, warehouse?.id)
    : "";

  useEffect(() => {
    if (!isOpen) return;

    setCodeError("");

    if (mode === "edit" && warehouse) {
      setFormValues({
        name: warehouse.name,
        code: warehouse.code,
        location: warehouse.location,
        responsible: warehouse.responsible,
        description: warehouse.description,
        status: warehouse.status,
      });

      return;
    }

    setFormValues(initialFormValues);
  }, [isOpen, mode, warehouse]);

  if (!isOpen) return null;

  const title = mode === "add" ? "Depo Ekle" : "Depo Düzenle";
  const buttonText = mode === "add" ? "Depoyu Ekle" : "Değişiklikleri Kaydet";

  const handleChange = (
    field: keyof WarehouseFormValues,
    value: string | WarehouseStatus
  ) => {
    setCodeError("");

    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const finalCode = normalizeCode(formValues.code || suggestedCode);

    if (!formValues.name.trim()) {
      return;
    }

    if (!finalCode) {
      setCodeError("Depo kodu oluşturulamadı.");
      return;
    }

    const duplicateCode = warehouses.find(
      (item) =>
        item.id !== warehouse?.id &&
        normalizeCode(item.code) === normalizeCode(finalCode)
    );

    if (duplicateCode) {
      setCodeError(`Bu depo kodu ${duplicateCode.name} deposunda kullanılıyor.`);
      return;
    }

    onSubmit({
      name: formValues.name.trim(),
      code: finalCode,
      location: formValues.location.trim(),
      responsible: formValues.responsible.trim(),
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
              Depo kodunu manuel girebilir veya önerilen kodu kullanabilirsin.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Depo Adı
              </span>
              <input
                value={formValues.name}
                onChange={(event) => handleChange("name", event.target.value)}
                type="text"
                placeholder="Örn. Ana Depo"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Depo Kodu
              </span>
              <input
                value={formValues.code}
                onChange={(event) => handleChange("code", event.target.value)}
                type="text"
                placeholder={suggestedCode || "Depo kodu"}
                className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:bg-white ${
                  codeError
                    ? "border-rose-300 focus:border-rose-400"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />

              <p className="text-xs text-slate-500">
                Önerilen kod:{" "}
                <span className="font-semibold text-slate-700">
                  {suggestedCode || "Depo adı girildiğinde oluşur"}
                </span>
              </p>

              {codeError && (
                <p className="text-xs font-medium text-rose-600">
                  {codeError}
                </p>
              )}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Lokasyon
              </span>
              <input
                value={formValues.location}
                onChange={(event) =>
                  handleChange("location", event.target.value)
                }
                type="text"
                placeholder="Örn. Konya / Merkez"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Sorumlu
              </span>
              <input
                value={formValues.responsible}
                onChange={(event) =>
                  handleChange("responsible", event.target.value)
                }
                type="text"
                placeholder="Örn. Depo Sorumlusu"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>
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
              placeholder="Depo açıklaması..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Durum</span>

            <div className="grid grid-cols-2 gap-3">
              {(["Aktif", "Pasif"] as WarehouseStatus[]).map((status) => {
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