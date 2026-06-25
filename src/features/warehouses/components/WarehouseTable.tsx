import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type {
  Warehouse,
  WarehouseStatus,
} from "@/features/warehouses/context/WarehouseContext";

type WarehouseTableProps = {
  warehouses: Warehouse[];
  deletingWarehouseId: string | null;
  onEditWarehouse: (warehouse: Warehouse) => void;
  onDeleteWarehouse: (warehouse: Warehouse) => void;
};

function getStatusClass(status: WarehouseStatus, isDeleting: boolean) {
  if (isDeleting) {
    return "bg-slate-100 text-slate-300 ring-slate-200";
  }

  if (status === "Aktif") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  return "bg-slate-100 text-slate-500 ring-slate-200";
}

export default function WarehouseTable({
  warehouses,
  deletingWarehouseId,
  onEditWarehouse,
  onDeleteWarehouse,
}: WarehouseTableProps) {
  if (warehouses.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-950">Depo bulunamadı</p>
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
          <thead className="border-b border-slate-800 bg-slate-900 text-white">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                Depo
              </th>
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                Depo Kodu
              </th>
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                Lokasyon
              </th>
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide">
                Sorumlu
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
            {warehouses.map((warehouse) => {
              const isDeleting = deletingWarehouseId === warehouse.id;
              const isPassive = warehouse.status === "Pasif";
              const isMuted = isDeleting || isPassive;

              const primaryText = isMuted
                ? "text-slate-300"
                : "text-slate-950";
              const secondaryText = isMuted
                ? "text-slate-300"
                : "text-slate-600";

              return (
                <tr
                  key={warehouse.id}
                  className={`transition ${
                    isMuted ? "bg-slate-50" : "hover:bg-slate-50"
                  }`}
                >
                  <td className="px-5 py-4 text-left">
                    <div>
                      <p className={`font-medium ${primaryText}`}>
                        {warehouse.name}
                      </p>
                      <p className={`mt-1 text-xs ${secondaryText}`}>
                        {warehouse.description}
                      </p>
                    </div>
                  </td>

                  <td
                    className={`px-5 py-4 text-center font-medium ${secondaryText}`}
                  >
                    {warehouse.code}
                  </td>

                  <td className={`px-5 py-4 text-center ${secondaryText}`}>
                    {warehouse.location}
                  </td>

                  <td className={`px-5 py-4 text-center ${secondaryText}`}>
                    {warehouse.responsible}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(
                        warehouse.status,
                        isDeleting
                      )}`}
                    >
                      {isDeleting ? "Siliniyor" : warehouse.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditWarehouse(warehouse)}
                        disabled={isDeleting}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300"
                        aria-label="Depoyu düzenle"
                      >
                        <FiEdit2 size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteWarehouse(warehouse)}
                        disabled={isDeleting}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:text-slate-300"
                        aria-label="Depoyu sil"
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
        {warehouses.map((warehouse) => {
          const isDeleting = deletingWarehouseId === warehouse.id;
          const isPassive = warehouse.status === "Pasif";
          const isMuted = isDeleting || isPassive;

          const primaryText = isMuted ? "text-slate-300" : "text-slate-950";
          const secondaryText = isMuted ? "text-slate-300" : "text-slate-500";

          return (
            <div
              key={warehouse.id}
              className={`p-5 ${isMuted ? "bg-slate-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`font-semibold ${primaryText}`}>
                    {warehouse.name}
                  </p>
                  <p className={`mt-1 text-sm ${secondaryText}`}>
                    {warehouse.code}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(
                    warehouse.status,
                    isDeleting
                  )}`}
                >
                  {isDeleting ? "Siliniyor" : warehouse.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className={secondaryText}>Lokasyon</p>
                  <p className={`mt-1 font-medium ${primaryText}`}>
                    {warehouse.location}
                  </p>
                </div>

                <div>
                  <p className={secondaryText}>Sorumlu</p>
                  <p className={`mt-1 font-medium ${primaryText}`}>
                    {warehouse.responsible}
                  </p>
                </div>
              </div>

              <p className={`mt-4 text-sm leading-6 ${secondaryText}`}>
                {warehouse.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onEditWarehouse(warehouse)}
                  disabled={isDeleting}
                  className="h-10 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  Düzenle
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteWarehouse(warehouse)}
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