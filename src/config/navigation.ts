import type { IconType } from "react-icons";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiBarChart2,
  FiBox,
  FiGrid,
  FiHome,
  FiLayers,
  FiRepeat,
  FiSettings,
  FiUsers,
} from "react-icons/fi";

export type NavigationItem = {
  label: string;
  href: string;
  icon: IconType;
};

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: FiGrid,
  },
  {
    label: "Ürünler",
    href: "/products",
    icon: FiBox,
  },
  {
    label: "Kategoriler",
    href: "/categories",
    icon: FiLayers,
  },
  {
    label: "Depolar",
    href: "/warehouses",
    icon: FiHome,
  },
  {
    label: "Stok Girişi",
    href: "/stock-in",
    icon: FiArrowDownCircle,
  },
  {
    label: "Stok Çıkışı",
    href: "/stock-out",
    icon: FiArrowUpCircle,
  },
  {
    label: "Depo Transferi",
    href: "/stock-transfer",
    icon: FiRepeat,
  },
  {
    label: "Stok Hareketleri",
    href: "/stock-movements",
    icon: FiActivity,
  },
  {
    label: "Kritik Stoklar",
    href: "/critical-stocks",
    icon: FiAlertTriangle,
  },
  {
    label: "Raporlar",
    href: "/reports",
    icon: FiBarChart2,
  },
  {
    label: "Kullanıcılar",
    href: "/users",
    icon: FiUsers,
  },
];