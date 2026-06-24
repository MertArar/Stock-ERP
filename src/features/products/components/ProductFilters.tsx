"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown, FiSearch, FiX } from "react-icons/fi";

type ProductFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onClearCategories: () => void;
};

export default function ProductFilters({
  search,
  onSearchChange,
  categories,
  selectedCategories,
  onCategoryToggle,
  onClearCategories,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const hasSelectedCategory = selectedCategories.length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-slate-400 focus-within:bg-white">
          <FiSearch className="shrink-0 text-slate-400" size={18} />

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            type="text"
            placeholder="Ürün adı, ürün kodu veya kategori ara..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              aria-label="Aramayı temizle"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:bg-white focus:border-slate-400 focus:outline-none"
          >
            <span className="truncate">
              {hasSelectedCategory
                ? `${selectedCategories.length} kategori seçildi`
                : "Kategori filtrele"}
            </span>

            <FiChevronDown
              size={18}
              className={`shrink-0 text-slate-400 transition ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-14 z-30 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="max-h-72 space-y-1 overflow-y-auto">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category);

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => onCategoryToggle(category)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        isSelected
                          ? "bg-slate-950 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      <span className="truncate">{category}</span>

                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                          isSelected
                            ? "border-white bg-white text-slate-950"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && <FiCheck size={14} />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {hasSelectedCategory && (
                <div className="mt-2 border-t border-slate-100 pt-2">
                  <button
                    type="button"
                    onClick={onClearCategories}
                    className="w-full rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    Kategorileri temizle
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {hasSelectedCategory && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryToggle(category)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
            >
              {category}
              <FiX size={14} />
            </button>
          ))}

          <button
            type="button"
            onClick={onClearCategories}
            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-950"
          >
            Tümünü temizle
          </button>
        </div>
      )}
    </div>
  );
}