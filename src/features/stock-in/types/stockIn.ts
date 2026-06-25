import type { CurrencyCode } from "@/features/stock-movements/types/stockMovement";

export type StockInFormValues = {
  productId: string;
  warehouseId: string;

  quantity: string;

  currency: CurrencyCode;
  exchangeRate: string;
  unitPrice: string;

  supplierName: string;
  invoiceNo: string;
  description: string;
};