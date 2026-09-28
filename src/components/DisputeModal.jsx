import React, { useState } from "react";
import Modal from "./Modal";
import { AlertCircle, Send } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

export default function DisputeModal({
  isOpen,
  onClose,
  expense,
  activeUserId,
  onSubmitDispute
}) {
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!expense) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg("Please state the reason for disputing this expense.");
      return;
    }

    const disputeRecord = {
      id: "dsp_" + Date.now(),
      expenseId: expense.id,
      reportedBy: activeUserId,
      reason: reason.trim(),
      status: "under_review",
      resolutionNotes: "",
      resolvedBy: null,
      createdAt: new Date().toISOString()
    };

    onSubmitDispute(disputeRecord);
    onClose();
    setReason("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Expense Dispute"
      subtitle="Flag an inaccurate split or disputed charge for administrator mediation."
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: "var(--amber-bg)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1.25rem",
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-start"
          }}
        >
          <AlertCircle size={20} color="var(--amber)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)" }}>
              Disputing: {expense.description} ({formatCurrency(expense.amount, expense.currency)})
            </div>
            <div style={{ fontSize: "0.775rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
              Our platform admin team will review split ratios, original payer notes, and mediate fairly.
            </div>
          </div>
        </div>

        {errorMsg && (
          <div style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            {errorMsg}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
          <label className="form-label">Explain Discrepancy or Dispute Reason</label>
          <textarea
            className="form-textarea"
            rows="4"
            placeholder="e.g., I was not present at this dinner, or my split percentage should have been 20% instead of 33%..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-danger">
            <Send size={16} /> Submit for Admin Review
          </button>
        </div>
      </form>
    </Modal>
  );
}
