"use client";

import { FiInfo, FiTrash2 } from "react-icons/fi";

export type CategoryToastState = {
  type: "success" | "info" | "delete";
  title: string;
  message: string;
};

type CategoryToastProps = {
  toast: CategoryToastState | null;
};

function getToastStyles(type: CategoryToastState["type"]) {
  switch (type) {
    case "success":
      return {
        wrapper: "border-emerald-200 bg-white",
        iconWrapper: "bg-emerald-100 text-emerald-700",
      };
    case "delete":
      return {
        wrapper: "border-rose-200 bg-white",
        iconWrapper: "bg-rose-100 text-rose-700",
      };
    case "info":
    default:
      return {
        wrapper: "border-slate-200 bg-white",
        iconWrapper: "bg-slate-100 text-slate-700",
      };
  }
}

function AnimatedCheckIcon() {
  return (
    <>
      <style>
        {`
          @keyframes category-check-draw {
            from {
              stroke-dashoffset: 26;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>

      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 12.5L9.5 17L19 7"
          stroke="currentColor"
          strokeWidth="2.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 26,
            strokeDashoffset: 26,
            animation: "category-check-draw 650ms ease-out forwards",
          }}
        />
      </svg>
    </>
  );
}

export default function CategoryToast({ toast }: CategoryToastProps) {
  if (!toast) return null;

  const styles = getToastStyles(toast.type);

  return (
    <div
      className={`fixed right-6 top-6 z-[95] w-[calc(100%-3rem)] max-w-sm rounded-3xl border p-4 shadow-2xl ${styles.wrapper}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.iconWrapper}`}
        >
          {toast.type === "success" ? (
            <AnimatedCheckIcon />
          ) : toast.type === "delete" ? (
            <FiTrash2 size={22} />
          ) : (
            <FiInfo size={22} />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-950">{toast.title}</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {toast.message}
          </p>
        </div>
      </div>
    </div>
  );
}