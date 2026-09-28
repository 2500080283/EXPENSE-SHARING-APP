import React from "react";
import UserAvatar from "../UserAvatar";
import CategoryIcon from "../CategoryIcon";
import { formatCurrency, formatDate, formatRelativeTime } from "../../utils/formatters";
import { getUserFinancialOverview, getUserPairwiseBalances, getCategorySpendingBreakdown } from "../../utils/calculations";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Users,
  Plus,
  ArrowRight,
  Bell,
  CheckCircle,
  Receipt,
  Wallet
} from "lucide-react";

export default function UserDashboard({
  activeUser,
  users,
  groups,
  expenses,
  settlements,
  categories,
  onOpenAddExpense,
  onOpenSettleUp,
  onOpenCreateGroup,
  onOpenSendReminder,
  onSelectGroup,
  onNavigateTab
}) {
  const overview = getUserFinancialOverview(activeUser.id, expenses, settlements);
  const pairwise = getUserPairwiseBalances(activeUser.id, users, expenses, settlements);
  const categoryBreakdown = getCategorySpendingBreakdown(expenses, categories);

  // Recent 6 transactions (expenses + settlements merged chronologically)
  const recentActivities = [
    ...expenses.map(e => ({ ...e, itemType: "expense" })),
    ...settlements.map(s => ({ ...s, itemType: "settlement" }))
  ].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).slice(0, 6);

  const isNetPositive = overview.netBalance > 0.01;
  const isNetNegative = overview.netBalance < -0.01;

  // Filter groups where activeUser is a member
  const myGroups = groups.filter(g => g.members.includes(activeUser.id) && !g.archived);

  return (
    <div>
      {/* Hero Net Balance Banner */}
      <div className="hero-banner">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span className="badge badge-purple">
                <Wallet size={12} /> Personal Balance Hub
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Welcome back, <strong>{activeUser.name}</strong>
              </span>
            </div>

            <h1 style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              {isNetPositive && (
                <span style={{ color: "var(--primary)" }}>
                  Overall, you are owed {formatCurrency(overview.netBalance)}
                </span>
              )}
              {isNetNegative && (
                <span style={{ color: "var(--danger)" }}>
                  Overall, you owe {formatCurrency(Math.abs(overview.netBalance))}
                </span>
              )}
              {!isNetPositive && !isNetNegative && (
                <span style={{ color: "var(--primary-light)" }}>
                  You are completely all settled up! 🎉
                </span>
              )}
            </h1>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.4rem", maxWidth: "600px" }}>
              Track split bills, settle debts smoothly, and keep finances dispute-free across your groups and roommates.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <button className="btn btn-primary" onClick={onOpenAddExpense}>
              <Plus size={18} /> Add Expense
            </button>
            <button className="btn btn-secondary" onClick={() => onOpenSettleUp()}>
              <Scale size={18} /> Settle Up
            </button>
            <button className="btn btn-outline" onClick={onOpenCreateGroup}>
              <Users size={18} /> New Group
            </button>
            <button className="btn btn-outline" onClick={() => onOpenSendReminder()}>
              <Bell size={18} /> Send Reminder
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">
            <Scale size={14} color="var(--primary)" /> Net Balance
          </div>
          <div className={`stat-val ${isNetPositive ? "positive" : isNetNegative ? "negative" : "neutral"}`}>
            {formatCurrency(overview.netBalance)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {isNetPositive ? "Money coming to you" : isNetNegative ? "Money you owe others" : "Zero debt"}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <TrendingUp size={14} color="var(--primary)" /> You Are Owed
          </div>
          <div className="stat-val positive">
            {formatCurrency(pairwise.totalYouAreOwed)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Across {pairwise.friends.filter(f => f.balance > 0).length} friends
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <TrendingDown size={14} color="var(--danger)" /> You Owe
          </div>
          <div className="stat-val negative">
            {formatCurrency(pairwise.totalYouOwe)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            To {pairwise.friends.filter(f => f.balance < 0).length} friends
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <Receipt size={14} color="var(--info)" /> Total Expenses Logged
          </div>
          <div className="stat-val" style={{ color: "var(--text-main)" }}>
            {expenses.length}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            In {myGroups.length} active groups
          </span>
        </div>
      </div>

      {/* Main Grid: Groups & Friends / Recent Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Left Column: Your Groups & Balances with Friends */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Groups Carousel/List */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Users size={20} color="var(--primary)" /> Your Active Groups
              </h2>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => onNavigateTab("groups")}
              >
                View All ({myGroups.length}) <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
              {myGroups.map(group => {
                const groupOverview = getUserFinancialOverview(activeUser.id, expenses, settlements, group.id);
                const groupExpenses = expenses.filter(e => e.groupId === group.id && e.status !== "cancelled");
                const totalGroupSpend = groupExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
                const memberUsers = users.filter(u => group.members.includes(u.id));

                return (
                  <div
                    key={group.id}
                    className="card card-interactive"
                    style={{
                      background: "var(--bg-surface)",
                      cursor: "pointer",
                      padding: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                    onClick={() => onSelectGroup(group.id)}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <CategoryIcon
                          iconName={group.icon || "Home"}
                          color="var(--primary)"
                          bg="var(--bg-accent-subtle)"
                        />
                        <span className="badge badge-info" style={{ textTransform: "capitalize" }}>
                          {group.type}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                        {group.name}
                      </h3>
                      <p style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginBottom: "0.75rem", lineClamp: 2 }}>
                        {group.description || "Shared group expenses"}
                      </p>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <div className="avatar-stack">
                          {memberUsers.slice(0, 4).map(u => (
                            <UserAvatar key={u.id} user={u} size="sm" />
                          ))}
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          Total: <strong>{formatCurrency(totalGroupSpend, group.currency)}</strong>
                        </span>
                      </div>

                      <div
                        style={{
                          padding: "0.5rem 0.75rem",
                          borderRadius: "var(--radius-sm)",
                          background: groupOverview.netBalance > 0.01
                            ? "var(--bg-accent-subtle)"
                            : groupOverview.netBalance < -0.01
                            ? "var(--danger-bg)"
                            : "var(--bg-input)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          Your Share:
                        </span>
                        <span
                          className="mono"
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 800,
                            color: groupOverview.netBalance > 0.01
                              ? "var(--primary)"
                              : groupOverview.netBalance < -0.01
                              ? "var(--danger)"
                              : "var(--text-muted)"
                          }}
                        >
                          {groupOverview.netBalance > 0.01
                            ? `+${formatCurrency(groupOverview.netBalance, group.currency)}`
                            : groupOverview.netBalance < -0.01
                            ? formatCurrency(groupOverview.netBalance, group.currency)
                            : "Settled"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Friends Balances (Who owes whom) */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Scale size={20} color="var(--primary)" /> Who Owes Whom
              </h2>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => onNavigateTab("friends")}
              >
                All Friends <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {pairwise.friends.map(({ user, balance, status }) => {
                return (
                  <div
                    key={user.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.85rem 1rem",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <UserAvatar user={user} size="md" />
                      <div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {user.paymentHandle || user.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ textAlign: "right" }}>
                        <div
                          className="mono"
                          style={{
                            fontSize: "1rem",
                            fontWeight: 800,
                            color: status === "owed_to_you"
                              ? "var(--primary)"
                              : status === "you_owe"
                              ? "var(--danger)"
                              : "var(--text-muted)"
                          }}
                        >
                          {status === "owed_to_you" && `+${formatCurrency(balance)}`}
                          {status === "you_owe" && formatCurrency(balance)}
                          {status === "settled" && "Settled"}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                          {status === "owed_to_you" && "owes you"}
                          {status === "you_owe" && "you owe"}
                          {status === "settled" && "no debt"}
                        </div>
                      </div>

                      {/* Action buttons */}
                      {status === "owed_to_you" && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => onOpenSendReminder(user, balance)}
                          title="Send a friendly payment reminder"
                        >
                          <Bell size={14} /> Remind
                        </button>
                      )}
                      {status === "you_owe" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onOpenSettleUp({ toUserId: user.id, fromUserId: activeUser.id, amount: Math.abs(balance) })}
                          title="Record payment"
                        >
                          Settle Up
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Category Spending & Recent Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Spending by Category Widget */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Receipt size={18} color="var(--primary)" /> Shared Spending Breakdown
              </h2>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => onNavigateTab("analytics")}
              >
                Insights
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {categoryBreakdown.slice(0, 5).map(cat => (
                <div key={cat.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                    <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="mono" style={{ fontWeight: 700 }}>
                      {formatCurrency(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div style={{ height: "6px", width: "100%", background: "var(--bg-input)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                        borderRadius: "var(--radius-full)"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <TrendingUp size={18} color="var(--primary)" /> Recent Activity
              </h2>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => onNavigateTab("expenses")}
              >
                History
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {recentActivities.map(item => {
                if (item.itemType === "settlement") {
                  const payer = users.find(u => u.id === item.fromUserId);
                  const receiver = users.find(u => u.id === item.toUserId);

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.6rem 0",
                        borderBottom: "1px solid var(--border-subtle)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "var(--radius-md)",
                            background: "var(--bg-accent-subtle)",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <CheckCircle size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                            {payer?.name} paid {receiver?.name}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {formatRelativeTime(item.createdAt || item.date)} • {item.paymentMethod}
                          </div>
                        </div>
                      </div>
                      <span className="mono" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)" }}>
                        {formatCurrency(item.amount, item.currency)}
                      </span>
                    </div>
                  );
                }

                // Expense item
                const payer = users.find(u => u.id === item.paidBy);
                const cat = categories.find(c => c.id === item.category);

                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.6rem 0",
                      borderBottom: "1px solid var(--border-subtle)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <CategoryIcon
                        iconName={cat?.icon || "Tag"}
                        color={cat?.color || "#10b981"}
                        bg={cat?.bg || "rgba(16,185,129,0.15)"}
                        size={16}
                      />
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          {item.description}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          Paid by {payer?.name} • {formatDate(item.date)}
                        </div>
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                      {formatCurrency(item.amount, item.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
