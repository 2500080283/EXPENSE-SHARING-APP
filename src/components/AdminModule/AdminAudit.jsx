import React, { useState } from "react";
import UserAvatar from "../UserAvatar";
import CategoryIcon from "../CategoryIcon";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Check,
  XCircle,
  AlertCircle
} from "lucide-react";

export default function AdminAudit({
  expenses,
  disputes,
  users,
  groups,
  categories,
  onResolveDispute,
  onFlagExpense
}) {
  const [subSection, setSubSection] = useState("disputes"); // "disputes" or "ledger"
  const [resolutionText, setResolutionText] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const handleResolve = (disputeId) => {
    const notes = resolutionText[disputeId] || "Resolved following administrator mediation.";
    onResolveDispute(disputeId, notes);
  };

  const highValueExpenses = expenses.filter(e => Number(e.amount) >= 400);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Audit Ledger &amp; Dispute Mediation</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Investigate reported member discrepancies, mediate disputes, and monitor high-volume transactions.
          </p>
        </div>

        {/* Tab pills */}
        <div style={{ display: "flex", background: "var(--bg-input)", borderRadius: "var(--radius-full)", padding: "3px", border: "1px solid var(--border-subtle)" }}>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              borderRadius: "var(--radius-full)",
              background: subSection === "disputes" ? "var(--secondary)" : "transparent",
              color: subSection === "disputes" ? "#ffffff" : "var(--text-secondary)",
              fontWeight: 700
            }}
            onClick={() => setSubSection("disputes")}
          >
            <AlertTriangle size={14} /> Reported Disputes ({disputes.length})
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              borderRadius: "var(--radius-full)",
              background: subSection === "ledger" ? "var(--secondary)" : "transparent",
              color: subSection === "ledger" ? "#ffffff" : "var(--text-secondary)",
              fontWeight: 700
            }}
            onClick={() => setSubSection("ledger")}
          >
            <FileText size={14} /> High-Value Audit Ledger ({highValueExpenses.length})
          </button>
        </div>
      </div>

      {/* DISPUTES SECTION */}
      {subSection === "disputes" && (
        <div>
          {disputes.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <CheckCircle size={40} color="var(--primary)" style={{ margin: "0 auto 1rem auto" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Zero Pending Disputes</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                All member disputes have been addressed and settled.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {disputes.map(disp => {
                const reporter = users.find(u => u.id === disp.reportedBy);
                const expense = expenses.find(e => e.id === disp.expenseId);
                const isResolved = disp.status === "resolved";

                return (
                  <div
                    key={disp.id}
                    className="card"
                    style={{
                      borderLeft: `4px solid ${isResolved ? "var(--primary)" : "var(--amber)"}`,
                      padding: "1.25rem"
                    }}
                  >
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span className={`badge ${isResolved ? "badge-success" : "badge-warning"}`}>
                            {isResolved ? "Resolved" : "Under Review"}
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            Reported {formatDate(disp.createdAt)}
                          </span>
                        </div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.4rem" }}>
                          Dispute on: {expense?.description || "Expense"} ({formatCurrency(expense?.amount || 0)})
                        </h3>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <UserAvatar user={reporter} size="sm" />
                        <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          Reported by {reporter?.name}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "0.75rem",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-input)",
                        fontSize: "0.85rem",
                        color: "var(--text-main)",
                        marginBottom: "1rem",
                        borderLeft: "2px solid var(--border-hover)"
                      }}
                    >
                      <strong>Member's Reason:</strong> {disp.reason}
                    </div>

                    {isResolved ? (
                      <div style={{ fontSize: "0.85rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Check size={16} />
                        <span><strong>Resolution Note:</strong> {disp.resolutionNotes}</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Add official administrator resolution note..."
                          value={resolutionText[disp.id] || ""}
                          onChange={(e) => setResolutionText({ ...resolutionText, [disp.id]: e.target.value })}
                        />
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ whiteSpace: "nowrap" }}
                          onClick={() => handleResolve(disp.id)}
                        >
                          <Check size={16} /> Resolve Dispute
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* HIGH VALUE AUDIT LEDGER */}
      {subSection === "ledger" && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Group</th>
                <th>Payer</th>
                <th>Total Volume</th>
                <th>Audit Alert Level</th>
              </tr>
            </thead>
            <tbody>
              {highValueExpenses.map(exp => {
                const payer = users.find(u => u.id === exp.paidBy);
                const grp = groups.find(g => g.id === exp.groupId);
                const cat = categories.find(c => c.id === exp.category);

                return (
                  <tr key={exp.id}>
                    <td>{formatDate(exp.date)}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{exp.description}</div>
                      {exp.notes && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{exp.notes}</div>
                      )}
                    </td>
                    <td>{cat?.name || "General"}</td>
                    <td>{grp?.name || "Direct"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <UserAvatar user={payer} size="sm" />
                        <span>{payer?.name}</span>
                      </div>
                    </td>
                    <td className="mono" style={{ fontWeight: 800, fontSize: "1rem" }}>
                      {formatCurrency(exp.amount, exp.currency)}
                    </td>
                    <td>
                      <span className="badge badge-warning" style={{ display: "inline-flex", gap: "4px" }}>
                        <ShieldAlert size={12} /> High-Value Flag (&gt;$400)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
