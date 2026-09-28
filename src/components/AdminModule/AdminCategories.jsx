import React, { useState } from "react";
import CategoryIcon from "../CategoryIcon";
import { Plus, Tag, Settings, Check, Sliders } from "lucide-react";

export default function AdminCategories({
  categories,
  settings,
  expenses,
  onAddCategory,
  onUpdateSettings
}) {
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Tag");
  const [newCatColor, setNewCatColor] = useState("#10b981");

  const [formSettings, setFormSettings] = useState({ ...settings });
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat = {
      id: newCatName.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      name: newCatName.trim(),
      icon: newCatIcon,
      color: newCatColor,
      bg: `${newCatColor}25`
    };

    onAddCategory(newCat);
    setNewCatName("");
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    onUpdateSettings(formSettings);
    setSavedSettingsMsg(true);
    setTimeout(() => setSavedSettingsMsg(false), 2500);
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Categories &amp; Platform Settings</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          Configure shared expense categories, active currencies, and algorithmic debt rules.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1.5rem" }}>
        {/* Categories Manager */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Tag size={18} color="var(--primary)" /> Active Expense Categories ({categories.length})
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.5rem" }}>
            {categories.map(cat => {
              const count = expenses.filter(e => e.category === cat.id).length;

              return (
                <div
                  key={cat.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <CategoryIcon
                      iconName={cat.icon}
                      color={cat.color}
                      bg={cat.bg}
                      size={18}
                    />
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{cat.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        ID: {cat.id}
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-purple">
                    {count} {count === 1 ? "expense" : "expenses"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Add Category Form */}
          <form
            onSubmit={handleCreateCategory}
            style={{
              padding: "1rem",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Add New Custom Category
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 60px", gap: "0.75rem", alignItems: "flex-end" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.75rem" }}>Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Pet Care"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.75rem" }}>Icon</label>
                <select
                  className="form-select"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                >
                  <option value="Tag">Tag</option>
                  <option value="ShoppingCart">Shopping Cart</option>
                  <option value="Home">Home</option>
                  <option value="Utensils">Utensils</option>
                  <option value="Plane">Plane</option>
                  <option value="Film">Film</option>
                  <option value="Zap">Zap</option>
                  <option value="HeartPulse">Heart Pulse</option>
                  <option value="Coffee">Coffee</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.75rem" }}>Color</label>
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  style={{ width: "100%", height: "38px", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", background: "none" }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-secondary btn-sm" style={{ marginTop: "0.75rem", width: "100%" }}>
              <Plus size={14} /> Add Category
            </button>
          </form>
        </div>

        {/* Global Configuration Parameters */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sliders size={18} color="var(--secondary)" /> System Parameters
            </h3>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label className="form-label">Platform Application Name</label>
              <input
                type="text"
                className="form-input"
                value={formSettings.appName || ""}
                onChange={(e) => setFormSettings({ ...formSettings, appName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Base Default Currency</label>
              <select
                className="form-select"
                value={formSettings.defaultCurrency || "USD"}
                onChange={(e) => setFormSettings({ ...formSettings, defaultCurrency: e.target.value })}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="INR">INR (₹)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (CA$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Default Debt Simplification Strategy</label>
              <select
                className="form-select"
                value={formSettings.simplifyDebtsDefault ? "true" : "false"}
                onChange={(e) => setFormSettings({ ...formSettings, simplifyDebtsDefault: e.target.value === "true" })}
              >
                <option value="true">Enabled (Greedy Min-Cash-Flow Minimizer)</option>
                <option value="false">Disabled (Show Raw Pairwise Debts)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Max Members Per Group</label>
              <input
                type="number"
                className="form-input"
                min="2"
                max="500"
                value={formSettings.maxGroupSize || 50}
                onChange={(e) => setFormSettings({ ...formSettings, maxGroupSize: parseInt(e.target.value) || 50 })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Pending Debt Reminder Highlight (Days)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="90"
                value={formSettings.autoReminderDays || 7}
                onChange={(e) => setFormSettings({ ...formSettings, autoReminderDays: parseInt(e.target.value) || 7 })}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Unsettled expenses older than this will display a reminder badge.
              </span>
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: "100%" }}>
              {savedSettingsMsg ? <Check size={16} /> : <Settings size={16} />}
              {savedSettingsMsg ? "Configuration Saved!" : "Save System Settings"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
