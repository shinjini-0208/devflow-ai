const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Backlog", "To Do", "In Progress", "Review", "Done"],
      default: "To Do",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    dueDate: {
      type: String,
      default: "No date",
    },
    assignee: {
      type: String,
      default: "You",
    },
    workspaceId: {
      type: String,
      default: "ws-default", // We will link real workspaces in Stage 4!
    },
    projectId: {
      type: String,
      default: "proj-default",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt!
  }
);

module.exports = mongoose.model("Task", taskSchema);