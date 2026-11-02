const STATUS_OPTIONS = ["Backlog", "To Do", "In Progress", "Review", "Done"];

function TaskCard({ task, onStatusChange, onDeleteTask, onOpenComments }) {
  const taskId = task._id || task.id;
  const priorityClass = `priority-badge priority-${task.priority.toLowerCase()}`;

  return (
    <div className="task-card">
      <div className="task-card-header">
        <span className={priorityClass}>{task.priority}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="task-due-date">📅 {task.dueDate}</span>
          <button
            className="delete-task-btn"
            onClick={() => onDeleteTask(taskId)}
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </div>

      <h4 className="task-title">{task.title}</h4>
      <p className="task-desc">{task.description}</p>

      <div className="task-footer">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="task-assignee">👤 {task.assignee}</span>
          <button
            className="comment-btn"
            onClick={() => onOpenComments(task)}
            title="View or add comments"
          >
            💬 Discuss
          </button>
        </div>

        <select
          className="status-select"
          value={task.status}
          onChange={(e) => onStatusChange(taskId, e.target.value)}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default TaskCard;