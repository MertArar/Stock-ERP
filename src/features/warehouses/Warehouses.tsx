"use client";

import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";
import {
  useWarehouses,
  type Warehouse,
} from "@/features/warehouses/context/WarehouseContext";
import WarehouseTable from "@/features/warehouses/components/WarehouseTable";
import WarehouseFormModal, {
  type WarehouseFormValues,
} from "@/features/warehouses/components/WarehouseFormModal";
import WarehouseDeleteAlert from "@/features/warehouses/components/WarehouseDeleteAlert";
import WarehouseToast, {
  type WarehouseToastState,
} from "@/features/warehouses/components/WarehouseToast";

type ModalState = {
  isOpen: boolean;
  mode: "add" | "edit";
  warehouse: Warehouse | null;
};

type DeleteState = {
  warehouse: Warehouse;
  countdown: number;
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

function createWarehouseCode(name: string, warehouses: Warehouse[], ignoreId?: string) {
  const baseName = normalizeCode(name).replaceAll("-", "").slice(0, 4) || "DEPO";
  const baseCode = `DEP-${baseName}`;

  const isUsed = warehouses.some(
    (warehouse) => warehouse.id !== ignoreId && warehouse.code === baseCode
  );

  if (!isUsed) {
    return baseCode;
  }

  let counter = 2;
  let nextCode = `${baseCode}-${counter}`;

  while (
    warehouses.some(
      (warehouse) => warehouse.id !== ignoreId && warehouse.code === nextCode
    )
  ) {
    counter += 1;
    nextCode = `${baseCode}-${counter}`;
  }

  return nextCode;
}

export default function Warehouses() {
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } =
    useWarehouses();

  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: "add",
    warehouse: null,
  });
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [toast, setToast] = useState<WarehouseToastState | null>(null);

  const filteredWarehouses = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return warehouses
      .filter((warehouse) => {
        return (
          warehouse.name.toLowerCase().includes(searchValue) ||
          warehouse.code.toLowerCase().includes(searchValue) ||
          warehouse.location.toLowerCase().includes(searchValue) ||
          warehouse.responsible.toLowerCase().includes(searchValue)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [warehouses, search]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  useEffect(() => {
    if (!deleteState) return;

    if (deleteState.countdown <= 0) {
      deleteWarehouse(deleteState.warehouse.id);

      setToast({
        type: "delete",
        title: "Depo silindi",
        message: `${deleteState.warehouse.name} listeden kaldırıldı.`,
      });

      setDeleteState(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setDeleteState((prev) =>
        prev ? { ...prev, countdown: prev.countdown - 1 } : prev
      );
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [deleteState, deleteWarehouse]);

  const handleOpenAddModal = () => {
    setModalState({
      isOpen: true,
      mode: "add",
      warehouse: null,
    });
  };

  const handleOpenEditModal = (warehouse: Warehouse) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      warehouse,
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: "add",
      warehouse: null,
    });
  };

  const handleGenerateCode = (name: string, ignoreId?: string) => {
    return createWarehouseCode(name, warehouses, ignoreId);
  };

  const handleSubmitWarehouse = (values: WarehouseFormValues) => {
    if (modalState.mode === "add") {
      const newWarehouse: Warehouse = {
        id: crypto.randomUUID(),
        name: values.name,
        code: values.code,
        location: values.location,
        responsible: values.responsible,
        description: values.description,
        status: values.status,
      };

      addWarehouse(newWarehouse);

      setToast({
        type: "success",
        title: "Depo eklendi",
        message: `${newWarehouse.name} başarıyla eklendi.`,
      });
    }

    if (modalState.mode === "edit" && modalState.warehouse) {
      updateWarehouse(modalState.warehouse.id, {
        name: values.name,
        code: values.code,
        location: values.location,
        responsible: values.responsible,
        description: values.description,
        status: values.status,
      });

      setToast({
        type: "info",
        title: "Depo düzenlendi",
        message: `${values.name} bilgileri güncellendi.`,
      });
    }

    handleCloseModal();
  };

  const handleRequestDelete = (warehouse: Warehouse) => {
    setDeleteState({
      warehouse,
      countdown: 10,
    });
  };

  const handleUndoDelete = () => {
    setDeleteState(null);

    setToast({
      type: "info",
      title: "Silme işlemi geri alındı",
      message: "Depo listede kalmaya devam ediyor.",
    });
  };

  const handleForceDelete = () => {
    if (!deleteState) return;

    deleteWarehouse(deleteState.warehouse.id);

    setToast({
      type: "delete",
      title: "Depo silindi",
      message: `${deleteState.warehouse.name} hızlı şekilde kaldırıldı.`,
    });

    setDeleteState(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Depolar</h2>
            <p className="mt-1 text-sm text-slate-500">
              Depo alanlarını, kodlarını, lokasyonlarını ve sorumlu kişileri
              buradan yönetebilirsin.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <FiPlus size={18} />
            Depo Ekle
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-slate-400 focus-within:bg-white">
            <FiSearch className="shrink-0 text-slate-400" size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="text"
              placeholder="Depo adı, kodu, lokasyon veya sorumlu ara..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Aramayı temizle"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>

        <WarehouseTable
          warehouses={filteredWarehouses}
          deletingWarehouseId={deleteState?.warehouse.id ?? null}
          onEditWarehouse={handleOpenEditModal}
          onDeleteWarehouse={handleRequestDelete}
        />
      </div>

      <WarehouseFormModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        warehouse={modalState.warehouse}
        warehouses={warehouses}
        onGenerateCode={handleGenerateCode}
        onClose={handleCloseModal}
        onSubmit={handleSubmitWarehouse}
      />

      <WarehouseDeleteAlert
        deleteState={deleteState}
        onUndo={handleUndoDelete}
        onForceDelete={handleForceDelete}
      />

      <WarehouseToast toast={toast} />
    </>
  );
}