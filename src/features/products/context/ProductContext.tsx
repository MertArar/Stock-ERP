"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ProductStatus = "Aktif" | "Kritik" | "Pasif";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  status: ProductStatus;
};

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Ahşap Masa",
    sku: "MOB-AHM-001",
    category: "Mobilya",
    unit: "Adet",
    currentStock: 42,
    minStock: 10,
    status: "Aktif",
  },
  {
    id: "2",
    name: "Çalışma Masası",
    sku: "MOB-CAL-001",
    category: "Mobilya",
    unit: "Adet",
    currentStock: 15,
    minStock: 8,
    status: "Aktif",
  },
  {
    id: "3",
    name: "Ofis Sandalyesi",
    sku: "MOB-OFS-001",
    category: "Mobilya",
    unit: "Adet",
    currentStock: 8,
    minStock: 15,
    status: "Kritik",
  },
  {
    id: "4",
    name: "Laminant Panel",
    sku: "HAM-LAM-001",
    category: "Hammadde",
    unit: "Plaka",
    currentStock: 76,
    minStock: 25,
    status: "Aktif",
  },
  {
    id: "5",
    name: "MDF Levha",
    sku: "HAM-MDF-001",
    category: "Hammadde",
    unit: "Plaka",
    currentStock: 31,
    minStock: 15,
    status: "Aktif",
  },
  {
    id: "6",
    name: "Metal Raf",
    sku: "DEP-MET-001",
    category: "Depo Ekipmanı",
    unit: "Adet",
    currentStock: 24,
    minStock: 5,
    status: "Aktif",
  },
  {
    id: "7",
    name: "Depo Arabası",
    sku: "DEP-ARA-001",
    category: "Depo Ekipmanı",
    unit: "Adet",
    currentStock: 3,
    minStock: 5,
    status: "Kritik",
  },
  {
    id: "8",
    name: "Vida Seti",
    sku: "SAR-VID-001",
    category: "Sarf Malzeme",
    unit: "Kutu",
    currentStock: 6,
    minStock: 20,
    status: "Kritik",
  },
  {
    id: "9",
    name: "Mobilya Ayağı",
    sku: "SAR-AYA-001",
    category: "Sarf Malzeme",
    unit: "Adet",
    currentStock: 18,
    minStock: 30,
    status: "Kritik",
  },
  {
    id: "10",
    name: "Kulp Takımı",
    sku: "SAR-KUL-001",
    category: "Sarf Malzeme",
    unit: "Set",
    currentStock: 54,
    minStock: 20,
    status: "Aktif",
  },
  {
    id: "11",
    name: "Ambalaj Kartonu",
    sku: "AMB-KAR-001",
    category: "Ambalaj",
    unit: "Koli",
    currentStock: 12,
    minStock: 40,
    status: "Kritik",
  },
  {
    id: "12",
    name: "Koruyucu Sünger",
    sku: "AMB-SUN-001",
    category: "Ambalaj",
    unit: "Rulo",
    currentStock: 64,
    minStock: 20,
    status: "Aktif",
  },
];

type ProductContextValue = {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, values: Omit<Product, "id">) => void;
  removeProduct: (productId: string) => void;
  removeProductsByCategory: (categoryName: string) => void;
  moveProductsToCategory: (
    oldCategoryName: string,
    targetCategoryName: string,
    targetUnits: string[]
  ) => void;
};

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => [...prev, product]);
  }, []);

  const updateProduct = useCallback(
    (productId: string, values: Omit<Product, "id">) => {
      setProducts((prev) =>
        prev.map((product) => {
          if (product.id !== productId) {
            return product;
          }

          return {
            id: product.id,
            ...values,
          };
        })
      );
    },
    []
  );

  const removeProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  }, []);

  const removeProductsByCategory = useCallback((categoryName: string) => {
    setProducts((prev) =>
      prev.filter((product) => product.category !== categoryName)
    );
  }, []);

  const moveProductsToCategory = useCallback(
    (oldCategoryName: string, targetCategoryName: string, targetUnits: string[]) => {
      setProducts((prev) =>
        prev.map((product) => {
          if (product.category !== oldCategoryName) {
            return product;
          }

          return {
            ...product,
            category: targetCategoryName,
            unit: targetUnits.includes(product.unit)
              ? product.unit
              : targetUnits[0] ?? product.unit,
          };
        })
      );
    },
    []
  );

  const value = useMemo(
    () => ({
      products,
      addProduct,
      updateProduct,
      removeProduct,
      removeProductsByCategory,
      moveProductsToCategory,
    }),
    [
      products,
      addProduct,
      updateProduct,
      removeProduct,
      removeProductsByCategory,
      moveProductsToCategory,
    ]
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProducts must be used inside ProductProvider.");
  }

  return context;
}