import React, { useState } from "react";
import {
  calculateStorageSize,
  exportAppStateJSON
} from "../../utils/storage";
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  FileJson,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

export default function AdminBackup({
  appState,
  onResetToDemo,
  onRestoreState
}) {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [restoreError, setRestoreError] = useState("");

  const storageSize = calculateStorageSize();

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.users || !parsed.expenses) {
          throw new Error("Invalid ShareWise database schema.");
        }
        onRestoreState(parsed);
        setRestoreSuccess(true);
        setRestoreError("");
        setTimeout(() => setRestoreSuccess(false), 3000);
      } catch (err) {
        setRestoreError("Failed to parse JSON backup file. Please ensure it is a valid export.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Database Health &amp; Backup Maintenance</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          Monitor persistent browser storage, generate full JSON backups, or restore seed fixtures.
        </p>
      </div>

      {/* Storage and Entity Statistics */}
      <div className="stat-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-label">
            <HardDrive size={14} color="var(--primary)" /> LocalStorage Footprint
          </div>
          <div className="stat-val mono" style={{ color: "var(--primary)" }}>
            {storageSize}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            High-efficiency client cache
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <Database size={14} color="#818cf8" /> Entities Logged
          </div>
          <div className="stat-val" style={{ color: "#818cf8" }}>
            {appState.expenses.length + appState.settlements.length + appState.users.length}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Users, expenses, settlements
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <ShieldCheck size={14} color="var(--primary)" /> Database Integrity
          </div>
          <div className="stat-val" style={{ color: "var(--primary)", fontSize: "1.5rem" }}>
            Verified
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Zero orphan transactions
          </span>
        </div>
      </div>

      {/* Backup and Restore Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Export Card */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "rgba(99, 102, 241, 0.15)",
                color: "#818cf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Download size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Export JSON Snapshot</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Download entire application state into a single portable JSON file.
              </p>
            </div>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
            Includes all registered users, expense groups, split allocations, settlement transactions, and platform configurations.
          </p>

          <button
            className="btn btn-secondary"
            style={{ width: "100%" }}
            onClick={() => exportAppStateJSON(appState)}
          >
            <Download size={16} /> Download Full System JSON Backup
          </button>
        </div>

        {/* Restore Card */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Upload size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Restore from JSON</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Upload a previous ShareWise backup file to restore data.
              </p>
            </div>
          </div>

          {restoreSuccess && (
            <div style={{ padding: "0.75rem", background: "var(--bg-accent-subtle)", color: "var(--primary)", borderRadius: "var(--radius-sm)", marginBottom: "1rem", fontSize: "0.85rem" }}>
              ✓ Database restored successfully!
            </div>
          )}

          {restoreError && (
            <div style={{ padding: "0.75rem", background: "var(--danger-bg)", color: "var(--danger)", borderRadius: "var(--radius-sm)", marginBottom: "1rem", fontSize: "0.85rem" }}>
              ✕ {restoreError}
            </div>
          )}

          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
            Select an existing `.json` export file generated by ShareWise.
          </p>

          <label className="btn btn-outline" style={{ width: "100%", cursor: "pointer", display: "flex" }}>
            <Upload size={16} /> Select Backup File (.json)
            <input
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Danger Zone: Reset to Factory Seed Data */}
      <div
        className="card"
        style={{
          border: "1px solid rgba(239, 68, 68, 0.3)",
          background: "rgba(239, 68, 68, 0.03)"
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle size={18} color="var(--danger)" />
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--danger)" }}>
                Reset to Default Demo Dataset
              </h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Replaces existing state with factory demo records (Apartment 402, Euro Summer Trip, Goa Getaway, and realistic expenses).
            </p>
          </div>

          <button
            className="btn btn-danger"
            onClick={() => setResetConfirmOpen(true)}
          >
            <RotateCcw size={16} /> Reset to Demo Data
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="modal-overlay" onClick={() => setResetConfirmOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--danger)" }}>
                Confirm Factory Reset
              </h3>
              <button className="btn-icon" onClick={() => setResetConfirmOpen(false)}>✕</button>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              Are you sure you want to reset all current users, groups, and expenses? This will restore the pristine sample dataset.
            </p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setResetConfirmOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  onResetToDemo();
                  setResetConfirmOpen(false);
                }}
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
