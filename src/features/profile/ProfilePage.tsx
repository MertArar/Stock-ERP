"use client";

import { useState, type ReactNode } from "react";
import {
  FiActivity,
  FiArrowDownCircle,
  FiArrowRightCircle,
  FiArrowUpCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiEyeOff,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
  FiUser,
} from "react-icons/fi";

type ProfileInfoItem = {
  label: string;
  value: string;
  icon: ReactNode;
};

type UserAction = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: "entry" | "output" | "transfer" | "system";
};

const tcKimlikNo = "12345678910";

const profileInfo: ProfileInfoItem[] = [
  {
    label: "Ad Soyad",
    value: "Mert Arar",
    icon: <FiUser size={18} />,
  },
  {
    label: "E-posta",
    value: "mertarar.ma@gmail.com",
    icon: <FiMail size={18} />,
  },
  {
    label: "Telefon",
    value: "+90 5xx xxx xx xx",
    icon: <FiPhone size={18} />,
  },
  {
    label: "Rol",
    value: "Yönetici",
    icon: <FiCheckCircle size={18} />,
  },
  {
    label: "Konum",
    value: "Konya",
    icon: <FiMapPin size={18} />,
  },
];

const userActions: UserAction[] = [
  {
    id: 1,
    title: "Stok girişi yaptı",
    description: "Merkez Depo için 120 adet ürün girişi kaydedildi.",
    date: "Bugün",
    time: "14:25",
    type: "entry",
  },
  {
    id: 2,
    title: "Depo transferi oluşturdu",
    description: "Merkez Depo → Şube Depo arasında transfer işlemi başlatıldı.",
    date: "Bugün",
    time: "12:10",
    type: "transfer",
  },
  {
    id: 3,
    title: "Stok çıkışı yaptı",
    description: "Satış işlemi nedeniyle 24 adet ürün stoktan düşüldü.",
    date: "Dün",
    time: "17:45",
    type: "output",
  },
  {
    id: 4,
    title: "Ürün bilgisi güncelledi",
    description:
      "Elektrik Kablosu 3x2.5 ürününün kritik stok seviyesi düzenlendi.",
    date: "Dün",
    time: "10:30",
    type: "system",
  },
];

function maskTcKimlikNo(value: string) {
  if (value.length <= 4) return value;

  const firstTwo = value.slice(0, 2);
  const lastTwo = value.slice(-2);
  const hiddenPart = "*".repeat(value.length - 4);

  return `${firstTwo}${hiddenPart}${lastTwo}`;
}

function getActionIcon(type: UserAction["type"]) {
  if (type === "entry") {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <FiArrowDownCircle size={21} />
      </div>
    );
  }

  if (type === "output") {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <FiArrowUpCircle size={21} />
      </div>
    );
  }

  if (type === "transfer") {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <FiArrowRightCircle size={21} />
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
      <FiActivity size={21} />
    </div>
  );
}

export default function ProfilePage() {
  const [isTcVisible, setIsTcVisible] = useState(false);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative bg-slate-950 px-5 py-8 text-white sm:px-7 lg:px-8">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-2xl font-bold text-slate-950 shadow-lg">
                M
              </div>

              <div>
                <p className="mb-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">
                  Yönetici Profili
                </p>

                <h1 className="text-2xl font-bold sm:text-3xl">Mert Arar</h1>

                <p className="mt-2 text-sm text-slate-300">
                  Artech stok takip sistemi yönetici hesabı
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-auto">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs text-slate-300">Toplam işlem</p>
                <p className="mt-1 text-xl font-bold">248</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs text-slate-300">Son giriş</p>
                <p className="mt-1 text-xl font-bold">Bugün</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3 lg:p-8">
          {profileInfo.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
                  {item.icon}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">
                    {item.label}
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-slate-950">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
                <FiShield size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-500">
                  T.C. Kimlik No
                </p>

                <p className="mt-1 truncate text-sm font-bold text-slate-950">
                  {isTcVisible ? tcKimlikNo : maskTcKimlikNo(tcKimlikNo)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsTcVisible((current) => !current)}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700"
                aria-label={
                  isTcVisible
                    ? "T.C. kimlik numarasını gizle"
                    : "T.C. kimlik numarasını göster"
                }
              >
                {isTcVisible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950">Hesap Özeti</h2>
            <p className="mt-1 text-sm text-slate-500">
              Kullanıcının sistem içindeki genel durumu.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <FiCheckCircle size={21} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Hesap aktif
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Kullanıcı stok işlemleri için yetkili durumda.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FiCalendar size={21} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Kayıt tarihi
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    12 Haziran 2026
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <FiClock size={21} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Son oturum
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Bugün, 14:25
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Son İşlemler
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Kullanıcının sistem üzerinde yaptığı son hareketler.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              Son 4 işlem
            </span>
          </div>

          <div className="space-y-3">
            {userActions.map((action) => (
              <div
                key={action.id}
                className="flex gap-4 rounded-3xl border border-slate-100 p-4 transition hover:bg-slate-50"
              >
                {getActionIcon(action.type)}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-950">
                        {action.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {action.description}
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-xs font-bold text-slate-700">
                        {action.date}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {action.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}