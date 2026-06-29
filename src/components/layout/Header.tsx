"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiSearch,
  FiSettings,
  FiUser,
  FiX,
} from "react-icons/fi";

type HeaderProps = {
  onMenuClick: () => void;
};

type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  type: "critical" | "stock" | "success";
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Kritik stok uyarısı",
    description: "Elektrik Kablosu 3x2.5 ürünü kritik stok seviyesine düştü.",
    time: "5 dk önce",
    type: "critical",
  },
  {
    id: 2,
    title: "Yeni stok girişi",
    description: "Merkez Depo için 120 adet ürün girişi kaydedildi.",
    time: "18 dk önce",
    type: "stock",
  },
  {
    id: 3,
    title: "Depo transferi tamamlandı",
    description: "Merkez Depo → Şube Depo transfer işlemi başarıyla tamamlandı.",
    time: "1 saat önce",
    type: "success",
  },
];

function getNotificationIcon(type: Notification["type"]) {
  if (type === "critical") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <FiAlertTriangle size={19} />
      </div>
    );
  }

  if (type === "stock") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <FiPackage size={19} />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
      <FiCheckCircle size={19} />
    </div>
  );
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const notificationRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const handleNotificationClick = () => {
    setIsNotificationsOpen((current) => !current);
    setIsUserMenuOpen(false);
    setHasUnreadNotifications(false);
  };

  const handleUserMenuClick = () => {
    setIsUserMenuOpen((current) => !current);
    setIsNotificationsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    setNotifications([]);
    setHasUnreadNotifications(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setIsNotificationsOpen(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 lg:hidden"
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
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={handleNotificationClick}
              className={[
                "relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border transition",
                isNotificationsOpen
                  ? "border-slate-900 bg-slate-950 text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-100",
              ].join(" ")}
              aria-label="Bildirimler"
              aria-expanded={isNotificationsOpen}
            >
              <FiBell size={20} />

              {hasUnreadNotifications && notifications.length > 0 ? (
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              ) : null}
            </button>

            {isNotificationsOpen ? (
              <div className="fixed left-4 right-4 top-24 z-50 max-h-[calc(100vh-7rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 sm:absolute sm:left-auto sm:right-0 sm:top-14 sm:w-[390px]">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">
                      Bildirimler
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Son stok ve operasyon bildirimleri
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Bildirimleri kapat"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                <div className="max-h-[420px] overflow-y-auto p-3">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="group flex gap-3 rounded-2xl p-3 transition hover:bg-slate-50"
                      >
                        {getNotificationIcon(notification.type)}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-bold text-slate-900">
                              {notification.title}
                            </p>

                            <span className="shrink-0 text-[11px] font-medium text-slate-400">
                              {notification.time}
                            </span>
                          </div>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {notification.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                        <FiCheckCircle size={24} />
                      </div>

                      <p className="mt-4 text-sm font-bold text-slate-900">
                        Okunmamış bildirimin yok
                      </p>

                      <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                        Yeni stok hareketleri, kritik stok uyarıları ve depo
                        transferleri burada görünecek.
                      </p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="w-full cursor-pointer rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      Tüm bildirimleri okunmuş olarak işaretle
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={handleUserMenuClick}
              className={[
                "flex cursor-pointer items-center gap-3 rounded-2xl border px-2 py-2 transition sm:px-3",
                isUserMenuOpen
                  ? "border-slate-900 bg-slate-950 text-white"
                  : "border-slate-200 text-slate-950 hover:bg-slate-100",
              ].join(" ")}
              aria-label="Kullanıcı menüsü"
              aria-expanded={isUserMenuOpen}
            >
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold",
                  isUserMenuOpen
                    ? "bg-white text-slate-950"
                    : "bg-slate-950 text-white",
                ].join(" ")}
              >
                M
              </div>

              <div className="hidden text-left leading-none sm:block">
                <p className="text-sm font-semibold">Admin</p>
                <p
                  className={[
                    "mt-1 text-xs",
                    isUserMenuOpen ? "text-slate-300" : "text-slate-500",
                  ].join(" ")}
                >
                  Yönetici
                </p>
              </div>

              <FiChevronDown
                size={17}
                className={[
                  "hidden transition sm:block",
                  isUserMenuOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {isUserMenuOpen ? (
              <div className="fixed left-4 right-4 top-24 z-50 overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15 sm:absolute sm:left-auto sm:right-0 sm:top-14 sm:w-64">
                <Link
                  href="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <FiUser size={18} />
                  </span>
                  Profil
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <FiSettings size={18} />
                  </span>
                  Ayarlar
                </Link>

                <Link
                  href="/login"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <FiLogOut size={18} />
                  </span>
                  Çıkış yap
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}