function Navbar() {
  return (
    <header className="navbar">
      <div className="workspace-badge">
        Workspace: Core Engineering Team
      </div>

      <div className="user-profile">
        <span>You</span>
        <span className="role-tag">Admin</span>
      </div>
    </header>
  );
}

export default Navbar;