const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: "You",
    },
    body: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
    },
    workspaceId: {
      type: String,
      default: "ws-default",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);