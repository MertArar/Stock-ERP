import DashboardLayout from "@/components/layout/DashboardLayout";
import { CategoryProvider } from "@/features/categories/context/CategoryContext";
import { ProductProvider } from "@/features/products/context/ProductContext";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CategoryProvider>
      <ProductProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </ProductProvider>
    </CategoryProvider>
  );
}