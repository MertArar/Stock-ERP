"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  FiBell,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiDatabase,
  FiHome,
  FiPackage,
  FiRefreshCcw,
  FiSave,
  FiSettings,
  FiShield,
  FiSliders,
  FiTruck,
} from "react-icons/fi";

type SettingsForm = {
  companyName: string;
  branchName: string;
  defaultWarehouse: string;
  defaultCriticalStock: string;
  recordsPerPage: string;
  dateFormat: string;
  sessionTimeout: string;
  allowNegativeStock: boolean;
  requireTransferApproval: boolean;
  stockCountingReminder: boolean;
  criticalStockNotifications: boolean;
  stockMovementNotifications: boolean;
  transferNotifications: boolean;
  loginNotifications: boolean;
};

type DropdownOption = {
  label: string;
  value: string;
};

type InputFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: ReactNode;
  inputMode?: "text" | "numeric";
  onChange: (value: string) => void;
};

type ToggleRowProps = {
  title: string;
  description: string;
  checked: boolean;
  icon: ReactNode;
  onChange: () => void;
};

type SettingCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
};

const warehouseOptions: DropdownOption[] = [
  { label: "Merkez Depo", value: "main" },
  { label: "Şube Depo", value: "branch" },
  { label: "Yedek Depo", value: "backup" },
  { label: "Sevkiyat Deposu", value: "shipping" },
];

const recordsPerPageOptions: DropdownOption[] = [
  { label: "10 kayıt", value: "10" },
  { label: "20 kayıt", value: "20" },
  { label: "50 kayıt", value: "50" },
  { label: "100 kayıt", value: "100" },
];

const dateFormatOptions: DropdownOption[] = [
  { label: "29.06.2026", value: "dd.mm.yyyy" },
  { label: "29/06/2026", value: "dd/mm/yyyy" },
  { label: "2026-06-29", value: "yyyy-mm-dd" },
];

const sessionTimeoutOptions: DropdownOption[] = [
  { label: "15 dakika", value: "15" },
  { label: "30 dakika", value: "30" },
  { label: "1 saat", value: "60" },
  { label: "2 saat", value: "120" },
];

const initialSettings: SettingsForm = {
  companyName: "Artech",
  branchName: "Merkez Şube",
  defaultWarehouse: "main",
  defaultCriticalStock: "10",
  recordsPerPage: "20",
  dateFormat: "dd.mm.yyyy",
  sessionTimeout: "30",
  allowNegativeStock: false,
  requireTransferApproval: true,
  stockCountingReminder: true,
  criticalStockNotifications: true,
  stockMovementNotifications: true,
  transferNotifications: true,
  loginNotifications: false,
};

function InputField({
  label,
  value,
  placeholder,
  icon,
  inputMode = "text",
  onChange,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5">
        <span className="mr-3 text-lg text-slate-400">{icon}</span>

        <input
          type="text"
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          className="h-full w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

function CustomDropdown({
  label,
  value,
  options,
  icon,
  onChange,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  icon: ReactNode;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value) ?? options[0];
  }, [options, value]);

  return (
    <div className="relative space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={[
          "flex h-12 w-full cursor-pointer items-center justify-between rounded-2xl border bg-white px-4 text-left shadow-sm transition",
          isOpen
            ? "border-slate-900 ring-4 ring-slate-900/5"
            : "border-slate-200 hover:border-slate-300",
        ].join(" ")}
      >
        <span className="flex items-center gap-3">
          <span className="text-lg text-slate-400">{icon}</span>
          <span className="text-sm font-semibold text-slate-900">
            {selectedOption.label}
          </span>
        </span>

        <FiChevronDown
          size={18}
          className={[
            "text-slate-400 transition",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[76px] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={[
                "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
                option.value === value
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
              ].join(" ")}
            >
              {option.label}

              {option.value === value ? <FiCheckCircle size={16} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  icon,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
          {icon}
        </div>

        <div>
          <p className="text-sm font-bold text-slate-950">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={[
          "relative mt-1 h-7 w-12 shrink-0 cursor-pointer rounded-full transition",
          checked ? "bg-slate-950" : "bg-slate-300",
        ].join(" ")}
        aria-label={title}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function SettingCard({ title, description, icon, children }: SettingCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsForm>(initialSettings);
  const [isSaved, setIsSaved] = useState(false);

  const updateField = <Key extends keyof SettingsForm>(
    field: Key,
    value: SettingsForm[Key]
  ) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setIsSaved(false);
  };

  const handleCriticalStockChange = (value: string) => {
    const onlyDigits = value.replace(/\D/g, "").slice(0, 4);
    updateField("defaultCriticalStock", onlyDigits);
  };

  const handleSave = () => {
    setIsSaved(true);

    console.log("Ayarlar kaydedildi:", settings);
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setIsSaved(false);
  };

  return (
    <div className="space-y-6">
      {isSaved ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <div className="flex items-start gap-3">
            <FiCheckCircle className="mt-0.5 text-xl" />

            <div>
              <p className="text-sm font-bold">Ayarlar kaydedildi.</p>
              <p className="mt-1 text-xs leading-5">
                Backend bağlantısı olmadığı için ayarlar şimdilik console
                üzerinden kontrol ediliyor.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative bg-slate-950 px-5 py-8 text-white sm:px-7 lg:px-8">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">
                Sistem Ayarları
              </p>

              <h1 className="text-2xl font-bold sm:text-3xl">
                Stok takip kullanım tercihleri
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Firma bilgileri, stok uyarıları, bildirimler ve oturum
                tercihleri bu alandan yönetilir.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-auto">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs text-slate-300">Varsayılan depo</p>
                <p className="mt-1 text-sm font-bold">
                  {
                    warehouseOptions.find(
                      (item) => item.value === settings.defaultWarehouse
                    )?.label
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs text-slate-300">Kritik eşik</p>
                <p className="mt-1 text-sm font-bold">
                  {settings.defaultCriticalStock || "0"} adet
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SettingCard
          title="Firma ve genel bilgiler"
          description="Panelde kullanılacak temel firma ve şube bilgilerini belirler."
          icon={<FiHome size={21} />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Firma Adı"
              value={settings.companyName}
              placeholder="Firma adını girin"
              icon={<FiHome />}
              onChange={(value) => updateField("companyName", value)}
            />

            <InputField
              label="Şube Adı"
              value={settings.branchName}
              placeholder="Şube adını girin"
              icon={<FiDatabase />}
              onChange={(value) => updateField("branchName", value)}
            />

            <CustomDropdown
              label="Varsayılan Depo"
              value={settings.defaultWarehouse}
              options={warehouseOptions}
              icon={<FiPackage />}
              onChange={(value) => updateField("defaultWarehouse", value)}
            />

            <CustomDropdown
              label="Tarih Formatı"
              value={settings.dateFormat}
              options={dateFormatOptions}
              icon={<FiClock />}
              onChange={(value) => updateField("dateFormat", value)}
            />
          </div>
        </SettingCard>

        <SettingCard
          title="Stok kuralları"
          description="Stok giriş, çıkış ve transfer davranışları için temel kuralları ayarlar."
          icon={<FiPackage size={21} />}
        >
          <div className="space-y-4">
            <ToggleRow
              title="Negatif stoka izin ver"
              description="Aktif olursa stok miktarı sıfırın altına düşebilir. Genelde kapalı kalması daha güvenlidir."
              checked={settings.allowNegativeStock}
              icon={<FiPackage size={18} />}
              onChange={() =>
                updateField("allowNegativeStock", !settings.allowNegativeStock)
              }
            />

            <ToggleRow
              title="Depo transferi onay gerektirsin"
              description="Aktif olursa transfer işlemleri tamamlanmadan önce yetkili onayı bekler."
              checked={settings.requireTransferApproval}
              icon={<FiTruck size={18} />}
              onChange={() =>
                updateField(
                  "requireTransferApproval",
                  !settings.requireTransferApproval
                )
              }
            />

            <ToggleRow
              title="Sayım hatırlatıcısı"
              description="Belirli aralıklarla stok sayımı yapılması için kullanıcıya hatırlatma gösterir."
              checked={settings.stockCountingReminder}
              icon={<FiClock size={18} />}
              onChange={() =>
                updateField(
                  "stockCountingReminder",
                  !settings.stockCountingReminder
                )
              }
            />
          </div>
        </SettingCard>

        <SettingCard
          title="Bildirim tercihleri"
          description="Kullanıcıya hangi olaylarda bildirim gösterileceğini belirler."
          icon={<FiBell size={21} />}
        >
          <div className="space-y-4">
            <ToggleRow
              title="Kritik stok bildirimleri"
              description="Ürünler kritik stok seviyesine düştüğünde bildirim oluşturur."
              checked={settings.criticalStockNotifications}
              icon={<FiBell size={18} />}
              onChange={() =>
                updateField(
                  "criticalStockNotifications",
                  !settings.criticalStockNotifications
                )
              }
            />

            <ToggleRow
              title="Stok hareketi bildirimleri"
              description="Stok giriş ve çıkış işlemlerinde bildirim oluşturur."
              checked={settings.stockMovementNotifications}
              icon={<FiPackage size={18} />}
              onChange={() =>
                updateField(
                  "stockMovementNotifications",
                  !settings.stockMovementNotifications
                )
              }
            />

            <ToggleRow
              title="Transfer bildirimleri"
              description="Depolar arası transfer başlatıldığında veya tamamlandığında bildirim oluşturur."
              checked={settings.transferNotifications}
              icon={<FiTruck size={18} />}
              onChange={() =>
                updateField(
                  "transferNotifications",
                  !settings.transferNotifications
                )
              }
            />

            <ToggleRow
              title="Giriş bildirimleri"
              description="Hesaba yeni oturum açıldığında güvenlik bildirimi oluşturur."
              checked={settings.loginNotifications}
              icon={<FiShield size={18} />}
              onChange={() =>
                updateField("loginNotifications", !settings.loginNotifications)
              }
            />
          </div>
        </SettingCard>

        <SettingCard
          title="Kullanım ve güvenlik"
          description="Listeleme, oturum ve panel davranışlarına ait tercihleri yönetir."
          icon={<FiShield size={21} />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <CustomDropdown
              label="Listeleme Adedi"
              value={settings.recordsPerPage}
              options={recordsPerPageOptions}
              icon={<FiDatabase />}
              onChange={(value) => updateField("recordsPerPage", value)}
            />

            <CustomDropdown
              label="Oturum Süresi"
              value={settings.sessionTimeout}
              options={sessionTimeoutOptions}
              icon={<FiClock />}
              onChange={(value) => updateField("sessionTimeout", value)}
            />
          </div>

          <div className="mt-4 rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
                <FiSettings size={18} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-950">
                  Ayar önerisi
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Stok takip sistemlerinde negatif stok kapalı, kritik stok
                  bildirimi açık ve transfer onayı aktif kullanılırsa operasyon
                  hataları daha kolay fark edilir.
                </p>
              </div>
            </div>
          </div>
        </SettingCard>
      </div>

      <div className="flex flex-col-reverse gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <FiRefreshCcw />
          Varsayılana Döndür
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0"
        >
          <FiSave />
          Ayarları Kaydet
        </button>
      </div>
    </div>
  );
}