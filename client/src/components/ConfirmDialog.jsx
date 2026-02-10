import React from "react";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Delete",
  cancelText = "Cancel",
  onCancel,
  onConfirm,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onCancel?.()}
    >
      <div className="w-full max-w-md rounded-2xl border border-yellow-400/20 bg-zinc-900 p-6 shadow-xl">
        <h3 className="text-xl font-bold text-yellow-400">{title}</h3>
        <p className="mt-3 text-gray-300">{message}</p>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-gray-200 hover:bg-zinc-700 transition disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition disabled:opacity-50"
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
