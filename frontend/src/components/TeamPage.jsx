import { useState } from "react";

function TeamPage({ user, onRoleChange }) {
  const [members, setMembers] = useState([
    { name: user?.name || "You", email: user?.email || "you@example.com", role: user?.role || "Admin", status: "Active" },
    { name: "Aarav", email: "aarav@example.com", role: "Developer", status: "Active" },
    { name: "Priya", email: "priya@example.com", role: "Manager", status: "Active" },
  ]);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Developer");

  const handleInviteMember = (e) => {
    e.preventDefault();
    if (user?.role !== "Admin") {
      alert("Permission Denied: Only Workspace Admins can invite new members!");
      return;
    }
    if (!newName.trim() || !newEmail.trim()) return;

    setMembers([
      ...members,
      { name: newName.trim(), email: newEmail.trim(), role: newRole, status: "Active" },
    ]);
    setNewName("");
    setNewEmail("");
  };

  return (
    <div className="team-container">
      <div className="project-header" style={{ marginBottom: "20px" }}>
        <div>
          <h2>👥 Team Members & Role Permissions (RBAC)</h2>
          <p style={{ color: "#64748b", marginTop: "4px" }}>
            Manage workspace access and test Admin, Manager, and Developer role restrictions.
          </p>
        </div>

        {/* Interactive Role Switcher for Demo & Testing */}
        <div className="filter-bar" style={{ marginTop: 0 }}>
          <label>
            Simulate Your Active Role:
            <select
              value={user?.role || "Admin"}
              onChange={(e) => onRoleChange(e.target.value)}
            >
              <option value="Admin">Admin (Full Access)</option>
              <option value="Manager">Manager (Project & Task Planning)</option>
              <option value="Developer">Developer (Task Execution Only)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Invite Member Form (Admin Only) */}
      <div className="recent-activity" style={{ marginBottom: "24px" }}>
        <h3>Invite New Workspace Member (Admin Only)</h3>
        <form onSubmit={handleInviteMember} className="comment-form" style={{ marginTop: "12px" }}>
          <input
            type="text"
            placeholder="Member Name (e.g., Rohan)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
          >
            <option value="Developer">Developer</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
          <button type="submit" className="btn-primary">
            + Invite Member
          </button>
        </form>
      </div>

      <table className="team-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => {
            const displayRole = index === 0 && user ? user.role : member.role;
            return (
              <tr key={index}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="avatar">👤</span>
                    <strong>{member.name}</strong>
                  </div>
                </td>
                <td>{member.email}</td>
                <td>
                  <span className={`role-badge ${displayRole.toLowerCase()}`}>
                    {displayRole}
                  </span>
                </td>
                <td>
                  <span className="status-indicator">● {member.status}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TeamPage;