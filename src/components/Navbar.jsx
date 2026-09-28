import React, { useState } from "react";
import UserAvatar from "./UserAvatar";
import {
  Wallet,
  Layers,
  Users,
  Receipt,
  BarChart3,
  Shield,
  Sun,
  Moon,
  Plus,
  Bell,
  ChevronDown
} from "lucide-react";

export default function Navbar({
  activeRole,
  setActiveRole,
  activeTab,
  setActiveTab,
  activeUser,
  users,
  onSwitchUser,
  theme,
  onToggleTheme,
  onOpenAddExpense,
  onOpenNotifications,
  unreadRemindersCount
}) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <Wallet size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span>Share</span>
              <span className="brand-text-highlight">Wise</span>
            </div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Expense Sharing &amp; Debts
            </div>
          </div>
        </div>

        {/* User Navigation Tabs (when in User Mode) */}
        {activeRole === "user" ? (
          <nav className="nav-links">
            <button
              className={`nav-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Layers size={16} /> Dashboard
            </button>
            <button
              className={`nav-tab-btn ${activeTab === "groups" ? "active" : ""}`}
              onClick={() => setActiveTab("groups")}
            >
              <Users size={16} /> Groups
            </button>
            <button
              className={`nav-tab-btn ${activeTab === "expenses" ? "active" : ""}`}
              onClick={() => setActiveTab("expenses")}
            >
              <Receipt size={16} /> Expenses
            </button>
            <button
              className={`nav-tab-btn ${activeTab === "friends" ? "active" : ""}`}
              onClick={() => setActiveTab("friends")}
            >
              <Users size={16} /> Friends
            </button>
            <button
              className={`nav-tab-btn ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart3 size={16} /> Analytics
            </button>
          </nav>
        ) : (
          <nav className="nav-links">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 0.8rem",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: "var(--radius-md)",
                color: "#818cf8",
                fontWeight: 700,
                fontSize: "0.85rem"
              }}
            >
              <Shield size={16} /> Admin Management Console
            </div>
          </nav>
        )}

        {/* Right Controls */}
        <div className="nav-right-controls">
          {/* Quick Add Expense Button */}
          {activeRole === "user" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenAddExpense}
              title="Add New Shared Expense"
            >
              <Plus size={16} /> Add Expense
            </button>
          )}

          {/* Role Pill Switcher */}
          <div className="role-pill-switch" title="Switch between User App and Admin Control Panel">
            <button
              type="button"
              className={`role-pill-btn ${activeRole === "user" ? "active-user" : ""}`}
              onClick={() => setActiveRole("user")}
            >
              <Users size={13} /> User
            </button>
            <button
              type="button"
              className={`role-pill-btn ${activeRole === "admin" ? "active-admin" : ""}`}
              onClick={() => setActiveRole("admin")}
            >
              <Shield size={13} /> Admin
            </button>
          </div>

          {/* Switch User Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ padding: "0.3rem 0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              title="Switch demo user profile"
            >
              <UserAvatar user={activeUser} size="sm" showRole />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis" }}>
                {activeUser?.name?.split(" ")[0]}
              </span>
              <ChevronDown size={14} />
            </button>

            {userDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "6px",
                  width: "230px",
                  background: "var(--bg-modal)",
                  border: "1px solid var(--border-hover)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-xl)",
                  padding: "0.5rem",
                  zIndex: 80
                }}
              >
                <div style={{ padding: "0.4rem 0.6rem", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Switch Profile
                </div>
                {users.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.45rem 0.6rem",
                      borderRadius: "var(--radius-sm)",
                      background: u.id === activeUser?.id ? "var(--bg-input)" : "transparent",
                      textAlign: "left"
                    }}
                    onClick={() => {
                      onSwitchUser(u.id);
                      setUserDropdownOpen(false);
                    }}
                  >
                    <UserAvatar user={u} size="sm" showRole />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        {u.role === "admin" ? "Platform Admin" : "Member"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <button
            type="button"
            className="btn-icon"
            style={{ position: "relative" }}
            onClick={onOpenNotifications}
            title="Notifications & Reminders"
          >
            <Bell size={18} />
            {unreadRemindersCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-3px",
                  right: "-3px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "var(--danger)",
                  color: "#ffffff",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--bg-surface)"
                }}
              >
                {unreadRemindersCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="btn-icon"
            onClick={onToggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
