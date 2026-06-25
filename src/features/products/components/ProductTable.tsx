import { FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  getProductTotalStock,
  type Product,
  type ProductStatus,
} from "@/features/products/context/ProductContext";

export type { Product, ProductStatus };

type ProductTableProps = {
  products: Product[];
  deletingProductId: string | null;
  passiveCategoryNames: string[];
  onViewProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
};

type ProductGroup = {
  category: string;
  products: Product[];
};

function getStatusClass(
  status: ProductStatus,
  isDeleting: boolean,
  isPassiveCategory: boolean
) {
  if (isDeleting || isPassiveCategory) {
    return "bg-slate-100 text-slate-400 ring-slate-200";
  }

  switch (status) {
    case "Aktif":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    case "Kritik":
      return "bg-rose-50 text-rose-700 ring-rose-100";
    case "Pasif":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function groupProductsByCategory(products: Product[]): ProductGroup[] {
  const groups = products.reduce<Record<string, Product[]>>((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }

    acc[product.category].push(product);

    return acc;
  }, {});

  return Object.entries(groups)
    .sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB, "tr"))
    .map(([category, items]) => ({
      category,
      products: items.sort((a, b) => a.name.localeCompare(b.name, "tr")),
    }));
}

export default function ProductTable({
  products,
  deletingProductId,
  passiveCategoryNames,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
}: ProductTableProps) {
  const groupedProducts = groupProductsByCategory(products);

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-950">Ürün bulunamadı</p>
        <p className="mt-1 text-sm text-slate-500">
          Arama veya kategori filtresini değiştirerek tekrar deneyebilirsin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groupedProducts.map((group) => {
        const isPassiveGroup = passiveCategoryNames.includes(group.category);

        return (
          <section
            key={group.category}
            className={`overflow-hidden rounded-3xl border shadow-sm ${
              isPassiveGroup
                ? "border-slate-200 bg-slate-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 ${
                isPassiveGroup ? "bg-slate-100" : "bg-slate-50"
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={`text-base font-semibold ${
                      isPassiveGroup ? "text-slate-400" : "text-slate-950"
                    }`}
                  >
                    {group.category}
                  </h3>

                  {isPassiveGroup && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-200">
                      Pasif kategori
                    </span>
                  )}
                </div>

                <p
                  className={`mt-1 text-xs ${
                    isPassiveGroup ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Bu kategori altında {group.products.length} ürün listeleniyor.
                </p>
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="border-b border-slate-800 bg-slate-900 text-white">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                      Ürün
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                      Kategori
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                      Ürün Kodu
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                      Birim
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                      Toplam Stok
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                      Minimum Stok
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                      Durum
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                      İşlem
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {group.products.map((product) => {
                    const isDeleting = deletingProductId === product.id;
                    const isMuted = isDeleting || isPassiveGroup;
                    const totalStock = getProductTotalStock(product);

                    const primaryText = isMuted
                      ? "text-slate-300"
                      : "text-slate-950";
                    const secondaryText = isMuted
                      ? "text-slate-300"
                      : "text-slate-600";

                    return (
                      <tr
                        key={product.id}
                        onClick={() => onViewProduct(product)}
                        className={`cursor-pointer transition ${
                          isMuted ? "bg-slate-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-5 py-4 text-left">
                          <div>
                            <p className={`font-medium ${primaryText}`}>
                              {product.name}
                            </p>
                            <p className={`mt-1 text-xs ${secondaryText}`}>
                              Detay için tıkla
                            </p>
                          </div>
                        </td>

                        <td
                          className={`px-5 py-4 text-center ${secondaryText}`}
                        >
                          {product.category}
                        </td>

                        <td
                          className={`px-5 py-4 text-center font-medium ${secondaryText}`}
                        >
                          {product.sku}
                        </td>

                        <td
                          className={`px-5 py-4 text-center ${secondaryText}`}
                        >
                          {product.unit}
                        </td>

                        <td
                          className={`px-5 py-4 text-center font-semibold ${primaryText}`}
                        >
                          {totalStock}
                        </td>

                        <td
                          className={`px-5 py-4 text-center ${secondaryText}`}
                        >
                          {product.minStock}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(
                              product.status,
                              isDeleting,
                              isPassiveGroup
                            )}`}
                          >
                            {isDeleting
                              ? "Siliniyor"
                              : isPassiveGroup
                              ? "Kategori Pasif"
                              : product.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onEditProduct(product);
                              }}
                              disabled={isDeleting}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300 cursor-pointer"
                              aria-label="Ürünü düzenle"
                            >
                              <FiEdit2 size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onDeleteProduct(product);
                              }}
                              disabled={isDeleting}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:text-slate-300 cursor-pointer"
                              aria-label="Ürünü sil"
                            >
                              <FiTrash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-200 md:hidden">
              {group.products.map((product) => {
                const isDeleting = deletingProductId === product.id;
                const isMuted = isDeleting || isPassiveGroup;
                const totalStock = getProductTotalStock(product);

                const primaryText = isMuted
                  ? "text-slate-300"
                  : "text-slate-950";
                const secondaryText = isMuted
                  ? "text-slate-300"
                  : "text-slate-500";

                return (
                  <div
                    key={product.id}
                    onClick={() => onViewProduct(product)}
                    className={`cursor-pointer p-5 ${isMuted ? "bg-slate-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`font-semibold ${primaryText}`}>
                          {product.name}
                        </p>
                        <p className={`mt-1 text-sm ${secondaryText}`}>
                          {product.sku}
                        </p>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(
                          product.status,
                          isDeleting,
                          isPassiveGroup
                        )}`}
                      >
                        {isDeleting
                          ? "Siliniyor"
                          : isPassiveGroup
                          ? "Kategori Pasif"
                          : product.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className={secondaryText}>Kategori</p>
                        <p className={`mt-1 font-medium ${primaryText}`}>
                          {product.category}
                        </p>
                      </div>

                      <div>
                        <p className={secondaryText}>Birim</p>
                        <p className={`mt-1 font-medium ${primaryText}`}>
                          {product.unit}
                        </p>
                      </div>

                      <div>
                        <p className={secondaryText}>Toplam Stok</p>
                        <p className={`mt-1 font-medium ${primaryText}`}>
                          {totalStock}
                        </p>
                      </div>

                      <div>
                        <p className={secondaryText}>Minimum Stok</p>
                        <p className={`mt-1 font-medium ${primaryText}`}>
                          {product.minStock}
                        </p>
                      </div>
                    </div>

                    <p className={`mt-4 text-xs ${secondaryText}`}>
                      Depo bazlı stok için karta tıkla.
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditProduct(product);
                        }}
                        disabled={isDeleting}
                        className="h-10 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                      >
                        Düzenle
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteProduct(product);
                        }}
                        disabled={isDeleting}
                        className="h-10 rounded-2xl border border-rose-100 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}