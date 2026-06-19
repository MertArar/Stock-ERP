"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiX } from "react-icons/fi";
import { navigationItems } from "@/config/navigation";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActivePath = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed left-0 top-0 z-50 h-screen w-72 border-r border-slate-800 bg-slate-950 text-white transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
            <Link href="/dashboard" onClick={onClose} className="group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950 shadow-sm transition-transform duration-300 group-hover:scale-105">
                  ST
                </div>

                <div>
                  <p className="text-base font-semibold leading-none">
                    Stock Panel
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Stok Yönetim Sistemi
                  </p>
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-900 hover:text-white lg:hidden"
              aria-label="Menüyü kapat"
            >
              <FiX size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-xl transition",
                      isActive
                        ? "bg-slate-950 text-white"
                        : "bg-slate-900 text-slate-400 group-hover:bg-slate-800 group-hover:text-white",
                    ].join(" ")}
                  >
                    <Icon size={18} />
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 p-4">
            <div className="rounded-2xl bg-slate-900 p-4">
              <p className="text-sm font-semibold text-white">
                Profesyonel Panel
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Ürün, depo, stok hareketi ve rapor yönetimi.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}