import Link from "next/link";
import {
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiAlertTriangle,
  FiBox,
  FiDollarSign,
  FiHome,
  FiPlus,
  FiFileText,
} from "react-icons/fi";

const stats = [
  {
    title: "Toplam Ürün",
    value: "124",
    icon: FiBox,
  },
  {
    title: "Toplam Stok Değeri",
    value: "₺248.500",
    icon: FiDollarSign,
  },
  {
    title: "Kritik Stok",
    value: "8",
    icon: FiAlertTriangle,
  },
  {
    title: "Depo Sayısı",
    value: "3",
    icon: FiHome,
  },
];

const recentMovements = [
  {
    product: "Ahşap Masa",
    type: "Stok Girişi",
    quantity: "+24",
    date: "Bugün, 10:42",
  },
  {
    product: "Ofis Sandalyesi",
    type: "Stok Çıkışı",
    quantity: "-12",
    date: "Bugün, 09:18",
  },
  {
    product: "Metal Raf",
    type: "Stok Girişi",
    quantity: "+8",
    date: "Dün, 16:05",
  },
];

const criticalStocks = [
  {
    product: "Vida Seti",
    stock: 6,
    minStock: 20,
  },
  {
    product: "Mobilya Ayağı",
    stock: 4,
    minStock: 15,
  },
  {
    product: "Kulp Takımı",
    stock: 9,
    minStock: 25,
  },
];

const quickActions = [
  {
    title: "Ürün Ekle",
    href: "/products",
    icon: FiPlus,
  },
  {
    title: "Stok Girişi",
    href: "/stock-in",
    icon: FiArrowDownCircle,
  },
  {
    title: "Stok Çıkışı",
    href: "/stock-out",
    icon: FiArrowUpCircle,
  },
  {
    title: "Raporlar",
    href: "/reports",
    icon: FiFileText,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">
          Stok durumunu, hareketleri ve kritik ürünleri buradan takip edebilirsin.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{item.title}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">
                    {item.value}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Son Stok Hareketleri
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                En son yapılan giriş ve çıkış işlemleri.
              </p>
            </div>

            <Link
              href="/stock-movements"
              className="text-sm font-medium text-slate-950 hover:underline"
            >
              Tümünü Gör
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Ürün</th>
                  <th className="px-4 py-3 font-medium">İşlem</th>
                  <th className="px-4 py-3 font-medium">Miktar</th>
                  <th className="px-4 py-3 font-medium">Tarih</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {recentMovements.map((item) => (
                  <tr key={`${item.product}-${item.date}`}>
                    <td className="px-4 py-4 font-medium text-slate-950">
                      {item.product}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{item.type}</td>
                    <td
                      className={`px-4 py-4 font-semibold ${
                        item.quantity.startsWith("+")
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-slate-500">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-950">
              Kritik Stoklar
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Minimum seviyenin altındaki ürünler.
            </p>
          </div>

          <div className="space-y-3">
            {criticalStocks.map((item) => (
              <div
                key={item.product}
                className="rounded-2xl border border-rose-100 bg-rose-50 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-950">
                      {item.product}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Minimum stok: {item.minStock}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-rose-600">
                    {item.stock} kaldı
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-slate-950">
          Hızlı İşlemler
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
                    <Icon size={21} />
                  </div>

                  <p className="font-medium text-slate-950">{item.title}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}