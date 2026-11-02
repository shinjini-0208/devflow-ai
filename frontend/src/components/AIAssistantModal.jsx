import { useState } from "react";

function AIAssistantModal({ project, onClose, onApproveTasks }) {
  // Summary State (FR-18, FR-19)
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Task Breakdown State (FR-20, FR-21, FR-22)
  const [featureIdea, setFeatureIdea] = useState("");
  const [proposedTasks, setProposedTasks] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  // 1. Call Backend for Grounded AI Project Summary
  const handleGenerateSummary = async () => {
    if (!project) return;
    try {
      setLoadingSummary(true);
      const res = await fetch("http://localhost:5000/api/ai/summary", {
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

  // 2. Call Backend for Structured AI Task Breakdown
  const handleGenerateBreakdown = async (e) => {
    e.preventDefault();
    if (!featureIdea.trim()) return;

    try {
      setLoadingBreakdown(true);
      const res = await fetch("http://localhost:5000/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureIdea }),
      });
      const data = await res.json();
      if (data.proposedTasks) {
        setProposedTasks(data.proposedTasks);
        // Select all checkboxes by default so user can uncheck any they don't want
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

  // FR-21: Only persist tasks that the human explicitly approved!
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

        {/* SECTION 1: AI Project Summary */}
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

        {/* SECTION 2: AI Task Breakdown with Human Approval Gate */}
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