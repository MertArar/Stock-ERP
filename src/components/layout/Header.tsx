"use client";

import { FiMenu, FiSearch, FiBell } from "react-icons/fi";

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 lg:hidden"
            aria-label="Menüyü aç"
          >
            <FiMenu size={22} />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-slate-950">
              Yönetim Paneli
            </h1>
            <p className="hidden text-sm text-slate-500 sm:block">
              Stok durumunu ve operasyonları buradan takip edebilirsin.
            </p>
          </div>
        </div>

        <div className="hidden w-full max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex">
          <FiSearch className="text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Ürün, depo veya hareket ara..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-100"
            aria-label="Bildirimler"
          >
            <FiBell size={20} />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
              M
            </div>

            <div className="leading-none">
              <p className="text-sm font-semibold text-slate-950">Admin</p>
              <p className="mt-1 text-xs text-slate-500">Yönetici</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}