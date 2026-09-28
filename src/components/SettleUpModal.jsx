import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Modal from "./Modal";
import UserAvatar from "./UserAvatar";
import { Check, ArrowRight } from "lucide-react";

export default function SettleUpModal({
  isOpen,
  onClose,
  onRecordSettlement,
  users,
  groups,
  activeUserId,
  prefillData = null
}) {
  const [fromUserId, setFromUserId] = useState(activeUserId);
  const [toUserId, setToUserId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Venmo");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (prefillData) {
      if (prefillData.fromUserId) setFromUserId(prefillData.fromUserId);
      if (prefillData.toUserId) setToUserId(prefillData.toUserId);
      if (prefillData.groupId) setGroupId(prefillData.groupId);
      if (prefillData.amount) setAmount(prefillData.amount.toString());
      if (prefillData.notes) setNotes(prefillData.notes);
    } else {
      // Pick first non-active user as default recipient
      const otherUser = users.find(u => u.id !== activeUserId);
      if (otherUser && !toUserId) {
        setToUserId(otherUser.id);
      }
    }
  }, [prefillData, activeUserId, users]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg("Please enter a valid payment amount.");
      return;
    }
    if (!fromUserId || !toUserId || fromUserId === toUserId) {
      setErrorMsg("Payer and recipient must be two different people.");
      return;
    }

    const newSettlement = {
      id: "stl_" + Date.now(),
      groupId: groupId || null,
      fromUserId,
      toUserId,
      amount: numAmount,
      currency: "USD",
      date: new Date().toISOString().slice(0, 10),
      paymentMethod,
      notes: notes.trim() || `Payment via ${paymentMethod}`,
      status: "completed",
      createdAt: new Date().toISOString()
    };

    // Confetti celebration!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.warn("Confetti error:", err);
    }

    onRecordSettlement(newSettlement);
    onClose();
    setErrorMsg("");
  };

  const payer = users.find(u => u.id === fromUserId);
  const payee = users.find(u => u.id === toUserId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settle Balance & Record Payment"
      subtitle="Record a direct payment between friends to square away outstanding balances."
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

        {/* Visual transfer preview banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-input)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            marginBottom: "1.5rem"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <UserAvatar user={payer} size="lg" />
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
              {payer?.name || "Payer"}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Payer</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "var(--bg-accent-subtle)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <ArrowRight size={20} />
            </div>
            <span className="mono" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary)" }}>
              {amount ? formatCurrency(parseFloat(amount) || 0) : "$0.00"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <UserAvatar user={payee} size="lg" />
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
              {payee?.name || "Recipient"}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Recipient</span>
          </div>
        </div>

        {/* Payer and Recipient Selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Who Paid?</label>
            <select
              className="form-select"
              value={fromUserId}
              onChange={(e) => setFromUserId(e.target.value)}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.id === activeUserId ? "(You)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Paid To Whom?</label>
            <select
              className="form-select"
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
            >
              {users.map(u => (
                <option key={u.id} value={u.id} disabled={u.id === fromUserId}>
                  {u.name} {u.id === activeUserId ? "(You)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount & Group */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Settlement Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-input mono"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ fontWeight: 700, fontSize: "1.1rem" }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Associate With Group</label>
            <select
              className="form-select"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">Direct (No Specific Group)</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Method */}
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
            {["Venmo", "Cash", "UPI / GPay", "PayPal", "Bank Transfer", "Revolut"].map(method => (
              <button
                type="button"
                key={method}
                className={`split-mode-pill ${paymentMethod === method ? "active" : ""}`}
                onClick={() => setPaymentMethod(method)}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
          <label className="form-label">Notes / Transaction Reference</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Settle February rent, Paid via Venmo @sarahchen"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Check size={18} /> Record Settlement
          </button>
        </div>
      </form>
    </Modal>
  );
}
