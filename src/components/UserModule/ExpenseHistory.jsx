import React, { useState } from "react";
import UserAvatar from "../UserAvatar";
import CategoryIcon from "../CategoryIcon";
import { formatCurrency, formatDate, exportExpensesToCSV } from "../../utils/formatters";
import {
  Receipt,
  Download,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trash2
} from "lucide-react";

export default function ExpenseHistory({
  expenses,
  users,
  groups,
  categories,
  activeUserId,
  onOpenAddExpense,
  onOpenDispute,
  onDeleteExpense
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [payerFilter, setPayerFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  // Filter expenses
  const filtered = expenses.filter(e => {
    if (e.status === "cancelled") return false;

    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGroup = groupFilter === "all"
      ? true
      : groupFilter === "direct"
      ? !e.groupId
      : e.groupId === groupFilter;

    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
    const matchesPayer = payerFilter === "all" || e.paidBy === payerFilter;

    return matchesSearch && matchesGroup && matchesCategory && matchesPayer;
  });

  const totalFilteredAmount = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleExport = () => {
    const usersMap = Object.fromEntries(users.map(u => [u.id, u]));
    const groupsMap = Object.fromEntries(groups.map(g => [g.id, g]));
    const categoriesMap = Object.fromEntries(categories.map(c => [c.id, c]));
    exportExpensesToCSV(filtered, usersMap, groupsMap, categoriesMap);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Complete Expense History</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Global audit log of all bills, shared receipts, and payment distributions.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={16} /> Export to CSV
          </button>
          <button className="btn btn-primary" onClick={() => onOpenAddExpense()}>
            <Receipt size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          padding: "1.25rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem"
        }}
      >
        <div style={{ position: "relative" }}>
          <label className="form-label">Search</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Filter by Group</label>
          <select
            className="form-select"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
          >
            <option value="all">All Groups &amp; Direct</option>
            <option value="direct">Direct 1-on-1 Splits Only</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Filter by Category</label>
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Filter by Payer</label>
          <select
            className="form-select"
            value={payerFilter}
            onChange={(e) => setPayerFilter(e.target.value)}
          >
            <option value="all">All Payers</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} {u.id === activeUserId ? "(You)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary Counter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Showing <strong>{filtered.length}</strong> matching expenses
        </span>
        <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>
          Total Volume: <span className="mono" style={{ color: "var(--primary)" }}>{formatCurrency(totalFilteredAmount)}</span>
        </span>
      </div>

      {/* Data Table */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <Receipt size={40} style={{ margin: "0 auto 1rem auto", opacity: 0.3 }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>No expenses match these filters</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Try resetting your search or category filters.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Group</th>
                <th>Paid By</th>
                <th>Total Amount</th>
                <th>Your Share</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(exp => {
                const payer = users.find(u => u.id === exp.paidBy);
                const grp = groups.find(g => g.id === exp.groupId);
                const cat = categories.find(c => c.id === exp.category);
                const mySplit = exp.splits?.find(s => s.userId === activeUserId);
                const iPaid = exp.paidBy === activeUserId;
                const isExpanded = expandedId === exp.id;

                return (
                  <React.Fragment key={exp.id}>
                    <tr
                      style={{ cursor: "pointer" }}
                      onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                    >
                      <td>{formatDate(exp.date)}</td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{exp.description}</div>
                        {exp.notes && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineClamp: 1 }}>
                            {exp.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <CategoryIcon
                            iconName={cat?.icon || "Tag"}
                            color={cat?.color || "#10b981"}
                            bg={cat?.bg || "rgba(16,185,129,0.15)"}
                            size={16}
                          />
                          <span>{cat?.name || "General"}</span>
                        </div>
                      </td>
                      <td>
                        {grp ? (
                          <span className="badge badge-info">{grp.name}</span>
                        ) : (
                          <span className="badge badge-purple">Direct 1-on-1</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <UserAvatar user={payer} size="sm" />
                          <span>{payer?.name} {iPaid ? "(You)" : ""}</span>
                        </div>
                      </td>
                      <td className="mono" style={{ fontWeight: 800 }}>
                        {formatCurrency(exp.amount, exp.currency)}
                      </td>
                      <td>
                        {iPaid ? (
                          <span style={{ color: "var(--primary)", fontWeight: 700 }}>
                            You paid full
                          </span>
                        ) : mySplit ? (
                          <span className="mono" style={{ color: "var(--danger)", fontWeight: 700 }}>
                            {formatCurrency(mySplit.amount, exp.currency)}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <button
                            className="btn-icon"
                            style={{ width: "30px", height: "30px" }}
                            title="Report Dispute to Admin"
                            onClick={() => onOpenDispute(exp)}
                          >
                            <AlertTriangle size={14} color="var(--amber)" />
                          </button>
                          <button
                            className="btn-icon"
                            style={{ width: "30px", height: "30px" }}
                            title="Delete Expense"
                            onClick={() => onDeleteExpense(exp.id)}
                          >
                            <Trash2 size={14} color="var(--danger)" />
                          </button>
                          <button
                            className="btn-icon"
                            style={{ width: "30px", height: "30px" }}
                            onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Split Breakdown Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} style={{ background: "var(--bg-input)", padding: "1.25rem" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                                Detailed Splits ({exp.splitType} split mode)
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                Logged {formatDate(exp.createdAt || exp.date)}
                              </span>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.6rem" }}>
                              {exp.splits?.map(split => {
                                const u = users.find(user => user.id === split.userId);
                                return (
                                  <div
                                    key={split.userId}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      padding: "0.5rem 0.75rem",
                                      borderRadius: "var(--radius-sm)",
                                      background: "var(--bg-surface)",
                                      border: "1px solid var(--border-subtle)"
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                      <UserAvatar user={u} size="sm" />
                                      <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{u?.name}</span>
                                    </div>
                                    <span className="mono" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                                      {formatCurrency(split.amount, exp.currency)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
