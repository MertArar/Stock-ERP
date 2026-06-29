export type UserStatus = "Aktif" | "Pasif";

export type AppUser = {
  id: string;
  tcNo: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: UserStatus;
};

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
};

export const defaultRoleOptions: SelectOption[] = [
  {
    value: "Yönetici",
    label: "Yönetici",
    description: "Tüm modüllere erişebilir",
  },
  {
    value: "Depo Sorumlusu",
    label: "Depo Sorumlusu",
    description: "Stok giriş, çıkış ve transfer işlemleri",
  },
  {
    value: "Satın Alma",
    label: "Satın Alma",
    description: "Stok girişleri ve tedarik süreçleri",
  },
  {
    value: "Muhasebe",
    label: "Muhasebe",
    description: "Alış değerleri ve raporlar",
  },
  {
    value: "Personel",
    label: "Personel",
    description: "Sınırlı görüntüleme yetkisi",
  },
];

export const filterStatusOptions: SelectOption[] = [
  {
    value: "all",
    label: "Tüm durumlar",
  },
  {
    value: "Aktif",
    label: "Aktif",
    description: "Sisteme erişebilir",
  },
  {
    value: "Pasif",
    label: "Pasif",
    description: "Erişimi kapalı",
  },
];