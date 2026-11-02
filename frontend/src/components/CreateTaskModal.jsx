import { useState } from "react";

function CreateTaskModal({ onClose, onAddTask }) {
  // useState for each input box in our form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("To Do");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("You");

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents browser from refreshing the page

    // Validation: Don't allow empty title (Matches Journey B in your spec!)
    if (!title.trim()) {
      alert("Please enter a task title!");
      return;
    }

    const newTask = {
      id: "t" + Date.now(), // Creates a unique ID using current timestamp
      title,
      description,
      priority,
      status,
      dueDate: dueDate || "No date",
      assignee,
    };

    onAddTask(newTask);
    onClose(); // Close the popup after adding
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3>Create New Task</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <label>
            Task Title *
            <input
              type="text"
              placeholder="e.g., Implement JWT login route"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label>
            Description
            <textarea
              rows="3"
              placeholder="What needs to be done?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="form-row">
            <label>
              Priority
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </label>

            <label>
              Initial Status
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Backlog">Backlog</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Due Date
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>

            <label>
              Assign To
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                <option value="You">You</option>
                <option value="Aarav">Aarav</option>
                <option value="Priya">Priya</option>
              </select>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;