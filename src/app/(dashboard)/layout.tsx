import DashboardLayout from "@/components/layout/DashboardLayout";
import { CategoryProvider } from "@/features/categories/context/CategoryContext";
import { ProductProvider } from "@/features/products/context/ProductContext";
import { WarehouseProvider } from "@/features/warehouses/context/WarehouseContext";
import { StockMovementProvider } from "@/features/stock-movements/context/StockMovementContext";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CategoryProvider>
      <ProductProvider>
        <WarehouseProvider>
          <StockMovementProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </StockMovementProvider>
        </WarehouseProvider>
      </ProductProvider>
    </CategoryProvider>
  );
}