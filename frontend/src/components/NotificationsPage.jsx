function NotificationsPage({ notifications, onMarkAllRead }) {
  return (
    <div className="dashboard-container">
      <div className="project-header" style={{ marginBottom: "20px" }}>
        <div>
          <h2>🔔 In-App Notifications</h2>
          <p style={{ color: "#64748b", marginTop: "4px" }}>
            Updates on task assignments, reviews, and completions.
          </p>
        </div>

        <button className="btn-secondary" onClick={onMarkAllRead}>
          ✓ Mark All as Read
        </button>
      </div>

      <div className="recent-activity">
        {notifications.length === 0 ? (
          <p style={{ color: "#64748b" }}>No notifications yet. Create or move a task to generate alerts!</p>
        ) : (
          <ul className="activity-list">
            {notifications.map((n) => (
              <li
                key={n._id}
                className="activity-item"
                style={{
                  backgroundColor: n.isRead ? "transparent" : "#f0f9ff",
                  padding: "12px",
                  borderRadius: "6px",
                }}
              >
                <span className="activity-icon">{n.isRead ? "🔔" : "🔵"}</span>
                <div>
                  <p className="activity-text" style={{ fontWeight: n.isRead ? 400 : 600 }}>
                    {n.message}
                  </p>
                  <span className="activity-time">
                    {new Date(n.createdAt).toLocaleString()}
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

export default NotificationsPage;