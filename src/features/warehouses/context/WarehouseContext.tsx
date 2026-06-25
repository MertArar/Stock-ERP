"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type WarehouseStatus = "Aktif" | "Pasif";

export type Warehouse = {
  id: string;
  name: string;
  code: string;
  location: string;
  responsible: string;
  description: string;
  status: WarehouseStatus;
};

type WarehouseContextValue = {
  warehouses: Warehouse[];
  activeWarehouses: Warehouse[];
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouseId: string, warehouse: Omit<Warehouse, "id">) => void;
  deleteWarehouse: (warehouseId: string) => void;
};

const initialWarehouses: Warehouse[] = [
  {
    id: "1",
    name: "Ana Depo",
    code: "DEP-ANA",
    location: "Konya / Merkez",
    responsible: "Depo Sorumlusu",
    description: "Ana ürün stoklarının tutulduğu depo.",
    status: "Aktif",
  },
  {
    id: "2",
    name: "Şube Deposu",
    code: "DEP-SUBE",
    location: "Konya / Şube",
    responsible: "Şube Yetkilisi",
    description: "Şube operasyonları için kullanılan depo.",
    status: "Aktif",
  },
  {
    id: "3",
    name: "İade Deposu",
    code: "DEP-IADE",
    location: "Konya / Merkez",
    responsible: "Operasyon Ekibi",
    description: "İade gelen ürünlerin tutulduğu depo.",
    status: "Aktif",
  },
  {
    id: "4",
    name: "Fire Deposu",
    code: "DEP-FIRE",
    location: "Konya / Merkez",
    responsible: "Kalite Kontrol",
    description: "Fire, hasarlı veya ayrıştırılmış ürünlerin tutulduğu depo.",
    status: "Aktif",
  },
];

const WarehouseContext = createContext<WarehouseContextValue | null>(null);

export function WarehouseProvider({ children }: { children: ReactNode }) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);

  const activeWarehouses = useMemo(() => {
    return warehouses
      .filter((warehouse) => warehouse.status === "Aktif")
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [warehouses]);

  const addWarehouse = useCallback((warehouse: Warehouse) => {
    setWarehouses((prev) => [...prev, warehouse]);
  }, []);

  const updateWarehouse = useCallback(
    (warehouseId: string, warehouse: Omit<Warehouse, "id">) => {
      setWarehouses((prev) =>
        prev.map((item) =>
          item.id === warehouseId
            ? {
                id: item.id,
                ...warehouse,
              }
            : item
        )
      );
    },
    []
  );

  const deleteWarehouse = useCallback((warehouseId: string) => {
    setWarehouses((prev) => prev.filter((item) => item.id !== warehouseId));
  }, []);

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        activeWarehouses,
        addWarehouse,
        updateWarehouse,
        deleteWarehouse,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouses() {
  const context = useContext(WarehouseContext);

  if (!context) {
    throw new Error("useWarehouses must be used inside WarehouseProvider");
  }

  return context;
}