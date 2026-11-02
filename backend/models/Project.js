const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "Track tasks, ownership, and AI project summaries in one place.",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Archived"],
      default: "Active",
    },
    workspaceId: {
      type: String,
      default: "ws-default",
    },
    createdBy: {
      type: String,
      default: "You",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);