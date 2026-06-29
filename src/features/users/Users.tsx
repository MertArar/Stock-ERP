"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTag,
  FiTrash2,
  FiUserCheck,
  FiUsers,
  FiUserX,
  FiX,
} from "react-icons/fi";

import RoleEditModal from "./components/RoleEditModal"
import UserTable from "./components/UserTable"
import type { AppUser, SelectOption } from "./types/users"
import { defaultRoleOptions, filterStatusOptions } from "./types/users"

type InlineSelectProps = {
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
};

type StatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  tone?: "default" | "dark" | "emerald" | "red";
};

type PendingDelete = {
  user: AppUser;
  index: number;
};

const PAGE_SIZE = 20;

const initialUsers: AppUser[] = [
  {
    id: "1",
    tcNo: "48291573620",
    fullName: "Özge Nihal Eryıldız",
    email: "ozge.eryildiz@company.com",
    phone: "0555 111 22 33",
    role: "Yönetici",
    status: "Aktif",
  },
  {
    id: "2",
    tcNo: "73918462510",
    fullName: "Selim Eryıldız",
    email: "selim.eryildiz@company.com",
    phone: "0555 222 33 44",
    role: "Depo Sorumlusu",
    status: "Aktif",
  },
  {
    id: "3",
    tcNo: "26591048372",
    fullName: "Mert Arar",
    email: "mert.arar@company.com",
    phone: "0555 333 44 55",
    role: "Satın Alma",
    status: "Aktif",
  },
  {
    id: "4",
    tcNo: "91827364502",
    fullName: "Doğan Arar",
    email: "dogan.arar@company.com",
    phone: "0555 444 55 66",
    role: "Muhasebe",
    status: "Aktif",
  },
  {
    id: "5",
    tcNo: "60482917356",
    fullName: "Mustafa Çardak",
    email: "mustafa.cardak@company.com",
    phone: "0555 555 66 77",
    role: "Personel",
    status: "Pasif",
  },
];

function InlineSelect({
  value,
  options,
  placeholder,
  onChange,
}: InlineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-11 w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left text-sm text-slate-900 outline-none transition hover:bg-white focus:border-slate-400"
      >
        <span className="min-w-0 truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <FiChevronDown
          className={[
            "shrink-0 text-slate-400 transition",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={[
                  "flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition",
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {option.label}
                  </span>

                  {option.description && (
                    <span
                      className={[
                        "mt-0.5 block truncate text-xs",
                        isSelected ? "text-white/60" : "text-slate-400",
                      ].join(" ")}
                    >
                      {option.description}
                    </span>
                  )}
                </span>

                {isSelected && <FiCheck className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  tone = "default",
}: StatCardProps) {
  const classes = {
    default: {
      wrapper: "border-slate-200 bg-slate-50",
      icon: "bg-white text-slate-700",
      value: "text-slate-900",
      description: "text-slate-400",
    },
    dark: {
      wrapper: "border-slate-900 bg-slate-900",
      icon: "bg-white/10 text-white",
      value: "text-white",
      description: "text-white/60",
    },
    emerald: {
      wrapper: "border-emerald-100 bg-emerald-50",
      icon: "bg-white text-emerald-700",
      value: "text-emerald-800",
      description: "text-emerald-600",
    },
    red: {
      wrapper: "border-red-100 bg-red-50",
      icon: "bg-white text-red-700",
      value: "text-red-800",
      description: "text-red-500",
    },
  }[tone];

  return (
    <div className={["rounded-3xl border px-5 py-4", classes.wrapper].join(" ")}>
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm",
            classes.icon,
          ].join(" ")}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400">{title}</p>

          <p className={["mt-1 text-xl font-semibold", classes.value].join(" ")}>
            {value}
          </p>

          <p className={["mt-1 text-xs", classes.description].join(" ")}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function normalizeText(value: string) {
  return value.toLocaleLowerCase("tr-TR").trim();
}

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePageCount = 5;

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxVisiblePageCount - 1);

  startPage = Math.max(1, endPage - maxVisiblePageCount + 1);

  const pages: number[] = [];

  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page);
  }

  return pages;
}

export default function Users() {
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [roleOptions, setRoleOptions] =
    useState<SelectOption[]>(defaultRoleOptions);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [roleError, setRoleError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(10);

  const filterRoleOptions = useMemo(() => {
    return [
      {
        value: "all",
        label: "Tüm roller",
      },
      ...roleOptions,
    ];
  }, [roleOptions]);

  const activeUsers = useMemo(() => {
    return users.filter((user) => user.status === "Aktif");
  }, [users]);

  const passiveUsers = useMemo(() => {
    return users.filter((user) => user.status === "Pasif");
  }, [users]);

  const adminUsers = useMemo(() => {
    return users.filter((user) => user.role === "Yönetici");
  }, [users]);

  const warehouseUsers = useMemo(() => {
    return users.filter((user) => user.role === "Depo Sorumlusu");
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) {
        return false;
      }

      if (statusFilter !== "all" && user.status !== statusFilter) {
        return false;
      }

      const search = normalizeText(searchTerm);

      if (!search) {
        return true;
      }

      const haystack = [
        user.fullName,
        user.tcNo,
        user.email,
        user.phone,
        user.role,
        user.status,
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return haystack.includes(search);
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  const visiblePageNumbers = useMemo(() => {
    return getVisiblePageNumbers(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const visibleStartIndex =
    filteredUsers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const visibleEndIndex = Math.min(currentPage * PAGE_SIZE, filteredUsers.length);

  const shouldShowPagination = filteredUsers.length > PAGE_SIZE;

  const activeFilterCount = [
    searchTerm.trim().length > 0,
    roleFilter !== "all",
    statusFilter !== "all",
  ].filter(Boolean).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!pendingDelete) {
      return;
    }

    setRemainingSeconds(10);

    const startedAt = Date.now();
    const duration = 10000;

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextRemaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));

      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 0) {
        setPendingDelete(null);
        window.clearInterval(intervalId);
      }
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [pendingDelete]);

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);

    setCurrentPage(nextPage);
  };

  const openRoleModal = () => {
    setNewRoleName("");
    setNewRoleDescription("");
    setRoleError("");
    setIsRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setNewRoleName("");
    setNewRoleDescription("");
    setRoleError("");
    setIsRoleModalOpen(false);
  };

  const addRole = () => {
    const roleName = newRoleName.trim();
    const roleDescription = newRoleDescription.trim();

    if (!roleName) {
      setRoleError("Rol adı boş bırakılamaz.");
      return;
    }

    const roleExists = roleOptions.some(
      (role) =>
        role.value.toLocaleLowerCase("tr-TR") ===
        roleName.toLocaleLowerCase("tr-TR")
    );

    if (roleExists) {
      setRoleError("Bu rol zaten eklenmiş.");
      return;
    }

    setRoleOptions((prev) => [
      ...prev,
      {
        value: roleName,
        label: roleName,
        description: roleDescription || "Özel rol",
      },
    ]);

    closeRoleModal();
  };

  const handleRoleSave = (userId: string, role: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        return {
          ...user,
          role,
        };
      })
    );

    setEditingUser(null);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        return {
          ...user,
          status: user.status === "Aktif" ? "Pasif" : "Aktif",
        };
      })
    );
  };

  const deleteUser = (user: AppUser) => {
    const userIndex = users.findIndex((item) => item.id === user.id);

    setUsers((prev) => prev.filter((item) => item.id !== user.id));

    setPendingDelete({
      user,
      index: userIndex >= 0 ? userIndex : 0,
    });
  };

  const undoDelete = () => {
    if (!pendingDelete) {
      return;
    }

    setUsers((prev) => {
      const nextUsers = [...prev];
      nextUsers.splice(pendingDelete.index, 0, pendingDelete.user);

      return nextUsers;
    });

    setPendingDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <FiUsers />
              Kullanıcı yönetimi
            </div>

            <h1 className="text-2xl font-semibold text-slate-900">
              Kullanıcılar
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Sisteme kayıt olan kullanıcıların rollerini ve erişim durumlarını
              yönet.
            </p>
          </div>

          <button
            type="button"
            onClick={openRoleModal}
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiPlus />
            Rol ekle
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Toplam kullanıcı"
          value={users.length}
          description="Kayıtlı kullanıcı"
          icon={<FiUsers />}
        />

        <StatCard
          title="Aktif kullanıcı"
          value={activeUsers.length}
          description="Sisteme erişebilir"
          icon={<FiUserCheck />}
          tone="emerald"
        />

        <StatCard
          title="Pasif kullanıcı"
          value={passiveUsers.length}
          description="Erişimi kapalı"
          icon={<FiUserX />}
          tone="red"
        />

        <StatCard
          title="Yönetici"
          value={adminUsers.length}
          description={`${warehouseUsers.length} depo sorumlusu`}
          icon={<FiShield />}
          tone="dark"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <FiFilter />
              Filtreler
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {activeFilterCount > 0
                ? `${activeFilterCount} aktif filtre uygulanıyor.`
                : "Tüm kullanıcılar listeleniyor."}
            </p>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FiRefreshCw />
            Filtreleri temizle
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Arama
            </label>

            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Ad, TC kimlik no, e-posta, telefon veya rol ara"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Rol
            </label>

            <InlineSelect
              value={roleFilter}
              options={filterRoleOptions}
              placeholder="Rol seç"
              onChange={setRoleFilter}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Durum
            </label>

            <InlineSelect
              value={statusFilter}
              options={filterStatusOptions}
              placeholder="Durum seç"
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </div>

      <UserTable
        users={paginatedUsers}
        filteredUserCount={filteredUsers.length}
        currentPage={currentPage}
        totalPages={totalPages}
        visiblePageNumbers={visiblePageNumbers}
        visibleStartIndex={visibleStartIndex}
        visibleEndIndex={visibleEndIndex}
        shouldShowPagination={shouldShowPagination}
        onEditRole={setEditingUser}
        onToggleStatus={toggleUserStatus}
        onDeleteUser={deleteUser}
        onGoToPage={goToPage}
      />

      {editingUser && (
        <RoleEditModal
          user={editingUser}
          roleOptions={roleOptions}
          onClose={() => setEditingUser(null)}
          onSave={handleRoleSave}
        />
      )}

      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Yeni Rol Ekle
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Eklediğin rol kullanıcı düzenleme ve filtreleme alanlarında
                  otomatik görünür.
                </p>
              </div>

              <button
                type="button"
                onClick={closeRoleModal}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                    <FiTag />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Rol tanımı
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Burada yalnızca rol adını tanımlıyoruz. Yetki detaylarını
                      backend tarafında ayrıca bağlayabiliriz.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Rol adı
                </label>

                <input
                  value={newRoleName}
                  onChange={(event) => {
                    setNewRoleName(event.target.value);
                    setRoleError("");
                  }}
                  placeholder="Örn. Şube Sorumlusu"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Açıklama
                </label>

                <textarea
                  value={newRoleDescription}
                  onChange={(event) => {
                    setNewRoleDescription(event.target.value);
                    setRoleError("");
                  }}
                  placeholder="Bu rolün yetki alanını kısa yaz"
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </div>

              {roleError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {roleError}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRoleModal}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={addRole}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FiPlus />
                Rol ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100%-40px)] max-w-md rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
              <FiTrash2 />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">Kullanıcı silindi</p>

              <p className="mt-1 text-sm text-slate-500">
                <strong className="text-slate-900">
                  {pendingDelete.user.fullName}
                </strong>{" "}
                listeden kaldırıldı. Geri almak için {remainingSeconds} saniye
                var.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={undoDelete}
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <FiRefreshCw />
                  Geri al
                </button>

                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Hemen Sil
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPendingDelete(null)}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <FiX />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}