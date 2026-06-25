import type { StockOutReason } from "@/features/stock-movements/types/stockMovement";

export type StockOutFormValues = {
  productId: string;
  warehouseId: string;
  quantity: string;
  reason: StockOutReason | "";
  relatedName: string;
  documentNo: string;
  description: string;
};