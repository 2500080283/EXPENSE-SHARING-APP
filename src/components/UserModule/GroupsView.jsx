import React, { useState } from "react";
import UserAvatar from "../UserAvatar";
import CategoryIcon from "../CategoryIcon";
import { formatCurrency } from "../../utils/formatters";
import { Plus, Users, Search } from "lucide-react";

export default function GroupsView({
  groups,
  users,
  expenses,
  settlements,
  activeUserId,
  onSelectGroup,
  onOpenCreateGroup
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const myGroups = groups.filter(g => g.members.includes(activeUserId) && !g.archived);

  const filteredGroups = myGroups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || g.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Shared Expense Groups</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Split bills with flatmates, manage holiday trips, or organize dining squads.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenCreateGroup}>
          <Plus size={18} /> Create New Group
        </button>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by group name or description..."
            style={{ paddingLeft: "2.4rem" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        </div>

        <select
          className="form-select"
          style={{ width: "200px" }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Group Types</option>
          <option value="apartment">Apartment / Home</option>
          <option value="trip">Trip / Vacation</option>
          <option value="dining">Food &amp; Dining</option>
          <option value="project">Project / Work</option>
          <option value="couple">Couple / Partner</option>
        </select>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3.5rem 1rem" }}>
          <Users size={48} style={{ margin: "0 auto 1rem auto", opacity: 0.3 }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>No groups match your search</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Try adjusting your search criteria or create a brand new group.
          </p>
          <button className="btn btn-primary" style={{ marginTop: "1.25rem" }} onClick={onOpenCreateGroup}>
            <Plus size={16} /> Create Group
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {filteredGroups.map(group => {
            const groupOverview = getUserFinancialOverview(activeUserId, expenses, settlements, group.id);
            const groupExpenses = expenses.filter(e => e.groupId === group.id && e.status !== "cancelled");
            const totalSpend = groupExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
            const members = users.filter(u => group.members.includes(u.id));

            const isOwed = groupOverview.netBalance > 0.01;
            const owes = groupOverview.netBalance < -0.01;

            return (
              <div
                key={group.id}
                className="card card-interactive"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer"
                }}
                onClick={() => onSelectGroup(group.id)}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <CategoryIcon
                      iconName={group.icon || "Home"}
                      color="var(--primary)"
                      bg="var(--bg-accent-subtle)"
                      size={22}
                    />
                    <span className="badge badge-info" style={{ textTransform: "capitalize" }}>
                      {group.type}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    {group.name}
                  </h3>
                  <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginBottom: "1.25rem", minHeight: "2.4em", lineHeight: 1.4 }}>
                    {group.description || "Organize shared group expenses"}
                  </p>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div className="avatar-stack">
                      {members.slice(0, 5).map(m => (
                        <UserAvatar key={m.id} user={m} size="sm" />
                      ))}
                      {members.length > 5 && (
                        <div
                          className="avatar avatar-sm avatar-fallback"
                          style={{ fontSize: "0.7rem", background: "var(--bg-surface)" }}
                        >
                          +{members.length - 5}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Total Spend</div>
                      <div className="mono" style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                        {formatCurrency(totalSpend, group.currency)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "0.6rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      background: isOwed ? "var(--bg-accent-subtle)" : owes ? "var(--danger-bg)" : "var(--bg-input)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Your Position:
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        color: isOwed ? "var(--primary)" : owes ? "var(--danger)" : "var(--text-muted)"
                      }}
                    >
                      {isOwed ? `+${formatCurrency(groupOverview.netBalance, group.currency)}` : owes ? formatCurrency(groupOverview.netBalance, group.currency) : "Settled (₹0.00)"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
