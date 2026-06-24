"use client";

import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";
import {
  useCategories,
  type Category,
} from "@/features/categories/context/CategoryContext";
import { useProducts } from "@/features/products/context/ProductContext";
import CategoryTable from "@/features/categories/components/CategoryTable";
import CategoryFormModal, {
  type CategoryFormValues,
} from "@/features/categories/components/CategoryFormModal";
import CategoryDeleteAlert, {
  type CategoryDeleteMode,
} from "@/features/categories/components/CategoryDeleteAlert";
import CategoryDeleteDecisionModal from "@/features/categories/components/CategoryDeleteDecisionModal";
import CategoryToast, {
  type CategoryToastState,
} from "@/features/categories/components/CategoryToast";

type ModalState =
  | {
      isOpen: false;
      mode: "add";
      category: null;
    }
  | {
      isOpen: true;
      mode: "add" | "edit";
      category: Category | null;
    };

type DecisionState = {
  category: Category;
  productCount: number;
};

type DeleteState = {
  category: Category;
  countdown: number;
  mode: CategoryDeleteMode;
  productCount: number;
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

function createCategoryCode(
  name: string,
  categories: Category[],
  ignoredId?: string
) {
  const baseCode =
    normalizeCode(name).replaceAll("-", "").slice(0, 3).padEnd(3, "X") ||
    "KAT";

  const isUsed = categories.some(
    (category) => category.id !== ignoredId && category.code === baseCode
  );

  if (!isUsed) {
    return baseCode;
  }

  let counter = 2;
  let nextCode = `${baseCode}-${counter}`;

  while (
    categories.some(
      (category) => category.id !== ignoredId && category.code === nextCode
    )
  ) {
    counter += 1;
    nextCode = `${baseCode}-${counter}`;
  }

  return nextCode;
}

export default function Categories() {
  const { categories, activeCategories, addCategory, updateCategory, removeCategory } =
    useCategories();

  const {
    products,
    removeProductsByCategory,
    moveProductsToCategory,
  } = useProducts();

  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: "add",
    category: null,
  });
  const [decisionState, setDecisionState] = useState<DecisionState | null>(null);
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [toast, setToast] = useState<CategoryToastState | null>(null);

  const filteredCategories = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return categories
      .filter((category) => {
        return (
          category.name.toLowerCase().includes(searchValue) ||
          category.code.toLowerCase().includes(searchValue) ||
          category.units.some((unit) =>
            unit.toLowerCase().includes(searchValue)
          )
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [categories, search]);

  const decisionTargetCategories = useMemo(() => {
    if (!decisionState) return [];

    return activeCategories.filter(
      (category) => category.id !== decisionState.category.id
    );
  }, [activeCategories, decisionState]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  useEffect(() => {
    if (!deleteState) return;

    if (deleteState.countdown <= 0) {
      const deletedCategory = deleteState.category;

      if (deleteState.mode === "category-with-products") {
        removeProductsByCategory(deletedCategory.name);
      }

      removeCategory(deletedCategory.id);
      setDeleteState(null);

      setToast({
        type: "delete",
        title:
          deleteState.mode === "category-with-products"
            ? "Kategori ve ürünler silindi"
            : "Kategori silindi",
        message:
          deleteState.mode === "category-with-products"
            ? `${deletedCategory.name} kategorisi ve bağlı ${deleteState.productCount} ürün kaldırıldı.`
            : `${deletedCategory.name} kategorisi listeden kaldırıldı.`,
      });

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
  }, [deleteState, removeCategory, removeProductsByCategory]);

  const getCategoryProductCount = (categoryName: string) => {
    return products.filter((product) => product.category === categoryName).length;
  };

  const handleOpenAddModal = () => {
    setModalState({
      isOpen: true,
      mode: "add",
      category: null,
    });
  };

  const handleOpenEditModal = (category: Category) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      category,
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: "add",
      category: null,
    });
  };

  const handleGenerateCode = (name: string, ignoredId?: string) => {
    return createCategoryCode(name, categories, ignoredId);
  };

  const handleSubmitCategory = (values: CategoryFormValues) => {
    if (modalState.mode === "add") {
      const newCategory: Category = {
        id: crypto.randomUUID(),
        name: values.name,
        code: values.code,
        units: values.units,
        description: values.description,
        status: values.status,
      };

      addCategory(newCategory);

      setToast({
        type: "success",
        title: "Kategori eklendi",
        message: `${newCategory.name} kategorisi başarıyla eklendi.`,
      });
    }

    if (modalState.mode === "edit" && modalState.category) {
      updateCategory(modalState.category.id, {
        name: values.name,
        code: values.code,
        units: values.units,
        description: values.description,
        status: values.status,
      });

      setToast({
        type: "info",
        title: "Kategori düzenlendi",
        message: `${values.name} bilgileri güncellendi.`,
      });
    }

    handleCloseModal();
  };

  const handleRequestDelete = (category: Category) => {
    const productCount = getCategoryProductCount(category.name);

    if (productCount > 0) {
      setDecisionState({
        category,
        productCount,
      });

      return;
    }

    setDeleteState({
      category,
      countdown: 10,
      mode: "category-only",
      productCount: 0,
    });
  };

  const handleDeactivateCategory = () => {
    if (!decisionState) return;

    const category = decisionState.category;

    updateCategory(category.id, {
      name: category.name,
      code: category.code,
      units: category.units,
      description: category.description,
      status: "Pasif",
    });

    setDecisionState(null);

    setToast({
      type: "info",
      title: "Kategori pasife alındı",
      message: `${category.name} pasif oldu. Ürünler listede görünmeye devam eder.`,
    });
  };

  const handleMoveProducts = (targetCategory: Category) => {
    if (!decisionState) return;

    const oldCategory = decisionState.category;

    moveProductsToCategory(
      oldCategory.name,
      targetCategory.name,
      targetCategory.units
    );

    removeCategory(oldCategory.id);
    setDecisionState(null);

    setToast({
      type: "success",
      title: "Ürünler taşındı",
      message: `${oldCategory.name} kategorisindeki ${decisionState.productCount} ürün ${targetCategory.name} kategorisine taşındı.`,
    });
  };

  const handleDeleteWithProducts = () => {
    if (!decisionState) return;

    setDeleteState({
      category: decisionState.category,
      countdown: 10,
      mode: "category-with-products",
      productCount: decisionState.productCount,
    });

    setDecisionState(null);
  };

  const handleUndoDelete = () => {
    setDeleteState(null);

    setToast({
      type: "info",
      title: "Silme işlemi geri alındı",
      message: "Kategori listede kalmaya devam ediyor.",
    });
  };

  const handleForceDelete = () => {
    if (!deleteState) return;

    const deletedCategory = deleteState.category;

    if (deleteState.mode === "category-with-products") {
      removeProductsByCategory(deletedCategory.name);
    }

    removeCategory(deletedCategory.id);
    setDeleteState(null);

    setToast({
      type: "delete",
      title:
        deleteState.mode === "category-with-products"
          ? "Kategori ve ürünler silindi"
          : "Kategori silindi",
      message:
        deleteState.mode === "category-with-products"
          ? `${deletedCategory.name} kategorisi ve bağlı ${deleteState.productCount} ürün hızlı şekilde kaldırıldı.`
          : `${deletedCategory.name} hızlı şekilde kaldırıldı.`,
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              Kategoriler
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ürün kategorilerini, kategori kodlarını ve bağlı birimleri buradan
              yönetebilirsin.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <FiPlus size={18} />
            Kategori Ekle
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-slate-400 focus-within:bg-white">
            <FiSearch className="shrink-0 text-slate-400" size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="text"
              placeholder="Kategori adı, kategori kodu veya birim ara..."
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

        <CategoryTable
          categories={filteredCategories}
          deletingCategoryId={deleteState?.category.id ?? null}
          onEditCategory={handleOpenEditModal}
          onDeleteCategory={handleRequestDelete}
        />
      </div>

      <CategoryFormModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        category={modalState.category}
        categories={categories}
        onGenerateCode={handleGenerateCode}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCategory}
      />

      <CategoryDeleteDecisionModal
        category={decisionState?.category ?? null}
        productCount={decisionState?.productCount ?? 0}
        targetCategories={decisionTargetCategories}
        onClose={() => setDecisionState(null)}
        onDeactivate={handleDeactivateCategory}
        onMoveProducts={handleMoveProducts}
        onDeleteWithProducts={handleDeleteWithProducts}
      />

      <CategoryDeleteAlert
        deleteState={deleteState}
        onUndo={handleUndoDelete}
        onForceDelete={handleForceDelete}
      />

      <CategoryToast toast={toast} />
    </>
  );
}