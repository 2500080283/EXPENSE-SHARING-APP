import React, { useState } from "react";
import UserAvatar from "../UserAvatar";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  ShieldAlert,
  UserPlus,
  Mail,
  Phone,
  CheckCircle,
  MoreVertical
} from "lucide-react";

export default function AdminUsers({
  users,
  groups,
  expenses,
  onUpdateUser,
  onAddUser
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [phone, setPhone] = useState("");
  const [paymentHandle, setPaymentHandle] = useState("");

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleToggleStatus = (user) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    onUpdateUser({ ...user, status: newStatus });
  };

  const handleToggleRole = (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    onUpdateUser({ ...user, role: newRole });
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser = {
      id: "usr_" + Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
      avatar: "",
      phone: phone.trim() || "+1 (555) 123-4567",
      paymentHandle: paymentHandle.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@venmo`,
      status: "active",
      joinedDate: new Date().toISOString().slice(0, 10)
    };

    onAddUser(newUser);
    setShowAddModal(false);
    setName("");
    setEmail("");
    setPhone("");
    setPaymentHandle("");
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>User Accounts Management</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Oversee registered member identities, grant administrative rights, or toggle account access.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} /> Add Platform User
        </button>
      </div>

      {/* Filter Ribbon */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or email..."
            style={{ paddingLeft: "2.4rem" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        </div>

        <select
          className="form-select"
          style={{ width: "160px" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="suspended">Suspended Only</option>
        </select>

        <select
          className="form-select"
          style={{ width: "160px" }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="user">Standard User</option>
          <option value="admin">Administrator</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Account Status</th>
              <th>Groups Joined</th>
              <th>Total Fronted ($)</th>
              <th>Registered Date</th>
              <th>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const userGroups = groups.filter(g => g.members.includes(user.id));
              const totalPaid = expenses.filter(e => e.paidBy === user.id).reduce((s, e) => s + Number(e.amount), 0);
              const isActive = user.status === "active";
              const isAdmin = user.role === "admin";

              return (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <UserAvatar user={user} size="md" showRole />
                      <div>
                        <div style={{ fontWeight: 700 }}>{user.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {user.email} • {user.paymentHandle || "no handle"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${isAdmin ? "badge-purple" : "badge-info"}`}>
                      {isAdmin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${isActive ? "badge-success" : "badge-danger"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {userGroups.length} groups
                  </td>
                  <td className="mono" style={{ fontWeight: 700 }}>
                    {formatCurrency(totalPaid)}
                  </td>
                  <td>{formatDate(user.joinedDate)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: "0.75rem" }}
                        onClick={() => handleToggleRole(user)}
                        title={isAdmin ? "Demote to User" : "Promote to Admin"}
                      >
                        <Shield size={13} color={isAdmin ? "#818cf8" : "var(--text-muted)"} />
                        {isAdmin ? "Make User" : "Make Admin"}
                      </button>

                      <button
                        className={`btn btn-sm ${isActive ? "btn-outline" : "btn-primary"}`}
                        style={{
                          fontSize: "0.75rem",
                          borderColor: isActive ? "var(--danger)" : "transparent",
                          color: isActive ? "var(--danger)" : "#ffffff"
                        }}
                        onClick={() => handleToggleStatus(user)}
                      >
                        {isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                        {isActive ? "Suspend" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Create Platform User</h3>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Taylor Swift"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="taylor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Initial Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Payment Handle</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="@handle"
                    value={paymentHandle}
                    onChange={(e) => setPaymentHandle(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 987-6543"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-secondary">
                  <UserPlus size={16} /> Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
