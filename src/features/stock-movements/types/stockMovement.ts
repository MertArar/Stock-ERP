export type StockMovementType =
  | "stock-in"
  | "stock-out"
  | "transfer"
  | "adjustment";

export type CurrencyCode = "TRY" | "USD" | "EUR" | "GBP";

export type StockOutReason =
  | "Satış"
  | "Üretimde Kullanım"
  | "Fire"
  | "İade"
  | "Sayım Düzeltmesi"
  | "Diğer";

export type StockMovement = {
  id: string;

  type: StockMovementType;

  productId: string;
  productName: string;
  productSku: string;
  productUnit: string;

  warehouseId: string;
  warehouseName: string;

  targetWarehouseId?: string;
  targetWarehouseName?: string;

  quantity: number;

  unitPrice?: number;
  currency?: CurrencyCode;
  exchangeRate?: number;

  totalPrice?: number;
  totalPriceTRY?: number;

  supplierName?: string;
  invoiceNo?: string;

  stockOutReason?: StockOutReason;
  relatedName?: string;
  documentNo?: string;

  description?: string;

  createdAt: string;
};

export type CreateStockMovementInput = {
  type: StockMovementType;

  productId: string;
  productName: string;
  productSku: string;
  productUnit: string;

  warehouseId: string;
  warehouseName: string;

  targetWarehouseId?: string;
  targetWarehouseName?: string;

  quantity: number;

  unitPrice?: number;
  currency?: CurrencyCode;
  exchangeRate?: number;

  supplierName?: string;
  invoiceNo?: string;

  stockOutReason?: StockOutReason;
  relatedName?: string;
  documentNo?: string;

  description?: string;
};