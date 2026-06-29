"use client";

import { useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiMail,
  FiPhone,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";

import type { AppUser } from "../types/users"

type UserTableProps = {
  users: AppUser[];
  filteredUserCount: number;
  currentPage: number;
  totalPages: number;
  visiblePageNumbers: number[];
  visibleStartIndex: number;
  visibleEndIndex: number;
  shouldShowPagination: boolean;
  onEditRole: (user: AppUser) => void;
  onToggleStatus: (userId: string) => void;
  onDeleteUser: (user: AppUser) => void;
  onGoToPage: (page: number) => void;
};

function getRoleBadgeClass(role: string) {
  if (role === "Yönetici") {
    return "bg-slate-900 text-white";
  }

  if (role === "Depo Sorumlusu") {
    return "bg-blue-50 text-blue-700";
  }

  if (role === "Satın Alma") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (role === "Muhasebe") {
    return "bg-amber-50 text-amber-700";
  }

  if (role === "Personel") {
    return "bg-slate-100 text-slate-600";
  }

  return "bg-violet-50 text-violet-700";
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toLocaleUpperCase("tr-TR");
}

function maskTcNo(tcNo: string) {
  if (tcNo.length <= 4) {
    return tcNo;
  }

  const firstTwo = tcNo.slice(0, 2);
  const lastTwo = tcNo.slice(-2);
  const maskedPart = "*".repeat(Math.max(tcNo.length - 4, 4));

  return `${firstTwo}${maskedPart}${lastTwo}`;
}

export default function UserTable({
  users,
  filteredUserCount,
  currentPage,
  totalPages,
  visiblePageNumbers,
  visibleStartIndex,
  visibleEndIndex,
  shouldShowPagination,
  onEditRole,
  onToggleStatus,
  onDeleteUser,
  onGoToPage,
}: UserTableProps) {
  const [visibleTcIds, setVisibleTcIds] = useState<string[]>([]);

  const visibleTcIdSet = useMemo(() => {
    return new Set(visibleTcIds);
  }, [visibleTcIds]);

  const toggleTcVisibility = (userId: string) => {
    setVisibleTcIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }

      return [...prev, userId];
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {filteredUserCount === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FiUsers />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Kullanıcı bulunamadı
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Arama veya filtre kriterlerine uygun kullanıcı yok.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4 font-semibold">Kullanıcı</th>
                  <th className="px-5 py-4 font-semibold">TC Kimlik No</th>
                  <th className="px-5 py-4 font-semibold">Mail</th>
                  <th className="px-5 py-4 font-semibold">Telefon</th>
                  <th className="px-5 py-4 font-semibold">Rol</th>
                  <th className="px-5 py-4 font-semibold">Durum</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    İşlem
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isPassive = user.status === "Pasif";
                  const isTcVisible = visibleTcIdSet.has(user.id);

                  return (
                    <tr
                      key={user.id}
                      className={[
                        "text-sm transition hover:bg-slate-50",
                        isPassive ? "text-slate-400" : "text-slate-700",
                      ].join(" ")}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={[
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold",
                              isPassive
                                ? "bg-slate-100 text-slate-400"
                                : "bg-slate-100 text-slate-700",
                            ].join(" ")}
                          >
                            {getInitials(user.fullName)}
                          </div>

                          <div>
                            <p
                              className={[
                                "font-semibold",
                                isPassive ? "text-slate-400" : "text-slate-900",
                              ].join(" ")}
                            >
                              {user.fullName}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Kayıtlı kullanıcı
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          <span
                            className={[
                              "font-mono tracking-wide",
                              isPassive ? "text-slate-400" : "text-slate-700",
                            ].join(" ")}
                          >
                            {isTcVisible ? user.tcNo : maskTcNo(user.tcNo)}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleTcVisibility(user.id)}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                            aria-label={
                              isTcVisible
                                ? "TC kimlik numarasını gizle"
                                : "TC kimlik numarasını göster"
                            }
                          >
                            {isTcVisible ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2">
                          <FiMail className="text-slate-400" />
                          {user.email}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex items-center gap-2">
                          <FiPhone className="text-slate-400" />
                          {user.phone}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                            isPassive
                              ? "bg-slate-100 text-slate-400"
                              : getRoleBadgeClass(user.role),
                          ].join(" ")}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(user.id)}
                          className={[
                            "inline-flex cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition",
                            user.status === "Aktif"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-50 text-red-700 hover:bg-red-100",
                          ].join(" ")}
                        >
                          {user.status}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onEditRole(user)}
                            className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <FiEdit2 />
                            Rol düzenle
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteUser(user)}
                            className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                          >
                            <FiTrash2 />
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {shouldShowPagination && (
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">
              {visibleStartIndex}-{visibleEndIndex}
            </span>{" "}
            arası gösteriliyor. Toplam{" "}
            <span className="font-semibold text-slate-900">
              {filteredUserCount}
            </span>{" "}
            kayıt.
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onGoToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft />
              Önceki
            </button>

            {visiblePageNumbers.map((page) => {
              const isSelected = page === currentPage;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onGoToPage(page)}
                  className={[
                    "h-10 min-w-10 cursor-pointer rounded-2xl px-3 text-sm font-semibold transition",
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => onGoToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sonraki
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </>
  );
}