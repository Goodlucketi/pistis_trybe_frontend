import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({ isOpen, title, message, confirmLabel = "Confirm", onConfirm, onCancel, danger = true }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full">
          <X className="w-4 h-4 text-gray-400" />
        </button>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${danger ? "bg-red-100" : "bg-amber-100"}`}>
          <AlertTriangle className={`w-6 h-6 ${danger ? "text-red-600" : "text-amber-600"}`} />
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition ${danger ? "bg-red-600 hover:bg-red-700" : "bg-[#401667] hover:bg-[#2e1048]"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
