import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function AIAssistantModal({ project, onClose, onApproveTasks }) {
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [featureIdea, setFeatureIdea] = useState("");
  const [proposedTasks, setProposedTasks] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  const handleGenerateSummary = async () => {
    if (!project) return;
    try {
      setLoadingSummary(true);
      const res = await fetch(`${API_BASE}/ai/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project._id }),
      });
      const data = await res.json();
      setSummaryData(data);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerateBreakdown = async (e) => {
    e.preventDefault();
    if (!featureIdea.trim()) return;

    try {
      setLoadingBreakdown(true);
      const res = await fetch(`${API_BASE}/ai/breakdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureIdea }),
      });
      const data = await res.json();
      if (data.proposedTasks) {
        setProposedTasks(data.proposedTasks);
        setSelectedIndices(data.proposedTasks.map((_, idx) => idx));
      }
    } catch (error) {
      console.error("Error generating breakdown:", error);
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const toggleCheckbox = (index) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleApproveSelected = async () => {
    const tasksToCreate = proposedTasks.filter((_, idx) =>
      selectedIndices.includes(idx)
    );
    if (tasksToCreate.length === 0) {
      alert("Please select at least one subtask to add.");
      return;
    }
    await onApproveTasks(tasksToCreate);
    setProposedTasks([]);
    setFeatureIdea("");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: "560px" }}>
        <div className="modal-header">
          <h3>✨ DevFlow AI Copilot — {project?.name}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="ai-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4>📊 Grounded Project Summary</h4>
            <button
              className="btn-ai"
              onClick={handleGenerateSummary}
              disabled={loadingSummary}
            >
              {loadingSummary ? "Analyzing..." : "✨ Generate Summary"}
            </button>
          </div>

          {summaryData && (
            <div className="ai-result-box">
              <pre className="ai-summary-text">{summaryData.summary}</pre>
              <p className="ai-caveat">{summaryData.caveats}</p>
            </div>
          )}
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "18px 0" }} />

        <div className="ai-section">
          <h4>🧩 AI Task Breakdown (Approval-Gated)</h4>
          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>
            Describe a feature idea. AI will suggest structured subtasks for your review before saving.
          </p>

          <form onSubmit={handleGenerateBreakdown} className="comment-form">
            <input
              type="text"
              placeholder="e.g., User password reset via email OTP"
              value={featureIdea}
              onChange={(e) => setFeatureIdea(e.target.value)}
            />
            <button type="submit" className="btn-ai" disabled={loadingBreakdown}>
              {loadingBreakdown ? "Thinking..." : "Suggest Tasks"}
            </button>
          </form>

          {proposedTasks.length > 0 && (
            <div className="ai-Subtasks-box">
              <p style={{ fontSize: "12px", fontWeight: 600, marginBottom: "8px", color: "#334155" }}>
                Review & Check Subtasks to Save to Kanban Board:
              </p>

              {proposedTasks.map((pt, idx) => (
                <label key={idx} className="ai-subtask-item">
                  <input
                    type="checkbox"
                    checked={selectedIndices.includes(idx)}
                    onChange={() => toggleCheckbox(idx)}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px" }}>
                      {pt.title}{" "}
                      <span className={`priority-badge priority-${pt.priority.toLowerCase()}`}>
                        {pt.priority}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{pt.description}</div>
                  </div>
                </label>
              ))}

              <div className="modal-actions" style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setProposedTasks([])}
                >
                  Reject All
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleApproveSelected}
                >
                  ✓ Approve & Add ({selectedIndices.length}) Tasks
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIAssistantModal;