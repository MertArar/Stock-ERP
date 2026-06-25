"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  CreateStockMovementInput,
  StockMovement,
} from "../types/stockMovement";

type StockMovementContextValue = {
  movements: StockMovement[];
  stockInMovements: StockMovement[];
  stockOutMovements: StockMovement[];
  addStockMovement: (input: CreateStockMovementInput) => StockMovement;
  removeStockMovement: (movementId: string) => void;
  getMovementsByProductId: (productId: string) => StockMovement[];
  getMovementsByWarehouseId: (warehouseId: string) => StockMovement[];
  totalStockInValueTRY: number;
  totalStockOutQuantity: number;
};

const StockMovementContext = createContext<StockMovementContextValue | null>(
  null
);

function createMovementId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizeNumber(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return value;
}

export function StockMovementProvider({ children }: { children: ReactNode }) {
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const addStockMovement = useCallback((input: CreateStockMovementInput) => {
    const quantity = normalizeNumber(input.quantity);

    const hasFinancialData =
      typeof input.unitPrice === "number" &&
      typeof input.currency !== "undefined" &&
      typeof input.exchangeRate === "number";

    const unitPrice = normalizeNumber(input.unitPrice);
    const currency = input.currency ?? "TRY";
    const exchangeRate =
      currency === "TRY" ? 1 : normalizeNumber(input.exchangeRate);

    const totalPrice = roundMoney(quantity * unitPrice);
    const totalPriceTRY =
      currency === "TRY" ? totalPrice : roundMoney(totalPrice * exchangeRate);

    const movement: StockMovement = {
      id: createMovementId(),

      type: input.type,

      productId: input.productId,
      productName: input.productName,
      productSku: input.productSku,
      productUnit: input.productUnit,

      warehouseId: input.warehouseId,
      warehouseName: input.warehouseName,

      quantity,

      ...(hasFinancialData
        ? {
            unitPrice,
            currency,
            exchangeRate,
            totalPrice,
            totalPriceTRY,
          }
        : {}),

      supplierName: input.supplierName?.trim() || undefined,
      invoiceNo: input.invoiceNo?.trim() || undefined,

      stockOutReason: input.stockOutReason,
      relatedName: input.relatedName?.trim() || undefined,
      documentNo: input.documentNo?.trim() || undefined,

      description: input.description?.trim() || undefined,

      createdAt: new Date().toISOString(),
    };

    setMovements((prev) => [movement, ...prev]);

    return movement;
  }, []);

  const removeStockMovement = useCallback((movementId: string) => {
    setMovements((prev) =>
      prev.filter((movement) => movement.id !== movementId)
    );
  }, []);

  const getMovementsByProductId = useCallback(
    (productId: string) => {
      return movements.filter((movement) => movement.productId === productId);
    },
    [movements]
  );

  const getMovementsByWarehouseId = useCallback(
    (warehouseId: string) => {
      return movements.filter(
        (movement) => movement.warehouseId === warehouseId
      );
    },
    [movements]
  );

  const stockInMovements = useMemo(() => {
    return movements.filter((movement) => movement.type === "stock-in");
  }, [movements]);

  const stockOutMovements = useMemo(() => {
    return movements.filter((movement) => movement.type === "stock-out");
  }, [movements]);

  const totalStockInValueTRY = useMemo(() => {
    return stockInMovements.reduce(
      (total, movement) => total + (movement.totalPriceTRY ?? 0),
      0
    );
  }, [stockInMovements]);

  const totalStockOutQuantity = useMemo(() => {
    return stockOutMovements.reduce(
      (total, movement) => total + movement.quantity,
      0
    );
  }, [stockOutMovements]);

  const value = useMemo(
    () => ({
      movements,
      stockInMovements,
      stockOutMovements,
      addStockMovement,
      removeStockMovement,
      getMovementsByProductId,
      getMovementsByWarehouseId,
      totalStockInValueTRY,
      totalStockOutQuantity,
    }),
    [
      movements,
      stockInMovements,
      stockOutMovements,
      addStockMovement,
      removeStockMovement,
      getMovementsByProductId,
      getMovementsByWarehouseId,
      totalStockInValueTRY,
      totalStockOutQuantity,
    ]
  );

  return (
    <StockMovementContext.Provider value={value}>
      {children}
    </StockMovementContext.Provider>
  );
}

export function useStockMovements() {
  const context = useContext(StockMovementContext);

  if (!context) {
    throw new Error(
      "useStockMovements must be used inside StockMovementProvider."
    );
  }

  return context;
}