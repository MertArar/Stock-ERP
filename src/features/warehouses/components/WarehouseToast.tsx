"use client";

import { FiInfo, FiTrash2 } from "react-icons/fi";

export type WarehouseToastState = {
  type: "success" | "info" | "delete";
  title: string;
  message: string;
};

type WarehouseToastProps = {
  toast: WarehouseToastState | null;
};

function AnimatedCheckIcon() {
  return (
    <>
      <style>
        {`
          @keyframes warehouse-check-draw {
            from {
              stroke-dashoffset: 26;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>

      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12.5L9.5 17L19 7"
          stroke="currentColor"
          strokeWidth="2.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 26,
            strokeDashoffset: 26,
            animation: "warehouse-check-draw 650ms ease-out forwards",
          }}
        />
      </svg>
    </>
  );
}

export default function WarehouseToast({ toast }: WarehouseToastProps) {
  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isDelete = toast.type === "delete";

  return (
    <div className="fixed right-6 top-6 z-[95] w-[calc(100%-3rem)] max-w-sm rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            isSuccess
              ? "bg-emerald-100 text-emerald-700"
              : isDelete
              ? "bg-rose-100 text-rose-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {isSuccess ? (
            <AnimatedCheckIcon />
          ) : isDelete ? (
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