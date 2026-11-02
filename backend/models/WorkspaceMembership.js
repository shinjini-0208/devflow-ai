const mongoose = require("mongoose");

const workspaceMembershipSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: String,
      required: true,
      default: "ws-default",
    },
    userId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Manager", "Developer"],
      default: "Developer",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkspaceMembership", workspaceMembershipSchema);