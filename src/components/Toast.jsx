import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let iconColor = "var(--primary)";

        if (toast.type === "error") {
          Icon = AlertCircle;
          iconColor = "var(--danger)";
        } else if (toast.type === "info") {
          Icon = Info;
          iconColor = "var(--info)";
        }

        return (
          <div key={toast.id} className={`toast toast-${toast.type || "success"}`}>
            <Icon size={20} color={iconColor} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: "0.875rem" }}>
              {toast.title && <div style={{ fontWeight: 700 }}>{toast.title}</div>}
              <div style={{ color: "var(--text-secondary)" }}>{toast.message}</div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{ color: "var(--text-muted)", padding: "2px" }}
              aria-label="Dismiss toast"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
