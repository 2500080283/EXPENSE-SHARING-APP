import React from "react";
import UserAvatar from "./UserAvatar";
import { formatCurrency, formatRelativeTime } from "../utils/formatters";
import { Bell, X } from "lucide-react";

export default function NotificationDrawer({
  isOpen,
  onClose,
  reminders,
  activeUserId,
  users,
  onSettleFromReminder,
  onDismissReminder
}) {
  if (!isOpen) return null;

  // Filter reminders related to activeUser
  const myReminders = reminders.filter(
    r => r.toUserId === activeUserId || r.fromUserId === activeUserId
  );

  return (
    <div
      style={{
        position: "fixed",
        top: "70px",
        right: "1.5rem",
        width: "380px",
        maxWidth: "calc(100vw - 3rem)",
        maxHeight: "520px",
        background: "var(--bg-modal)",
        border: "1px solid var(--border-hover)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "scaleUp 0.2s ease-out"
      }}
    >
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.02)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Bell size={18} color="var(--primary)" />
          <h4 style={{ fontSize: "1rem", fontWeight: 700 }}>Notifications &amp; Reminders</h4>
        </div>
        <button className="btn-icon" style={{ width: "30px", height: "30px" }} onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div style={{ overflowY: "auto", padding: "1rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {myReminders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
            <Bell size={32} style={{ margin: "0 auto 0.75rem auto", opacity: 0.3 }} />
            <p style={{ fontSize: "0.875rem" }}>No reminders or notifications right now.</p>
            <p style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>You are all caught up!</p>
          </div>
        ) : (
          myReminders.map(rem => {
            const isReceived = rem.toUserId === activeUserId;
            const sender = users.find(u => u.id === rem.fromUserId);
            const recipient = users.find(u => u.id === rem.toUserId);

            return (
              <div
                key={rem.id}
                style={{
                  background: isReceived ? "var(--bg-input)" : "rgba(255,255,255,0.02)",
                  border: "1px solid",
                  borderColor: isReceived ? "rgba(16, 185, 129, 0.2)" : "var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <UserAvatar user={isReceived ? sender : recipient} size="sm" />
                    <div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                        {isReceived ? sender?.name : `To: ${recipient?.name}`}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        {formatRelativeTime(rem.sentAt)}
                      </div>
                    </div>
                  </div>

                  <span
                    className="mono"
                    style={{
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      color: isReceived ? "var(--danger)" : "var(--primary)"
                    }}
                  >
                    {formatCurrency(rem.amount)}
                  </span>
                </div>

                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  {rem.message}
                </p>

                {isReceived && (
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, padding: "0.3rem" }}
                      onClick={() => {
                        onSettleFromReminder(rem);
                        onClose();
                      }}
                    >
                      Settle Now
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ padding: "0.3rem 0.5rem" }}
                      onClick={() => onDismissReminder(rem.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
