"use client";

import { useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useCategories } from "@/features/categories/context/CategoryContext";
import { useWarehouses } from "@/features/warehouses/context/WarehouseContext";
import {
  useProducts,
  type Product,
} from "@/features/products/context/ProductContext";
import ProductFilters from "@/features/products/components/ProductFilters";
import ProductTable from "@/features/products/components/ProductTable";
import ProductFormModal, {
  type ProductFormValues,
} from "@/features/products/components/ProductFormModal";
import ProductDeleteAlert from "@/features/products/components/ProductDeleteAlert";
import ProductToast, {
  type ProductToastState,
} from "@/features/products/components/ProductToast";
import ProductDetailDrawer from "@/features/products/components/ProductDetailDrawer";

type ModalState =
  | {
      isOpen: false;
      mode: "add";
      product: null;
    }
  | {
      isOpen: true;
      mode: "add" | "edit";
      product: Product | null;
    };

type DeleteState = {
  product: Product;
  countdown: number;
};

function normalizeText(value: string) {
  return value
    .trim()
    .toLocaleUpperCase("tr-TR")
    .replaceAll("Ç", "C")
    .replaceAll("Ğ", "G")
    .replaceAll("İ", "I")
    .replaceAll("Ö", "O")
    .replaceAll("Ş", "S")
    .replaceAll("Ü", "U")
    .replace(/[^A-Z0-9\s]/g, "");
}

function getNamePrefix(name: string) {
  const words = normalizeText(name).split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "URN";
  }

  if (words.length > 1) {
    return `${words[0].slice(0, 2)}${words[1].slice(0, 1)}`;
  }

  return words[0].slice(0, 3).padEnd(3, "X");
}

function createSku(
  categoryCode: string,
  name: string,
  products: Product[],
  ignoredProductId?: string
) {
  const namePrefix = getNamePrefix(name);
  const baseSku = `${categoryCode}-${namePrefix}`;

  const usedNumbers = products
    .filter(
      (product) =>
        product.id !== ignoredProductId && product.sku.startsWith(baseSku)
    )
    .map((product) => Number(product.sku.split("-").at(-1)))
    .filter((value) => !Number.isNaN(value));

  const nextNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;

  return `${baseSku}-${String(nextNumber).padStart(3, "0")}`;
}

function getProductStatus(
  currentStock: number,
  minStock: number
): Product["status"] {
  return currentStock <= minStock ? "Kritik" : "Aktif";
}

export default function Products() {
  const { categories, activeCategories } = useCategories();
  const { warehouses, activeWarehouses } = useWarehouses();
  const { products, addProduct, updateProduct, removeProduct } = useProducts();

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: "add",
    product: null,
  });
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<ProductToastState | null>(null);

  const categoryNames = useMemo(() => {
    return categories.map((category) => category.name);
  }, [categories]);

  const passiveCategoryNames = useMemo(() => {
    return categories
      .filter((category) => category.status === "Pasif")
      .map((category) => category.name);
  }, [categories]);

  const productCategoryOptions = useMemo(() => {
    return activeCategories.map((category) => ({
      name: category.name,
      units: category.units,
    }));
  }, [activeCategories]);

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchValue) ||
          product.sku.toLowerCase().includes(searchValue) ||
          product.category.toLowerCase().includes(searchValue);

        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.includes(product.category);

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const categoryCompare = a.category.localeCompare(b.category, "tr");

        if (categoryCompare !== 0) {
          return categoryCompare;
        }

        return a.name.localeCompare(b.name, "tr");
      });
  }, [products, search, selectedCategories]);

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
      const deletedProduct = deleteState.product;

      removeProduct(deletedProduct.id);
      setDeleteState(null);

      if (detailProduct?.id === deletedProduct.id) {
        setDetailProduct(null);
      }

      setToast({
        type: "delete",
        title: "Ürün silindi",
        message: `${deletedProduct.name} listeden kaldırıldı.`,
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
  }, [deleteState, detailProduct, removeProduct]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      }

      return [...prev, category];
    });
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
  };

  const handleOpenAddModal = () => {
    setModalState({
      isOpen: true,
      mode: "add",
      product: null,
    });
  };

  const handleOpenEditModal = (product: Product) => {
    if (passiveCategoryNames.includes(product.category)) {
      setToast({
        type: "info",
        title: "Pasif kategori",
        message:
          "Pasif kategoriye bağlı ürünler doğrudan düzenlenemez. Önce kategoriyi aktif yap veya ürünleri başka kategoriye taşı.",
      });

      return;
    }

    setModalState({
      isOpen: true,
      mode: "edit",
      product,
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: "add",
      product: null,
    });
  };

  const handleGenerateSku = (
    category: string,
    name: string,
    ignoredProductId?: string
  ) => {
    const selectedCategory = activeCategories.find(
      (item) => item.name === category
    );

    const categoryCode = selectedCategory?.code ?? "URN";

    return createSku(categoryCode, name, products, ignoredProductId);
  };

  const createWarehouseStocksForTotal = (
    totalStock: number,
    product?: Product | null
  ) => {
    if (product?.warehouseStocks.length) {
      const oldTotal = product.warehouseStocks.reduce(
        (total, item) => total + item.quantity,
        0
      );

      if (oldTotal === totalStock) {
        return product.warehouseStocks;
      }
    }

    const firstWarehouse = activeWarehouses[0] ?? warehouses[0];

    if (!firstWarehouse) {
      return [];
    }

    return [
      {
        warehouseId: firstWarehouse.id,
        quantity: totalStock,
      },
    ];
  };

  const handleSubmitProduct = (values: ProductFormValues) => {
    if (modalState.mode === "add") {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        name: values.name,
        sku: values.sku,
        category: values.category,
        unit: values.unit,
        currentStock: values.currentStock,
        minStock: values.minStock,
        status: getProductStatus(values.currentStock, values.minStock),
        warehouseStocks: createWarehouseStocksForTotal(values.currentStock),
      };

      addProduct(newProduct);

      setToast({
        type: "success",
        title: "Ürün eklendi",
        message: `${newProduct.name} başarıyla listeye eklendi.`,
      });
    }

    if (modalState.mode === "edit" && modalState.product) {
      const editedProduct = modalState.product;

      const updatedProduct: Omit<Product, "id"> = {
        name: values.name,
        sku: values.sku,
        category: values.category,
        unit: values.unit,
        currentStock: values.currentStock,
        minStock: values.minStock,
        status: getProductStatus(values.currentStock, values.minStock),
        warehouseStocks: createWarehouseStocksForTotal(
          values.currentStock,
          editedProduct
        ),
      };

      updateProduct(editedProduct.id, updatedProduct);

      setDetailProduct((prev) => {
        if (!prev || prev.id !== editedProduct.id) {
          return prev;
        }

        return {
          id: editedProduct.id,
          ...updatedProduct,
        };
      });

      setToast({
        type: "info",
        title: "Ürün düzenlendi",
        message: `${values.name} bilgileri güncellendi.`,
      });
    }

    handleCloseModal();
  };

  const handleRequestDelete = (product: Product) => {
    setDeleteState({
      product,
      countdown: 10,
    });
  };

  const handleUndoDelete = () => {
    setDeleteState(null);

    setToast({
      type: "info",
      title: "Silme işlemi geri alındı",
      message: "Ürün listede kalmaya devam ediyor.",
    });
  };

  const handleForceDelete = () => {
    if (!deleteState) return;

    const deletedProduct = deleteState.product;

    removeProduct(deletedProduct.id);
    setDeleteState(null);

    if (detailProduct?.id === deletedProduct.id) {
      setDetailProduct(null);
    }

    setToast({
      type: "delete",
      title: "Ürün silindi",
      message: `${deletedProduct.name} hızlı şekilde kaldırıldı.`,
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Ürünler</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ürünleri kategoriye göre görüntüleyebilir, detayda depo bazlı stok
              dağılımını inceleyebilirsin.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            disabled={activeCategories.length === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <FiPlus size={18} />
            Ürün Ekle
          </button>
        </div>

        <ProductFilters
          search={search}
          onSearchChange={setSearch}
          categories={categoryNames}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          onClearCategories={handleClearCategories}
        />

        <ProductTable
          products={filteredProducts}
          deletingProductId={deleteState?.product.id ?? null}
          passiveCategoryNames={passiveCategoryNames}
          onViewProduct={setDetailProduct}
          onEditProduct={handleOpenEditModal}
          onDeleteProduct={handleRequestDelete}
        />
      </div>

      <ProductFormModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        product={modalState.product}
        products={products}
        categoryOptions={productCategoryOptions}
        onGenerateSku={handleGenerateSku}
        onClose={handleCloseModal}
        onSubmit={handleSubmitProduct}
      />

      <ProductDetailDrawer
        product={detailProduct}
        warehouses={warehouses}
        onClose={() => setDetailProduct(null)}
      />

      <ProductDeleteAlert
        deleteState={deleteState}
        onUndo={handleUndoDelete}
        onForceDelete={handleForceDelete}
      />

      <ProductToast toast={toast} />
    </>
  );
}