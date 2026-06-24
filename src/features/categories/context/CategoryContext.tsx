"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CategoryStatus = "Aktif" | "Pasif";

export type Category = {
  id: string;
  name: string;
  code: string;
  units: string[];
  description: string;
  status: CategoryStatus;
};

const initialCategories: Category[] = [
  {
    id: "1",
    name: "Ambalaj",
    code: "AMB",
    units: ["Koli", "Rulo", "Paket"],
    description: "Ambalaj ve paketleme ürünleri.",
    status: "Aktif",
  },
  {
    id: "2",
    name: "Depo Ekipmanı",
    code: "DEP",
    units: ["Adet", "Takım"],
    description: "Depo içinde kullanılan ekipmanlar.",
    status: "Aktif",
  },
  {
    id: "3",
    name: "Hammadde",
    code: "HAM",
    units: ["Plaka", "Metre", "Kg"],
    description: "Üretim veya işleme sürecinde kullanılan hammaddeler.",
    status: "Aktif",
  },
  {
    id: "4",
    name: "Mobilya",
    code: "MOB",
    units: ["Adet", "Takım"],
    description: "Mobilya ürünleri ve hazır ürün grupları.",
    status: "Aktif",
  },
  {
    id: "5",
    name: "Sarf Malzeme",
    code: "SAR",
    units: ["Adet", "Kutu", "Set"],
    description: "Sürekli tüketilen yardımcı malzemeler.",
    status: "Aktif",
  },
];

type CategoryContextValue = {
  categories: Category[];
  activeCategories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (categoryId: string, values: Omit<Category, "id">) => void;
  removeCategory: (categoryId: string) => void;
};

const CategoryContext = createContext<CategoryContextValue | null>(null);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const activeCategories = useMemo(() => {
    return categories
      .filter((category) => category.status === "Aktif")
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [categories]);

  const addCategory = useCallback((category: Category) => {
    setCategories((prev) => [...prev, category]);
  }, []);

  const updateCategory = useCallback(
    (categoryId: string, values: Omit<Category, "id">) => {
      setCategories((prev) =>
        prev.map((category) => {
          if (category.id !== categoryId) {
            return category;
          }

          return {
            id: category.id,
            ...values,
          };
        })
      );
    },
    []
  );

  const removeCategory = useCallback((categoryId: string) => {
    setCategories((prev) =>
      prev.filter((category) => category.id !== categoryId)
    );
  }, []);

  const value = useMemo(
    () => ({
      categories,
      activeCategories,
      addCategory,
      updateCategory,
      removeCategory,
    }),
    [categories, activeCategories, addCategory, updateCategory, removeCategory]
  );

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);

  if (!context) {
    throw new Error("useCategories must be used inside CategoryProvider.");
  }

  return context;
}