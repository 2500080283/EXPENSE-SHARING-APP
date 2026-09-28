import React, { useState } from "react";
import UserAvatar from "../UserAvatar";
import CategoryIcon from "../CategoryIcon";
import { formatCurrency } from "../../utils/formatters";
import { Search, Archive, RotateCcw, Trash2 } from "lucide-react";

export default function AdminGroups({
  groups,
  users,
  expenses,
  onUpdateGroup,
  onDeleteGroup
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const isArchived = !!g.archived;
    const matchesStatus = statusFilter === "all"
      ? true
      : statusFilter === "active"
      ? !isArchived
      : isArchived;

    return matchesSearch && matchesStatus;
  });

  const handleToggleArchive = (group) => {
    onUpdateGroup({
      ...group,
      archived: !group.archived
    });
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Platform Groups Oversight</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Audit active collaborative spaces, review group financial volumes, and archive idle groups.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search groups by name..."
            style={{ paddingLeft: "2.4rem" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        </div>

        <select
          className="form-select"
          style={{ width: "180px" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Group Statuses</option>
          <option value="active">Active Only</option>
          <option value="archived">Archived Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Group Name</th>
              <th>Category</th>
              <th>Created By</th>
              <th>Members</th>
              <th>Expense Count</th>
              <th>Total Transacted ($)</th>
              <th>Status</th>
              <th>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map(group => {
              const creator = users.find(u => u.id === group.createdBy);
              const groupExpenses = expenses.filter(e => e.groupId === group.id && e.status !== "cancelled");
              const totalSpend = groupExpenses.reduce((s, e) => s + Number(e.amount), 0);
              const isArchived = !!group.archived;

              return (
                <tr key={group.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <CategoryIcon
                        iconName={group.icon || "Home"}
                        color="var(--secondary)"
                        bg="rgba(99, 102, 241, 0.15)"
                        size={18}
                      />
                      <div>
                        <div style={{ fontWeight: 700 }}>{group.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineClamp: 1 }}>
                          {group.description || "No description"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ textTransform: "capitalize" }}>
                      {group.type}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <UserAvatar user={creator} size="sm" />
                      <span>{creator?.name || "System"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="avatar-stack">
                      {group.members.slice(0, 4).map(mid => {
                        const u = users.find(user => user.id === mid);
                        return <UserAvatar key={mid} user={u} size="sm" />;
                      })}
                      {group.members.length > 4 && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "6px" }}>
                          +{group.members.length - 4}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {groupExpenses.length} bills
                  </td>
                  <td className="mono" style={{ fontWeight: 800 }}>
                    {formatCurrency(totalSpend, group.currency)}
                  </td>
                  <td>
                    <span className={`badge ${isArchived ? "badge-danger" : "badge-success"}`}>
                      {isArchived ? "Archived" : "Active"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: "0.75rem" }}
                        onClick={() => handleToggleArchive(group)}
                        title={isArchived ? "Restore Group" : "Archive Group"}
                      >
                        {isArchived ? <RotateCcw size={13} /> : <Archive size={13} />}
                        {isArchived ? "Restore" : "Archive"}
                      </button>

                      <button
                        className="btn-icon"
                        style={{ width: "30px", height: "30px", color: "var(--danger)" }}
                        onClick={() => onDeleteGroup(group.id)}
                        title="Delete Group"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
