import { useState, useEffect } from "react";

function TaskCommentsModal({ task, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchComments();
  }, [task]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${task._id}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${task._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newComment, author: "You" }),
      });
      const saved = await res.json();
      setComments([...comments, saved]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3>💬 Discussion: {task.title}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="comments-list">
          {comments.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>
              No comments yet. Start the discussion below!
            </p>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="comment-item">
                <div className="comment-meta">
                  <strong>👤 {c.author}</strong>
                  <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p>{c.body}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddComment} className="comment-form">
          <input
            type="text"
            placeholder="Write a comment or update..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit" className="btn-primary">Send</button>
        </form>
      </div>
    </div>
  );
}

export default TaskCommentsModal;