import React, { useState } from "react";
import Modal from "./Modal";
import UserAvatar from "./UserAvatar";
import { Plus } from "lucide-react";

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreateGroup,
  users,
  activeUserId
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("apartment");
  const [currency, setCurrency] = useState("USD");
  const [selectedMembers, setSelectedMembers] = useState([activeUserId]);
  const [errorMsg, setErrorMsg] = useState("");

  const groupTypes = [
    { id: "apartment", label: "Apartment / Home", icon: "Home" },
    { id: "trip", label: "Trip / Vacation", icon: "Plane" },
    { id: "dining", label: "Food & Dining", icon: "Utensils" },
    { id: "project", label: "Project / Work", icon: "Briefcase" },
    { id: "couple", label: "Couple / Partner", icon: "Heart" }
  ];

  const handleToggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      if (selectedMembers.length <= 1) {
        setErrorMsg("Group must have at least one member.");
        return;
      }
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
    setErrorMsg("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Group name is required.");
      return;
    }
    if (selectedMembers.length === 0) {
      setErrorMsg("Please select at least one member.");
      return;
    }

    const newGroup = {
      id: "grp_" + Date.now(),
      name: name.trim(),
      description: description.trim(),
      type,
      icon: type === "apartment" ? "Home" : type === "trip" ? "Plane" : type === "dining" ? "Utensils" : "Home",
      currency,
      members: selectedMembers,
      createdBy: activeUserId,
      createdAt: new Date().toISOString().slice(0, 10),
      archived: false
    };

    onCreateGroup(newGroup);
    onClose();
    setName("");
    setDescription("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Expense Group"
      subtitle="Organize shared costs for your apartment, road trip, couple finances, or club."
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit}>
        {errorMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "var(--danger-bg)",
              border: "1px solid var(--danger)",
              borderRadius: "var(--radius-md)",
              color: "var(--danger)",
              fontSize: "0.85rem",
              marginBottom: "1rem"
            }}
          >
            {errorMsg}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Group Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Pinecrest Apt 4B, Euro Summer 2026, Tokyo Trip"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="What will this group share? e.g. Rent, groceries, tickets..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Group Category</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {groupTypes.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Default Currency</label>
            <select
              className="form-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="INR">INR (₹)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (CA$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>
        </div>

        {/* Members selector */}
        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
          <label className="form-label">Group Members ({selectedMembers.length} selected)</label>
          <div
            style={{
              maxHeight: "180px",
              overflowY: "auto",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "0.5rem"
            }}
          >
            {users.map(u => {
              const isChecked = selectedMembers.includes(u.id);
              return (
                <label
                  key={u.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.45rem 0.6rem",
                    borderRadius: "var(--radius-sm)",
                    background: isChecked ? "var(--bg-input)" : "transparent",
                    cursor: "pointer",
                    marginBottom: "2px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleMember(u.id)}
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <UserAvatar user={u} size="sm" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {u.name} {u.id === activeUserId ? "(You)" : ""}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {u.email}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> Create Group
          </button>
        </div>
      </form>
    </Modal>
  );
}
