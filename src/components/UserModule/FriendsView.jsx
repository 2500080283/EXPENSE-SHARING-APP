import React, { useState } from "react";
import UserAvatar from "../UserAvatar";
import { formatCurrency } from "../../utils/formatters";
import { getUserPairwiseBalances } from "../../utils/calculations";
import {
  Users,
  UserPlus,
  Scale,
  Bell,
  Plus,
  Mail,
  Phone,
  Search,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function FriendsView({
  users,
  expenses,
  settlements,
  activeUser,
  onOpenSettleUp,
  onOpenSendReminder,
  onOpenAddExpense,
  onAddNewFriend
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [newFriendPhone, setNewFriendPhone] = useState("");
  const [newFriendHandle, setNewFriendHandle] = useState("");

  const pairwise = getUserPairwiseBalances(activeUser.id, users, expenses, settlements);

  const filteredFriends = pairwise.friends.filter(({ user }) => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateFriend = (e) => {
    e.preventDefault();
    if (!newFriendName.trim() || !newFriendEmail.trim()) return;

    const newFriend = {
      id: "usr_" + Date.now(),
      name: newFriendName.trim(),
      email: newFriendEmail.trim(),
      role: "user",
      avatar: "",
      phone: newFriendPhone.trim() || "+1 (555) 000-1234",
      paymentHandle: newFriendHandle.trim() || `${newFriendName.toLowerCase().replace(/\s+/g, '')}@venmo`,
      status: "active",
      joinedDate: new Date().toISOString().slice(0, 10)
    };

    onAddNewFriend(newFriend);
    setShowAddFriendModal(false);
    setNewFriendName("");
    setNewFriendEmail("");
    setNewFriendPhone("");
    setNewFriendHandle("");
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Friends &amp; Direct Balances</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Track direct non-group debts, send payment nudges, and record 1-on-1 settlements.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddFriendModal(true)}>
          <UserPlus size={18} /> Add New Friend
        </button>
      </div>

      {/* Balance Summary Strip */}
      <div className="stat-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-label">
            <Scale size={14} color="var(--primary)" /> Friends Owing You
          </div>
          <div className="stat-val positive">
            {formatCurrency(pairwise.totalYouAreOwed)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Total pending receivables
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <Scale size={14} color="var(--danger)" /> You Owe Friends
          </div>
          <div className="stat-val negative">
            {formatCurrency(pairwise.totalYouOwe)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Total pending payables
          </span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div style={{ marginBottom: "1.25rem", position: "relative", maxWidth: "380px" }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search friends by name or email..."
          style={{ paddingLeft: "2.4rem" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search size={18} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
      </div>

      {/* Friends Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
        {filteredFriends.map(({ user, balance, status }) => {
          const isOwed = status === "owed_to_you";
          const youOwe = status === "you_owe";

          return (
            <div
              key={user.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "1.25rem"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <UserAvatar user={user} size="lg" />
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{user.name}</h3>
                      <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                        {user.paymentHandle || user.email}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`badge ${isOwed ? "badge-success" : youOwe ? "badge-danger" : "badge-purple"}`}
                  >
                    {isOwed ? "Owes You" : youOwe ? "You Owe" : "Settled"}
                  </span>
                </div>

                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-md)",
                    background: isOwed ? "var(--bg-accent-subtle)" : youOwe ? "var(--danger-bg)" : "var(--bg-input)",
                    marginBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Net Balance:
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      color: isOwed ? "var(--primary)" : youOwe ? "var(--danger)" : "var(--text-muted)"
                    }}
                  >
                    {isOwed ? `+${formatCurrency(balance)}` : youOwe ? formatCurrency(balance) : "$0.00"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {isOwed && (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => onOpenSendReminder(user, balance)}
                  >
                    <Bell size={14} /> Send Nudge
                  </button>
                )}

                {youOwe && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => onOpenSettleUp({
                      fromUserId: activeUser.id,
                      toUserId: user.id,
                      amount: Math.abs(balance),
                      notes: `Direct settlement with ${user.name}`
                    })}
                  >
                    <Scale size={14} /> Settle Up
                  </button>
                )}

                {!isOwed && !youOwe && (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => onOpenAddExpense(null)}
                  >
                    <Plus size={14} /> Split A Bill
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Friend Modal */}
      {showAddFriendModal && (
        <div className="modal-overlay" onClick={() => setShowAddFriendModal(false)}>
          <div className="modal-content" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Add New Friend</h3>
              <button className="btn-icon" onClick={() => setShowAddFriendModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateFriend}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jordan Lee"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="jordan.lee@example.com"
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Handle / UPI / Venmo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. jordan@venmo or jordan@upi"
                  value={newFriendHandle}
                  onChange={(e) => setNewFriendHandle(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                  value={newFriendPhone}
                  onChange={(e) => setNewFriendPhone(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddFriendModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <UserPlus size={16} /> Add Friend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
