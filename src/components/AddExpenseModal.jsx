import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import UserAvatar from "./UserAvatar";
import CategoryIcon from "./CategoryIcon";
import { computeSplits } from "../utils/calculations";
import { formatCurrency } from "../utils/formatters";
import { Plus, Users, User, DollarSign, Calendar, Tag, FileText, Check } from "lucide-react";

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSaveExpense,
  users,
  groups,
  categories,
  activeUserId,
  preselectedGroupId = null
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("dining");
  const [groupId, setGroupId] = useState(preselectedGroupId || (groups[0]?.id || ""));
  const [paidBy, setPaidBy] = useState(activeUserId);
  const [splitType, setSplitType] = useState("equal");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [customInputs, setCustomInputs] = useState({});
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Update members when group changes
  useEffect(() => {
    if (groupId && groupId !== "direct") {
      const grp = groups.find(g => g.id === groupId);
      if (grp) {
        setSelectedMemberIds(grp.members);
        setCurrency(grp.currency || "USD");
      }
    } else {
      // Direct split or all users
      setSelectedMemberIds(users.map(u => u.id));
    }
    setCustomInputs({});
  }, [groupId, groups, users]);

  useEffect(() => {
    if (preselectedGroupId) {
      setGroupId(preselectedGroupId);
    }
  }, [preselectedGroupId]);

  // Compute live preview of splits
  const liveSplits = computeSplits({
    amount: parseFloat(amount) || 0,
    splitType,
    selectedMembers: selectedMemberIds,
    customInputs
  });

  const numAmount = parseFloat(amount) || 0;

  // Validation checks
  let validationError = "";
  if (splitType === "exact") {
    const totalExact = Object.values(customInputs).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const diff = Math.round((numAmount - totalExact) * 100) / 100;
    if (Math.abs(diff) > 0.01) {
      validationError = `Exact splits total (${formatCurrency(totalExact, currency)}) must match amount (${formatCurrency(numAmount, currency)}). Diff: ${formatCurrency(diff, currency)}`;
    }
  } else if (splitType === "percentage") {
    const totalPct = Object.values(customInputs).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    if (Math.round(totalPct) !== 100) {
      validationError = `Percentages must add up to 100% (currently ${totalPct}%).`;
    }
  }

  const handleMemberToggle = (userId) => {
    if (selectedMemberIds.includes(userId)) {
      if (selectedMemberIds.length === 1) {
        setErrorMsg("At least one member must be selected.");
        return;
      }
      setSelectedMemberIds(selectedMemberIds.filter(id => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
    setErrorMsg("");
  };

  const handleCustomInputChange = (userId, value) => {
    setCustomInputs(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg("Please provide an expense description.");
      return;
    }
    if (!amount || numAmount <= 0) {
      setErrorMsg("Please enter a valid amount greater than 0.");
      return;
    }
    if (selectedMemberIds.length === 0) {
      setErrorMsg("Please select at least one person to split with.");
      return;
    }
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    const newExpense = {
      id: "exp_" + Date.now(),
      groupId: groupId === "direct" ? null : groupId,
      description: description.trim(),
      amount: numAmount,
      currency,
      date,
      category,
      paidBy,
      splitType,
      splits: liveSplits,
      notes: notes.trim(),
      receiptUrl: "",
      status: "active",
      createdAt: new Date().toISOString()
    };

    onSaveExpense(newExpense);
    onClose();
    // Reset fields
    setDescription("");
    setAmount("");
    setNotes("");
    setErrorMsg("");
  };

  const currentGroup = groups.find(g => g.id === groupId);
  const eligibleUsers = currentGroup
    ? users.filter(u => currentGroup.members.includes(u.id))
    : users;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Expense"
      subtitle="Log a shared bill, split amounts accurately, and keep everyone in sync."
      maxWidth="640px"
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

        {/* Group or Direct Split */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Split In Group</label>
            <select
              className="form-select"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <optgroup label="Your Groups">
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </optgroup>
              <option value="direct">Direct 1-on-1 (Non-Group)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description & Amount */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Grocery haul, Dinner, Uber ride, Utilities"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 150px", gap: "1rem", marginBottom: "1.25rem" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Amount</label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{ paddingLeft: "2rem", fontWeight: 700, fontSize: "1.1rem" }}
              />
              <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                $
              </span>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Currency</label>
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

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Paid By Selector */}
        <div className="form-group">
          <label className="form-label">Paid By</label>
          <select
            className="form-select"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            {eligibleUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} {u.id === activeUserId ? "(You)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Split Mode Selector */}
        <div className="form-group">
          <label className="form-label">Split Method</label>
          <div className="split-mode-pills">
            <button
              type="button"
              className={`split-mode-pill ${splitType === "equal" ? "active" : ""}`}
              onClick={() => setSplitType("equal")}
            >
              = Equally
            </button>
            <button
              type="button"
              className={`split-mode-pill ${splitType === "exact" ? "active" : ""}`}
              onClick={() => setSplitType("exact")}
            >
              $ Exact Amounts
            </button>
            <button
              type="button"
              className={`split-mode-pill ${splitType === "percentage" ? "active" : ""}`}
              onClick={() => setSplitType("percentage")}
            >
              % Percentages
            </button>
            <button
              type="button"
              className={`split-mode-pill ${splitType === "shares" ? "active" : ""}`}
              onClick={() => setSplitType("shares")}
            >
              ⚖ By Shares
            </button>
          </div>
        </div>

        {/* Member Selector & Custom Input per member */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1.25rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
              Split Between ({selectedMemberIds.length} members)
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                if (selectedMemberIds.length === eligibleUsers.length) {
                  setSelectedMemberIds([paidBy]);
                } else {
                  setSelectedMemberIds(eligibleUsers.map(u => u.id));
                }
              }}
            >
              {selectedMemberIds.length === eligibleUsers.length ? "Select Only Me" : "Select All"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {eligibleUsers.map(u => {
              const isSelected = selectedMemberIds.includes(u.id);
              const splitItem = liveSplits.find(s => s.userId === u.id);

              return (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--radius-md)",
                    background: isSelected ? "var(--bg-input)" : "transparent",
                    border: "1px solid",
                    borderColor: isSelected ? "var(--border-hover)" : "transparent"
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      cursor: "pointer",
                      flex: 1
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleMemberToggle(u.id)}
                      style={{ accentColor: "var(--primary)", width: "16px", height: "16px" }}
                    />
                    <UserAvatar user={u} size="sm" />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                      {u.name} {u.id === activeUserId ? "(You)" : ""}
                    </span>
                  </label>

                  {/* Split Input controls based on type */}
                  {isSelected && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {splitType === "exact" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>$</span>
                          <input
                            type="number"
                            step="0.01"
                            style={{
                              width: "80px",
                              padding: "0.3rem 0.5rem",
                              background: "var(--bg-surface)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "var(--radius-sm)",
                              color: "var(--text-main)",
                              textAlign: "right"
                            }}
                            placeholder="0.00"
                            value={customInputs[u.id] || ""}
                            onChange={(e) => handleCustomInputChange(u.id, e.target.value)}
                          />
                        </div>
                      )}

                      {splitType === "percentage" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            style={{
                              width: "60px",
                              padding: "0.3rem 0.5rem",
                              background: "var(--bg-surface)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "var(--radius-sm)",
                              color: "var(--text-main)",
                              textAlign: "right"
                            }}
                            placeholder="%"
                            value={customInputs[u.id] || ""}
                            onChange={(e) => handleCustomInputChange(u.id, e.target.value)}
                          />
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>%</span>
                        </div>
                      )}

                      {splitType === "shares" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            style={{
                              width: "55px",
                              padding: "0.3rem 0.5rem",
                              background: "var(--bg-surface)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "var(--radius-sm)",
                              color: "var(--text-main)",
                              textAlign: "right"
                            }}
                            placeholder="1"
                            value={customInputs[u.id] || "1"}
                            onChange={(e) => handleCustomInputChange(u.id, e.target.value)}
                          />
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>shares</span>
                        </div>
                      )}

                      <span
                        className="mono"
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: "var(--primary)",
                          minWidth: "70px",
                          textAlign: "right"
                        }}
                      >
                        {splitItem ? formatCurrency(splitItem.amount, currency) : "$0.00"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {validationError && (
            <div style={{ marginTop: "0.75rem", color: "var(--danger)", fontSize: "0.8rem", fontWeight: 600 }}>
              ⚠ {validationError}
            </div>
          )}
        </div>

        {/* Optional Notes */}
        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
          <label className="form-label">Notes & Receipt Info</label>
          <input
            type="text"
            className="form-input"
            placeholder="Add context, store location, or receipt details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Submit Actions */}
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!!validationError || numAmount <= 0}
          >
            <Check size={18} /> Save Expense
          </button>
        </div>
      </form>
    </Modal>
  );
}
