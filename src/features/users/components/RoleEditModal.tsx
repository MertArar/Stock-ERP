"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown, FiX } from "react-icons/fi";

import type { AppUser, SelectOption } from "../types/users"

type RoleEditModalProps = {
  user: AppUser;
  roleOptions: SelectOption[];
  onClose: () => void;
  onSave: (userId: string, role: string) => void;
};

type InlineSelectProps = {
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
};

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

export default function RoleEditModal({
  user,
  roleOptions,
  onClose,
  onSave,
}: RoleEditModalProps) {
  const [selectedRole, setSelectedRole] = useState(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Kullanıcı Rolünü Düzenle
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Kullanıcı kayıtlı gelir; burada yalnızca rolünü değiştirirsin.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">
              {user.fullName}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {user.tcNo} • {user.email}
            </p>

            <p className="mt-3 text-xs font-medium text-slate-400">
              Mevcut rol
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {user.role}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Rol seçimi
            </label>

            <InlineSelect
              value={selectedRole}
              options={roleOptions}
              placeholder="Rol seç"
              onChange={setSelectedRole}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={() => onSave(user.id, selectedRole)}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiCheck />
            Rolü güncelle
          </button>
        </div>
      </div>
    </div>
  );
}