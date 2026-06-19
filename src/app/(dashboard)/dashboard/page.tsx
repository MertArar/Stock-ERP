export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">
          Genel stok durumunu buradan takip edebilirsin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Toplam Ürün</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">124</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Kritik Stok</p>
          <p className="mt-3 text-3xl font-semibold text-rose-600">8</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Bugünkü Giriş</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">32</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Bugünkü Çıkış</p>
          <p className="mt-3 text-3xl font-semibold text-orange-500">17</p>
        </div>
      </div>
    </div>
  );
}