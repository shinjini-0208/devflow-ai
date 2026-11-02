const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      default: "You",
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    workspaceId: {
      type: String,
      default: "ws-default",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);