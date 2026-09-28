import React, { useState } from "react";
import AdminUsers from "./AdminUsers";
import AdminGroups from "./AdminGroups";
import AdminAudit from "./AdminAudit";
import AdminCategories from "./AdminCategories";
import AdminBackup from "./AdminBackup";
import { formatCurrency } from "../../utils/formatters";
import {
  Shield,
  Users,
  Layers,
  Receipt,
  AlertTriangle,
  Settings,
  HardDrive,
  DollarSign
} from "lucide-react";

export default function AdminDashboard({
  appState,
  onUpdateUser,
  onAddUser,
  onUpdateGroup,
  onDeleteGroup,
  onResolveDispute,
  onAddCategory,
  onUpdateSettings,
  onResetToDemo,
  onRestoreState
}) {
  const [adminTab, setAdminTab] = useState("users"); // "users", "groups", "audit", "categories", "backup"

  const { users, groups, expenses, disputes, categories, settings } = appState;

  const totalVolume = expenses.filter(e => e.status !== "cancelled").reduce((s, e) => s + Number(e.amount), 0);
  const openDisputes = disputes.filter(d => d.status !== "resolved").length;

  return (
    <div>
      {/* Admin Hero Metric Header */}
      <div
        className="hero-banner"
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)",
          borderColor: "rgba(99, 102, 241, 0.3)"
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <span className="badge badge-purple">
                <Shield size={12} /> System Control Center
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Logged in as <strong>Platform Administrator</strong>
              </span>
            </div>

            <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
              Platform Operations &amp; Administration
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Supervise user accounts, audit multi-group transactions, resolve disputed splits, and govern system parameters.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="stat-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-label">
            <Users size={14} color="#818cf8" /> Total Registered Users
          </div>
          <div className="stat-val" style={{ color: "#818cf8" }}>
            {users.length}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {users.filter(u => u.status === "active").length} active accounts
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <Layers size={14} color="var(--primary)" /> Shared Expense Groups
          </div>
          <div className="stat-val positive">
            {groups.length}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {groups.filter(g => !g.archived).length} active collaboration spaces
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <DollarSign size={14} color="var(--primary)" /> Total Volume Transacted
          </div>
          <div className="stat-val positive mono">
            {formatCurrency(totalVolume)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Across {expenses.length} logged bills
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <AlertTriangle size={14} color={openDisputes > 0 ? "var(--amber)" : "var(--primary)"} /> Open Disputes
          </div>
          <div className="stat-val" style={{ color: openDisputes > 0 ? "var(--amber)" : "var(--primary)" }}>
            {openDisputes}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {openDisputes > 0 ? "Requires mediator attention" : "All disputes resolved"}
          </span>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${adminTab === "users" ? "active" : ""}`}
          onClick={() => setAdminTab("users")}
        >
          <Users size={16} /> User Accounts ({users.length})
        </button>
        <button
          className={`tab-btn ${adminTab === "groups" ? "active" : ""}`}
          onClick={() => setAdminTab("groups")}
        >
          <Layers size={16} /> Groups Oversight ({groups.length})
        </button>
        <button
          className={`tab-btn ${adminTab === "audit" ? "active" : ""}`}
          onClick={() => setAdminTab("audit")}
        >
          <Receipt size={16} /> Audit Ledger &amp; Disputes ({disputes.length})
        </button>
        <button
          className={`tab-btn ${adminTab === "categories" ? "active" : ""}`}
          onClick={() => setAdminTab("categories")}
        >
          <Settings size={16} /> Categories &amp; Settings
        </button>
        <button
          className={`tab-btn ${adminTab === "backup" ? "active" : ""}`}
          onClick={() => setAdminTab("backup")}
        >
          <HardDrive size={16} /> Database &amp; Backup
        </button>
      </div>

      {/* Tab Panels */}
      {adminTab === "users" && (
        <AdminUsers
          users={users}
          groups={groups}
          expenses={expenses}
          onUpdateUser={onUpdateUser}
          onAddUser={onAddUser}
        />
      )}

      {adminTab === "groups" && (
        <AdminGroups
          groups={groups}
          users={users}
          expenses={expenses}
          onUpdateGroup={onUpdateGroup}
          onDeleteGroup={onDeleteGroup}
        />
      )}

      {adminTab === "audit" && (
        <AdminAudit
          expenses={expenses}
          disputes={disputes}
          users={users}
          groups={groups}
          categories={categories}
          onResolveDispute={onResolveDispute}
        />
      )}

      {adminTab === "categories" && (
        <AdminCategories
          categories={categories}
          settings={settings}
          expenses={expenses}
          onAddCategory={onAddCategory}
          onUpdateSettings={onUpdateSettings}
        />
      )}

      {adminTab === "backup" && (
        <AdminBackup
          appState={appState}
          onResetToDemo={onResetToDemo}
          onRestoreState={onRestoreState}
        />
      )}
    </div>
  );
}
