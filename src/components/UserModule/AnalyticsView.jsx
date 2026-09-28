import React, { useState } from "react";
import UserAvatar from "../UserAvatar";
import { formatCurrency } from "../../utils/formatters";
import { getCategorySpendingBreakdown } from "../../utils/calculations";
import { PieChart, TrendingUp, DollarSign, Award, Lightbulb, Users } from "lucide-react";

export default function AnalyticsView({
  expenses,
  categories,
  users,
  groups
}) {
  const [activeCategoryHover, setActiveCategoryHover] = useState(null);

  const categoryBreakdown = getCategorySpendingBreakdown(expenses, categories);
  const totalSpend = expenses.filter(e => e.status !== "cancelled").reduce((s, e) => s + Number(e.amount), 0);
  const avgExpense = expenses.length > 0 ? totalSpend / expenses.length : 0;
  const maxExpense = expenses.reduce((max, e) => Math.max(max, Number(e.amount)), 0);

  // Group spend totals
  const groupTotals = groups.map(g => {
    const total = expenses.filter(e => e.groupId === g.id).reduce((s, e) => s + Number(e.amount), 0);
    return { ...g, total };
  }).sort((a, b) => b.total - a.total);

  // Top spenders (users who paid the most)
  const userSpendTotals = users.map(u => {
    const totalPaid = expenses.filter(e => e.paidBy === u.id).reduce((s, e) => s + Number(e.amount), 0);
    return { ...u, totalPaid };
  }).sort((a, b) => b.totalPaid - a.totalPaid);

  // Build SVG Donut Chart angles functionally
  const donutSlices = categoryBreakdown.reduce((acc, cat) => {
    const prevEnd = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
    const sliceAngle = (cat.percentage / 100) * 360;
    const startAngle = prevEnd;
    const endAngle = prevEnd + sliceAngle;

    // Convert polar coordinates to Cartesian for SVG path
    const getCoordinatesForPercent = (percent) => {
      const x = Math.cos(2 * Math.PI * percent);
      const y = Math.sin(2 * Math.PI * percent);
      return [x, y];
    };

    const startPercent = startAngle / 360;
    const endPercent = endAngle / 360;
    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);
    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${startX * 80 + 100} ${startY * 80 + 100}`,
      `A 80 80 0 ${largeArcFlag} 1 ${endX * 80 + 100} ${endY * 80 + 100}`,
      `L ${endX * 50 + 100} ${endY * 50 + 100}`,
      `A 50 50 0 ${largeArcFlag} 0 ${startX * 50 + 100} ${startY * 50 + 100}`,
      "Z"
    ].join(" ");

    acc.push({
      ...cat,
      pathData,
      startAngle,
      endAngle
    });
    return acc;
  }, []);

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Spending &amp; Shared Analytics</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Gain transparent visibility into category distributions, top expenses, and group trends.
        </p>
      </div>

      {/* KPI Metric Strip */}
      <div className="stat-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-label">
            <DollarSign size={14} color="var(--primary)" /> Cumulative Shared Spend
          </div>
          <div className="stat-val positive mono">
            {formatCurrency(totalSpend)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Across {expenses.length} recorded bills
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <TrendingUp size={14} color="var(--info)" /> Average Expense Size
          </div>
          <div className="stat-val mono" style={{ color: "var(--info)" }}>
            {formatCurrency(avgExpense)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Per logged transaction
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <Award size={14} color="var(--amber)" /> Largest Shared Bill
          </div>
          <div className="stat-val mono" style={{ color: "var(--amber)" }}>
            {formatCurrency(maxExpense)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Florence Heritage Airbnb
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <Users size={14} color="#818cf8" /> Active Spending Groups
          </div>
          <div className="stat-val" style={{ color: "#818cf8" }}>
            {groups.length}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Collaborative environments
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Category Donut & Breakdown Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <PieChart size={18} color="var(--primary)" /> Expenses by Category
            </h2>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-around", gap: "1.5rem" }}>
            {/* Interactive SVG Donut */}
            <div style={{ position: "relative", width: "200px", height: "200px" }}>
              <svg viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                {donutSlices.map((slice) => (
                  <path
                    key={slice.id}
                    d={slice.pathData}
                    fill={slice.color}
                    style={{
                      cursor: "pointer",
                      transition: "opacity 0.2s, transform 0.2s",
                      opacity: activeCategoryHover && activeCategoryHover !== slice.id ? 0.4 : 1
                    }}
                    onMouseEnter={() => setActiveCategoryHover(slice.id)}
                    onMouseLeave={() => setActiveCategoryHover(null)}
                  />
                ))}
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none"
                }}
              >
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Total
                </span>
                <span className="mono" style={{ fontSize: "1rem", fontWeight: 800 }}>
                  {formatCurrency(totalSpend)}
                </span>
              </div>
            </div>

            {/* Category Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1, minWidth: "180px" }}>
              {categoryBreakdown.map(cat => (
                <div
                  key={cat.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.35rem 0.5rem",
                    borderRadius: "var(--radius-sm)",
                    background: activeCategoryHover === cat.id ? "var(--bg-input)" : "transparent",
                    cursor: "pointer"
                  }}
                  onMouseEnter={() => setActiveCategoryHover(cat.id)}
                  onMouseLeave={() => setActiveCategoryHover(null)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: cat.color }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{cat.name}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="mono" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                      {formatCurrency(cat.amount)}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "6px" }}>
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Payers Leaderboard */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Award size={18} color="var(--amber)" /> Front-Line Payers Leaderboard
            </h2>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            Friends who have fronted the most capital on behalf of the group.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {userSpendTotals.map((user, idx) => {
              const pctOfAll = totalSpend > 0 ? Math.round((user.totalPaid / totalSpend) * 100) : 0;

              return (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: idx === 0 ? "rgba(245, 158, 11, 0.2)" : "var(--bg-input)",
                        color: idx === 0 ? "var(--amber)" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 800
                      }}
                    >
                      #{idx + 1}
                    </span>
                    <UserAvatar user={user} size="sm" />
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>{user.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        Fronted {pctOfAll}% of all group expenses
                      </div>
                    </div>
                  </div>

                  <span className="mono" style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--primary)" }}>
                    {formatCurrency(user.totalPaid)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Group Spending Breakdown & Smart Insights */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }}>
        {/* Spending by Group */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Users size={18} color="var(--primary)" /> Spending per Group
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {groupTotals.map(grp => {
              const pct = totalSpend > 0 ? Math.round((grp.total / totalSpend) * 100) : 0;
              return (
                <div key={grp.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                    <span style={{ fontWeight: 600 }}>{grp.name}</span>
                    <span className="mono" style={{ fontWeight: 700 }}>
                      {formatCurrency(grp.total, grp.currency)} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: "7px", width: "100%", background: "var(--bg-input)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: "var(--brand-gradient)",
                        borderRadius: "var(--radius-full)"
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Transparency Tips & Insights */}
        <div
          className="card"
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.2)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Lightbulb size={20} color="var(--amber)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Transparency Insights</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            <div style={{ padding: "0.75rem", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              💡 <strong>Travel was your largest expenditure</strong> this quarter, accounting for 60%+ of total group shared outlays.
            </div>
            <div style={{ padding: "0.75rem", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              ⚡ <strong>Simplify Debts</strong> has reduced 14 criss-crossing debts down to only 4 clean transfers, saving friends time and transaction fees!
            </div>
            <div style={{ padding: "0.75rem", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              🔔 <strong>Zero payment disputes</strong> have taken longer than 48 hours to resolve, maintaining strong trust among roommates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
