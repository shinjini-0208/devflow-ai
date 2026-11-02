function Sidebar({
  activePage,
  setActivePage,
  projects,
  selectedProject,
  onSelectProject,
  onAddProjectClick,
  unreadCount = 0,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">⚡ DevFlow AI</div>

      <ul className="sidebar-menu">
        <li
          className={`sidebar-item ${activePage === "overview" ? "active" : ""}`}
          onClick={() => setActivePage("overview")}
        >
          📊 Workspace Overview
        </li>
        <li
          className={`sidebar-item ${activePage === "kanban" ? "active" : ""}`}
          onClick={() => setActivePage("kanban")}
        >
          📋 Project Kanban Board
        </li>
        <li
          className={`sidebar-item ${activePage === "team" ? "active" : ""}`}
          onClick={() => setActivePage("team")}
        >
          👥 Team Members
        </li>
        <li
          className={`sidebar-item ${activePage === "notifications" ? "active" : ""}`}
          onClick={() => setActivePage("notifications")}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span>🔔 Notifications</span>
          {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount}</span>
          )}
        </li>
      </ul>

      <div className="sidebar-projects">
        <div className="sidebar-section-header">
          <span>PROJECTS</span>
          <button
            className="add-project-btn"
            onClick={onAddProjectClick}
            title="Create New Project"
          >
            +
          </button>
        </div>

        <ul className="sidebar-menu">
          {projects.map((proj) => (
            <li
              key={proj._id}
              className={`sidebar-item ${
                selectedProject?._id === proj._id && activePage === "kanban"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                onSelectProject(proj);
                setActivePage("kanban");
              }}
            >
              📁 {proj.name}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;