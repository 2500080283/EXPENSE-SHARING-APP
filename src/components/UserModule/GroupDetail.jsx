import React, { useState } from "react";
import UserAvatar from "../UserAvatar";
import CategoryIcon from "../CategoryIcon";
import { formatCurrency, formatDate, exportExpensesToCSV } from "../../utils/formatters";
import { calculateNetBalances, calculatePairwiseDebts, simplifyDebts } from "../../utils/debtSimplifier";
import {
  Plus,
  Scale,
  ArrowRight,
  Receipt,
  Download,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Trash2
} from "lucide-react";

export default function GroupDetail({
  group,
  users,
  expenses,
  settlements,
  categories,
  activeUserId,
  onBack,
  onOpenAddExpense,
  onOpenSettleUp,
  onOpenDispute,
  onDeleteExpense
}) {
  const [subTab, setSubTab] = useState("expenses"); // "expenses", "balances", "settlements", "activity"
  const [useSimplifiedDebts, setUseSimplifiedDebts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);

  if (!group) return null;

  // Filter expenses and settlements for this group
  const groupExpenses = expenses.filter(e => e.groupId === group.id && e.status !== "cancelled");
  const groupSettlements = settlements.filter(s => s.groupId === group.id && s.status === "completed");

  const memberUsers = users.filter(u => group.members.includes(u.id));
  const totalGroupSpend = groupExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Calculate balances using our debt simplifier engine
  const netBalances = calculateNetBalances(group.members, groupExpenses, groupSettlements);
  const simplifiedDebtsList = simplifyDebts(netBalances);
  const pairwiseDebtsList = calculatePairwiseDebts(group.members, groupExpenses, groupSettlements);

  const activeDebts = useSimplifiedDebts ? simplifiedDebtsList : pairwiseDebtsList;

  // Filtered expenses for search & category
  const filteredExpenses = groupExpenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExportCSV = () => {
    const usersMap = Object.fromEntries(users.map(u => [u.id, u]));
    const groupsMap = { [group.id]: group };
    const categoriesMap = Object.fromEntries(categories.map(c => [c.id, c]));
    exportExpensesToCSV(groupExpenses, usersMap, groupsMap, categoriesMap);
  };

  const myNet = netBalances[activeUserId] || 0;

  return (
    <div>
      {/* Back Button & Group Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}>
          <ChevronLeft size={16} /> Back to Groups
        </button>
      </div>

      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          background: "linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(31, 41, 55, 0.85) 100%)",
          border: "1px solid var(--border-hover)"
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <CategoryIcon
              iconName={group.icon || "Home"}
              color="var(--primary)"
              bg="var(--bg-accent-subtle)"
              size={24}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{group.name}</h1>
                <span className="badge badge-info" style={{ textTransform: "capitalize" }}>
                  {group.type}
                </span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.2rem" }}>
                {group.description || "Shared group for bills and expenses"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>
              <Download size={14} /> Export CSV
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onOpenAddExpense(group.id)}
            >
              <Plus size={16} /> Add Expense
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenSettleUp({ groupId: group.id })}
            >
              <Scale size={16} /> Settle Up
            </button>
          </div>
        </div>

        {/* Group Stats Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginTop: "1.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border-subtle)"
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Total Group Spend
            </div>
            <div className="mono" style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
              {formatCurrency(totalGroupSpend, group.currency)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Your Net Position
            </div>
            <div
              className="mono"
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                color: myNet > 0.01 ? "var(--primary)" : myNet < -0.01 ? "var(--danger)" : "var(--text-muted)"
              }}
            >
              {myNet > 0.01 ? `+${formatCurrency(myNet, group.currency)}` : myNet < -0.01 ? formatCurrency(myNet, group.currency) : "Settled ($0.00)"}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Members ({memberUsers.length})
            </div>
            <div className="avatar-stack" style={{ marginTop: "0.3rem" }}>
              {memberUsers.map(u => (
                <UserAvatar key={u.id} user={u} size="sm" />
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Expenses Logged
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
              {groupExpenses.length} bills
            </div>
          </div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${subTab === "expenses" ? "active" : ""}`}
          onClick={() => setSubTab("expenses")}
        >
          <Receipt size={16} /> Group Expenses ({groupExpenses.length})
        </button>
        <button
          className={`tab-btn ${subTab === "balances" ? "active" : ""}`}
          onClick={() => setSubTab("balances")}
        >
          <Scale size={16} /> Balances &amp; Debt Simplification
        </button>
        <button
          className={`tab-btn ${subTab === "settlements" ? "active" : ""}`}
          onClick={() => setSubTab("settlements")}
        >
          <CheckCircle size={16} /> Settlements Log ({groupSettlements.length})
        </button>
      </div>

      {/* SUBTAB 1: Expenses Feed */}
      {subTab === "expenses" && (
        <div>
          {/* Search and Category filter toolbar */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search expenses in this group..."
              style={{ maxWidth: "340px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="form-select"
              style={{ maxWidth: "200px" }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <Receipt size={40} style={{ margin: "0 auto 1rem auto", opacity: 0.3 }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>No expenses found</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Add an expense to start splitting bills in this group.
              </p>
              <button
                className="btn btn-primary"
                style={{ marginTop: "1rem" }}
                onClick={() => onOpenAddExpense(group.id)}
              >
                <Plus size={16} /> Add First Expense
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filteredExpenses.map(expense => {
                const payer = users.find(u => u.id === expense.paidBy);
                const cat = categories.find(c => c.id === expense.category);
                const isExpanded = expandedExpenseId === expense.id;

                // What is activeUser's involvement?
                const mySplit = expense.splits?.find(s => s.userId === activeUserId);
                const iPaid = expense.paidBy === activeUserId;

                let myStatusText = "Not involved";
                let myStatusColor = "var(--text-muted)";
                if (iPaid) {
                  const lentAmt = expense.amount - (mySplit ? mySplit.amount : 0);
                  myStatusText = `You lent ${formatCurrency(lentAmt, expense.currency)}`;
                  myStatusColor = "var(--primary)";
                } else if (mySplit) {
                  myStatusText = `You borrowed ${formatCurrency(mySplit.amount, expense.currency)}`;
                  myStatusColor = "var(--danger)";
                }

                return (
                  <div
                    key={expense.id}
                    className="card"
                    style={{
                      padding: "1rem 1.25rem",
                      cursor: "pointer"
                    }}
                    onClick={() => setExpandedExpenseId(isExpanded ? null : expense.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <CategoryIcon
                          iconName={cat?.icon || "Tag"}
                          color={cat?.color || "#10b981"}
                          bg={cat?.bg || "rgba(16,185,129,0.15)"}
                          size={20}
                        />
                        <div>
                          <div style={{ fontSize: "1rem", fontWeight: 700 }}>
                            {expense.description}
                          </div>
                          <div style={{ fontSize: "0.775rem", color: "var(--text-muted)", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span>{formatDate(expense.date)}</span>
                            <span>•</span>
                            <span>Paid by {payer?.name}</span>
                            <span>•</span>
                            <span style={{ textTransform: "capitalize" }}>{cat?.name}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <div style={{ textAlign: "right" }}>
                          <div className="mono" style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                            {formatCurrency(expense.amount, expense.currency)}
                          </div>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: myStatusColor }}>
                            {myStatusText}
                          </div>
                        </div>

                        {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {/* Expandable Split Details Drawer */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: "1rem",
                          paddingTop: "1rem",
                          borderTop: "1px solid var(--border-subtle)",
                          animation: "fadeIn 0.2s ease-out"
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                            Split Breakdown ({expense.splitType} split)
                          </span>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => onOpenDispute(expense)}
                              title="Flag dispute to admin"
                            >
                              <AlertTriangle size={14} color="var(--amber)" /> Report Dispute
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ color: "var(--danger)" }}
                              onClick={() => onDeleteExpense(expense.id)}
                              title="Delete expense"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.5rem" }}>
                          {expense.splits?.map(split => {
                            const splitUser = users.find(u => u.id === split.userId);
                            return (
                              <div
                                key={split.userId}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "0.5rem 0.75rem",
                                  borderRadius: "var(--radius-sm)",
                                  background: "var(--bg-input)"
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <UserAvatar user={splitUser} size="sm" />
                                  <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                    {splitUser?.name} {split.userId === activeUserId ? "(You)" : ""}
                                  </span>
                                </div>
                                <span className="mono" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                                  {formatCurrency(split.amount, expense.currency)}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {expense.notes && (
                          <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            <strong>Notes:</strong> {expense.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: Balances & Smart Debt Simplification */}
      {subTab === "balances" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }}>
          {/* Member Net Balances */}
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
              Member Net Balances
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {memberUsers.map(u => {
                const bal = netBalances[u.id] || 0;
                const isPos = bal > 0.01;
                const isNeg = bal < -0.01;

                return (
                  <div
                    key={u.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-subtle)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <UserAvatar user={u} size="md" />
                      <div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                          {u.name} {u.id === activeUserId ? "(You)" : ""}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {u.paymentHandle || u.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div
                        className="mono"
                        style={{
                          fontSize: "1rem",
                          fontWeight: 800,
                          color: isPos ? "var(--primary)" : isNeg ? "var(--danger)" : "var(--text-muted)"
                        }}
                      >
                        {isPos ? `+${formatCurrency(bal, group.currency)}` : isNeg ? formatCurrency(bal, group.currency) : "Settled"}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                        {isPos ? "is owed" : isNeg ? "owes" : "squared away"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transfers & Debt Simplification Algorithm View */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Suggested Payments</h3>
                <p style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                  {useSimplifiedDebts
                    ? "Min-cash-flow algorithm active: minimal transactions."
                    : "Direct un-simplified pairwise debt breakdown."}
                </p>
              </div>

              {/* Debt Simplification Toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "var(--bg-input)",
                  borderRadius: "var(--radius-full)",
                  padding: "2px",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <button
                  type="button"
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: useSimplifiedDebts ? "var(--primary)" : "transparent",
                    color: useSimplifiedDebts ? "#ffffff" : "var(--text-secondary)"
                  }}
                  onClick={() => setUseSimplifiedDebts(true)}
                >
                  Simplified ({simplifiedDebtsList.length})
                </button>
                <button
                  type="button"
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: !useSimplifiedDebts ? "var(--secondary)" : "transparent",
                    color: !useSimplifiedDebts ? "#ffffff" : "var(--text-secondary)"
                  }}
                  onClick={() => setUseSimplifiedDebts(false)}
                >
                  Direct ({pairwiseDebtsList.length})
                </button>
              </div>
            </div>

            {activeDebts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                <CheckCircle size={36} color="var(--primary)" style={{ margin: "0 auto 0.75rem auto" }} />
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>
                  All Squared Away!
                </h4>
                <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  No pending debts in this group. Everyone is completely settled.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {activeDebts.map((item, idx) => {
                  const debtor = users.find(u => u.id === item.from);
                  const creditor = users.find(u => u.id === item.to);

                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.85rem 1rem",
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-subtle)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <UserAvatar user={debtor} size="sm" />
                        <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                          {debtor?.name}
                        </span>
                        <ArrowRight size={16} color="var(--primary)" />
                        <UserAvatar user={creditor} size="sm" />
                        <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                          {creditor?.name}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span className="mono" style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-main)" }}>
                          {formatCurrency(item.amount, group.currency)}
                        </span>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onOpenSettleUp({
                            groupId: group.id,
                            fromUserId: item.from,
                            toUserId: item.to,
                            amount: item.amount,
                            notes: `Settle balance in ${group.name}`
                          })}
                        >
                          Settle
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: Settlements History */}
      {subTab === "settlements" && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckCircle size={20} color="var(--primary)" /> Completed Payments &amp; Settlements
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenSettleUp({ groupId: group.id })}
            >
              Record New Settlement
            </button>
          </div>

          {groupSettlements.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              <Scale size={36} style={{ margin: "0 auto 0.75rem auto", opacity: 0.3 }} />
              <p style={{ fontSize: "0.9rem" }}>No settlements recorded yet in this group.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Payer</th>
                    <th>Recipient</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Notes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {groupSettlements.map(stl => {
                    const payer = users.find(u => u.id === stl.fromUserId);
                    const payee = users.find(u => u.id === stl.toUserId);

                    return (
                      <tr key={stl.id}>
                        <td>{formatDate(stl.date)}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <UserAvatar user={payer} size="sm" />
                            <strong>{payer?.name}</strong>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <UserAvatar user={payee} size="sm" />
                            <strong>{payee?.name}</strong>
                          </div>
                        </td>
                        <td className="mono" style={{ fontWeight: 800, color: "var(--primary)" }}>
                          {formatCurrency(stl.amount, stl.currency)}
                        </td>
                        <td>
                          <span className="badge badge-purple">{stl.paymentMethod}</span>
                        </td>
                        <td>{stl.notes || "—"}</td>
                        <td>
                          <span className="badge badge-success">Completed</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
