const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    actor: {
      type: String,
      default: "You",
    },
    action: {
      type: String,
      required: true, // e.g., "created task 'Fix navbar'" or "moved 'API setup' to Done"
    },
    projectId: {
      type: String,
      default: "proj-default",
    },
    workspaceId: {
      type: String,
      default: "ws-default",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);