function DashboardPage({ tasks, activities = [] }) {
  const totalTasks = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const inReview = tasks.filter((t) => t.status === "Review").length;
  const completed = tasks.filter((t) => t.status === "Done").length;

  // FR-17: Calculate Overdue Tasks (dueDate is before today and status is not Done)
  const today = new Date().toISOString().split("T")[0];
  const overdue = tasks.filter(
    (t) =>
      t.dueDate &&
      t.dueDate !== "No date" &&
      t.dueDate < today &&
      t.status !== "Done"
  ).length;

  return (
    <div className="dashboard-container">
      <h2>Workspace Overview</h2>
      <p style={{ color: "#64748b", marginBottom: "24px" }}>
        Real-time workspace health, overdue work, and live activity history.
      </p>

      <div className="metrics-grid">
        <div className="metric-card">
          <h4>Total Tasks</h4>
          <span className="metric-number">{totalTasks}</span>
          <p className="metric-desc">In selected project</p>
        </div>

        <div className="metric-card progress">
          <h4>Active Tasks</h4>
          <span className="metric-number">{inProgress + inReview}</span>
          <p className="metric-desc">In Progress & Review</p>
        </div>

        <div className="metric-card done">
          <h4>Completed Tasks</h4>
          <span className="metric-number">{completed}</span>
          <p className="metric-desc">Moved to Done column</p>
        </div>

        <div className="metric-card" style={{ borderLeft: "4px solid #ef4444" }}>
          <h4>Overdue Tasks</h4>
          <span className="metric-number" style={{ color: "#ef4444" }}>
            {overdue}
          </span>
          <p className="metric-desc">Past due date & not Done</p>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Live Workspace Activity Log</h3>
        {activities.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            No recorded activity yet. Create, move, or comment on a task to see live logs!
          </p>
        ) : (
          <ul className="activity-list">
            {activities.map((act) => (
              <li key={act._id} className="activity-item">
                <span className="activity-icon">⚡</span>
                <div>
                  <p className="activity-text">
                    <strong>{act.actor}</strong> {act.action}
                  </p>
                  <span className="activity-time">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;