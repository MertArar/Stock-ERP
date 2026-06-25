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

export type WarehouseStock = {
  warehouseId: string;
  quantity: number;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  status: ProductStatus;
  warehouseStocks: WarehouseStock[];
};

type DecreaseProductStockResult = {
  success: boolean;
  message?: string;
  availableStock?: number;
};

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
  increaseProductStock: (
    productId: string,
    warehouseId: string,
    quantity: number
  ) => void;
  decreaseProductStock: (
    productId: string,
    warehouseId: string,
    quantity: number
  ) => DecreaseProductStockResult;
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
    warehouseStocks: [
      { warehouseId: "1", quantity: 30 },
      { warehouseId: "2", quantity: 8 },
      { warehouseId: "3", quantity: 2 },
      { warehouseId: "4", quantity: 2 },
    ],
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
    warehouseStocks: [
      { warehouseId: "1", quantity: 10 },
      { warehouseId: "2", quantity: 5 },
      { warehouseId: "3", quantity: 0 },
      { warehouseId: "4", quantity: 0 },
    ],
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
    warehouseStocks: [
      { warehouseId: "1", quantity: 5 },
      { warehouseId: "2", quantity: 2 },
      { warehouseId: "3", quantity: 1 },
      { warehouseId: "4", quantity: 0 },
    ],
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
    warehouseStocks: [
      { warehouseId: "1", quantity: 70 },
      { warehouseId: "2", quantity: 0 },
      { warehouseId: "3", quantity: 3 },
      { warehouseId: "4", quantity: 3 },
    ],
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
    warehouseStocks: [
      { warehouseId: "1", quantity: 27 },
      { warehouseId: "2", quantity: 2 },
      { warehouseId: "3", quantity: 1 },
      { warehouseId: "4", quantity: 1 },
    ],
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
    warehouseStocks: [
      { warehouseId: "1", quantity: 18 },
      { warehouseId: "2", quantity: 6 },
      { warehouseId: "3", quantity: 0 },
      { warehouseId: "4", quantity: 0 },
    ],
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
    warehouseStocks: [
      { warehouseId: "1", quantity: 2 },
      { warehouseId: "2", quantity: 1 },
      { warehouseId: "3", quantity: 0 },
      { warehouseId: "4", quantity: 0 },
    ],
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
    warehouseStocks: [
      { warehouseId: "1", quantity: 4 },
      { warehouseId: "2", quantity: 1 },
      { warehouseId: "3", quantity: 0 },
      { warehouseId: "4", quantity: 1 },
    ],
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
    warehouseStocks: [
      { warehouseId: "1", quantity: 15 },
      { warehouseId: "2", quantity: 3 },
      { warehouseId: "3", quantity: 0 },
      { warehouseId: "4", quantity: 0 },
    ],
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
    warehouseStocks: [
      { warehouseId: "1", quantity: 44 },
      { warehouseId: "2", quantity: 8 },
      { warehouseId: "3", quantity: 1 },
      { warehouseId: "4", quantity: 1 },
    ],
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
    warehouseStocks: [
      { warehouseId: "1", quantity: 10 },
      { warehouseId: "2", quantity: 2 },
      { warehouseId: "3", quantity: 0 },
      { warehouseId: "4", quantity: 0 },
    ],
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
    warehouseStocks: [
      { warehouseId: "1", quantity: 50 },
      { warehouseId: "2", quantity: 10 },
      { warehouseId: "3", quantity: 2 },
      { warehouseId: "4", quantity: 2 },
    ],
  },
];

const ProductContext = createContext<ProductContextValue | null>(null);

function calculateTotalStock(warehouseStocks: WarehouseStock[]) {
  return warehouseStocks.reduce((total, item) => total + item.quantity, 0);
}

function calculateProductStatus(
  currentStock: number,
  minStock: number,
  previousStatus: ProductStatus
): ProductStatus {
  if (previousStatus === "Pasif") {
    return "Pasif";
  }

  if (currentStock <= minStock) {
    return "Kritik";
  }

  return "Aktif";
}

export function getProductTotalStock(product: Product) {
  const warehouseTotal = calculateTotalStock(product.warehouseStocks);

  return warehouseTotal || product.currentStock;
}

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
    (
      oldCategoryName: string,
      targetCategoryName: string,
      targetUnits: string[]
    ) => {
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

  const increaseProductStock = useCallback(
    (productId: string, warehouseId: string, quantity: number) => {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return;
      }

      setProducts((prev) =>
        prev.map((product) => {
          if (product.id !== productId) {
            return product;
          }

          const warehouseStockExists = product.warehouseStocks.some(
            (item) => item.warehouseId === warehouseId
          );

          const nextWarehouseStocks = warehouseStockExists
            ? product.warehouseStocks.map((item) => {
                if (item.warehouseId !== warehouseId) {
                  return item;
                }

                return {
                  ...item,
                  quantity: item.quantity + quantity,
                };
              })
            : [
                ...product.warehouseStocks,
                {
                  warehouseId,
                  quantity,
                },
              ];

          const nextCurrentStock = calculateTotalStock(nextWarehouseStocks);

          return {
            ...product,
            currentStock: nextCurrentStock,
            warehouseStocks: nextWarehouseStocks,
            status: calculateProductStatus(
              nextCurrentStock,
              product.minStock,
              product.status
            ),
          };
        })
      );
    },
    []
  );

  const decreaseProductStock = useCallback(
    (
      productId: string,
      warehouseId: string,
      quantity: number
    ): DecreaseProductStockResult => {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return {
          success: false,
          message: "Çıkış miktarı geçerli olmalı.",
        };
      }

      const product = products.find((item) => item.id === productId);

      if (!product) {
        return {
          success: false,
          message: "Ürün bulunamadı.",
        };
      }

      const warehouseStock = product.warehouseStocks.find(
        (item) => item.warehouseId === warehouseId
      );

      const availableStock = warehouseStock?.quantity ?? 0;

      if (availableStock <= 0) {
        return {
          success: false,
          message: "Seçilen depoda bu ürün için stok yok.",
          availableStock,
        };
      }

      if (quantity > availableStock) {
        return {
          success: false,
          message: `Çıkış miktarı mevcut depo stoğundan fazla olamaz. Mevcut stok: ${availableStock} ${product.unit}`,
          availableStock,
        };
      }

      setProducts((prev) =>
        prev.map((item) => {
          if (item.id !== productId) {
            return item;
          }

          const nextWarehouseStocks = item.warehouseStocks.map((stockItem) => {
            if (stockItem.warehouseId !== warehouseId) {
              return stockItem;
            }

            return {
              ...stockItem,
              quantity: stockItem.quantity - quantity,
            };
          });

          const nextCurrentStock = calculateTotalStock(nextWarehouseStocks);

          return {
            ...item,
            currentStock: nextCurrentStock,
            warehouseStocks: nextWarehouseStocks,
            status: calculateProductStatus(
              nextCurrentStock,
              item.minStock,
              item.status
            ),
          };
        })
      );

      return {
        success: true,
        availableStock,
      };
    },
    [products]
  );

  const value = useMemo(
    () => ({
      products,
      addProduct,
      updateProduct,
      removeProduct,
      removeProductsByCategory,
      moveProductsToCategory,
      increaseProductStock,
      decreaseProductStock,
    }),
    [
      products,
      addProduct,
      updateProduct,
      removeProduct,
      removeProductsByCategory,
      moveProductsToCategory,
      increaseProductStock,
      decreaseProductStock,
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