import { FiEdit2, FiMoreVertical, FiTrash2 } from "react-icons/fi";

export type CategoryStatus = "Aktif" | "Pasif";

export type Category = {
  id: string;
  name: string;
  code: string;
  units: string[];
  description: string;
  status: CategoryStatus;
};

type CategoryTableProps = {
  categories: Category[];
  deletingCategoryId: string | null;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
};

function getStatusClass(status: CategoryStatus, isDeleting: boolean) {
  if (isDeleting) {
    return "bg-slate-100 text-slate-300 ring-slate-200";
  }

  switch (status) {
    case "Aktif":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    case "Pasif":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

export default function CategoryTable({
  categories,
  deletingCategoryId,
  onEditCategory,
  onDeleteCategory,
}: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-950">Kategori bulunamadı</p>
        <p className="mt-1 text-sm text-slate-500">
          Arama değerini değiştirerek tekrar deneyebilirsin.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-4 text-left font-medium">Kategori</th>
              <th className="px-5 py-4 text-center font-medium">Kod</th>
              <th className="px-5 py-4 text-center font-medium">Birimler</th>
              <th className="px-5 py-4 text-center font-medium">Açıklama</th>
              <th className="px-5 py-4 text-center font-medium">Durum</th>
              <th className="px-5 py-4 text-center font-medium">İşlem</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {categories.map((category) => {
              const isDeleting = deletingCategoryId === category.id;
              const primaryText = isDeleting
                ? "text-slate-300"
                : "text-slate-950";
              const secondaryText = isDeleting
                ? "text-slate-300"
                : "text-slate-600";

              return (
                <tr
                  key={category.id}
                  className={`transition ${
                    isDeleting ? "bg-slate-50" : "hover:bg-slate-50"
                  }`}
                >
                  <td className="px-5 py-4 text-left">
                    <p className={`font-medium ${primaryText}`}>
                      {category.name}
                    </p>
                  </td>

                  <td
                    className={`px-5 py-4 text-center font-medium ${secondaryText}`}
                  >
                    {category.code}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      {category.units.map((unit) => (
                        <span
                          key={unit}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            isDeleting
                              ? "bg-slate-100 text-slate-300"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {unit}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className={`px-5 py-4 text-center ${secondaryText}`}>
                    <span className="line-clamp-1">{category.description}</span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(
                        category.status,
                        isDeleting
                      )}`}
                    >
                      {isDeleting ? "Siliniyor" : category.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditCategory(category)}
                        disabled={isDeleting}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300 cursor-pointer"
                        aria-label="Kategoriyi düzenle"
                      >
                        <FiEdit2 size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteCategory(category)}
                        disabled={isDeleting}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:text-slate-300 cursor-pointer"
                        aria-label="Kategoriyi sil"
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
        {categories.map((category) => {
          const isDeleting = deletingCategoryId === category.id;
          const primaryText = isDeleting ? "text-slate-300" : "text-slate-950";
          const secondaryText = isDeleting ? "text-slate-300" : "text-slate-500";

          return (
            <div
              key={category.id}
              className={`p-5 ${isDeleting ? "bg-slate-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`font-semibold ${primaryText}`}>
                    {category.name}
                  </p>
                  <p className={`mt-1 text-sm ${secondaryText}`}>
                    Kod: {category.code}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isDeleting}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 cursor-pointer"
                  aria-label="Kategori işlemleri"
                >
                  <FiMoreVertical size={18} />
                </button>
              </div>

              <p className={`mt-4 text-sm leading-6 ${secondaryText}`}>
                {category.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {category.units.map((unit) => (
                  <span
                    key={unit}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isDeleting
                        ? "bg-slate-100 text-slate-300"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {unit}
                  </span>
                ))}
              </div>

              <div className="mt-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(
                    category.status,
                    isDeleting
                  )}`}
                >
                  {isDeleting ? "Siliniyor" : category.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onEditCategory(category)}
                  disabled={isDeleting}
                  className="h-10 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  Düzenle
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteCategory(category)}
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
    </div>
  );
}