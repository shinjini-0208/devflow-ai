const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Models
const Task = require("./models/Task");
const Project = require("./models/Project");
const Comment = require("./models/Comment");
const Activity = require("./models/Activity");
const Notification = require("./models/Notification");
const User = require("./models/User");
const WorkspaceMembership = require("./models/WorkspaceMembership");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "devflow_super_secret_key_2026";

app.use(cors());
app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "DevFlow AI Backend is running smoothly!" });
});

// ==========================================
// AUTHENTICATION ROUTES (FR-01, FR-02, NFR-01)
// ==========================================

// 1. Register Route
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    await WorkspaceMembership.create({
      userId: newUser._id.toString(),
      role: "Admin",
    });

    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: "Admin" },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// 2. Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const membership = await WorkspaceMembership.findOne({ userId: user._id.toString() });
    const role = membership ? membership.role : "Developer";

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// ==========================================
// PROJECT ROUTES
// ==========================================
app.get("/api/projects", async (req, res) => {
  try {
    let projects = await Project.find().sort({ createdAt: 1 });

    if (projects.length === 0) {
      projects = await Project.insertMany([
        {
          name: "Website Redesign Project",
          description: "Track tasks, ownership, and AI project summaries in one place.",
          status: "Active",
        },
        {
          name: "Mobile App API",
          description: "Build authentication and REST endpoints for the mobile client.",
          status: "Active",
        },
      ]);

      await Task.updateMany(
        { projectId: "proj-default" },
        { projectId: projects[0]._id.toString() }
      );
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const newProject = await Project.create({
      name: name.trim(),
      description: description || "Track tasks, ownership, and AI project summaries in one place.",
    });

    await Activity.create({
      actor: "You",
      action: `created project "${newProject.name}"`,
      projectId: newProject._id.toString(),
    });

    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: "Failed to create project", error: error.message });
  }
});

// ==========================================
// TASK ROUTES
// ==========================================
app.get("/api/tasks", async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};
    const tasks = await Task.find(filter).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignee, projectId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || "No date",
      assignee: assignee || "You",
      projectId: projectId || "proj-default",
    });

    await Activity.create({
      actor: assignee || "You",
      action: `created task "${newTask.title}" (${newTask.priority} priority) assigned to ${newTask.assignee}`,
      projectId: newTask.projectId,
    });

    await Notification.create({
      recipient: newTask.assignee,
      message: `New task assigned to ${newTask.assignee}: "${newTask.title}"`,
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: "Failed to create task", error: error.message });
  }
});

app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Activity.create({
      actor: "You",
      action: `moved task "${updatedTask.title}" to ${updatedTask.status}`,
      projectId: updatedTask.projectId,
    });

    if (updatedTask.status === "Done" || updatedTask.status === "Review") {
      await Notification.create({
        recipient: "You",
        message: `Task "${updatedTask.title}" was moved to ${updatedTask.status}.`,
      });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: "Failed to update task", error: error.message });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Activity.create({
      actor: "You",
      action: `deleted task "${deletedTask.title}"`,
      projectId: deletedTask.projectId,
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete task", error: error.message });
  }
});

// ==========================================
// COMMENT, ACTIVITY & NOTIFICATION ROUTES
// ==========================================
app.get("/api/tasks/:taskId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Failed to load comments" });
  }
});

app.post("/api/tasks/:taskId/comments", async (req, res) => {
  try {
    const { body, author } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const newComment = await Comment.create({
      taskId: req.params.taskId,
      author: author || "You",
      body: body.trim(),
    });

    const task = await Task.findById(req.params.taskId);
    if (task) {
      await Activity.create({
        actor: author || "You",
        action: `commented on "${task.title}": "${body.trim()}"`,
        projectId: task.projectId,
      });
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: "Failed to post comment" });
  }
});

app.get("/api/activities", async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(20);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Failed to load activities" });
  }
});

app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to load notifications" });
  }
});

app.patch("/api/notifications/read-all", async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    const updated = await Notification.find().sort({ createdAt: -1 }).limit(20);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notifications read" });
  }
});

// ==========================================
// GEN-AI ROUTES
// ==========================================
app.post("/api/ai/summary", async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findById(projectId);
    const tasks = await Task.find({ projectId });
    const recentActivities = await Activity.find({ projectId })
      .sort({ createdAt: -1 })
      .limit(10);

    if (tasks.length === 0) {
      return res.json({
        summary: "No tasks exist in this project yet. Add tasks to generate a grounded progress report.",
        caveats: "Explicit uncertainty: 0 task records found in database.",
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const counts = {
      Backlog: tasks.filter((t) => t.status === "Backlog").length,
      "To Do": tasks.filter((t) => t.status === "To Do").length,
      "In Progress": tasks.filter((t) => t.status === "In Progress").length,
      Review: tasks.filter((t) => t.status === "Review").length,
      Done: tasks.filter((t) => t.status === "Done").length,
    };
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && t.dueDate !== "No date" && t.dueDate < today && t.status !== "Done"
    );
    const noDateCount = tasks.filter((t) => !t.dueDate || t.dueDate === "No date").length;

    const completionRate = Math.round((counts["Done"] / tasks.length) * 100);
    const inProgressTitles = tasks
      .filter((t) => t.status === "In Progress" || t.status === "Review")
      .map((t) => `"${t.title}" (${t.assignee})`)
      .join(", ");

    const summaryLines = [
      `• Overall Progress: ${completionRate}% complete (${counts["Done"]} of ${tasks.length} tasks Done).`,
      `• Active Work: ${counts["In Progress"]} In Progress and ${counts["Review"]} in Review${
        inProgressTitles ? ` — ${inProgressTitles}` : ""
      }.`,
      `• Upcoming Queue: ${counts["To Do"]} task(s) in To Do and ${counts["Backlog"]} in Backlog.`,
      overdueTasks.length > 0
        ? `• Attention Needed: ${overdueTasks.length} overdue task(s): ${overdueTasks
            .map((t) => `"${t.title}" (Due ${t.dueDate})`)
            .join(", ")}.`
        : `• Schedule Health: All dated tasks are currently on track.`,
    ].join("\n");

    const caveats =
      noDateCount > 0
        ? `Caveat: ${noDateCount} task(s) have "No date" assigned, so schedule risk cannot be fully verified for them.`
        : "Grounded in 100% of authorized project task records.";

    res.json({ summary: summaryLines, caveats });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate AI summary", error: error.message });
  }
});

app.post("/api/ai/breakdown", async (req, res) => {
  try {
    const { featureIdea } = req.body;
    if (!featureIdea || !featureIdea.trim()) {
      return res.status(400).json({ message: "Please provide a feature idea to break down." });
    }

    const cleanIdea = featureIdea.trim();

    const proposedTasks = [
      {
        title: `Design data schema & API contract for: ${cleanIdea}`,
        description: `Define MongoDB fields, validation rules, and REST endpoint payloads for ${cleanIdea}.`,
        priority: "High",
      },
      {
        title: `Implement backend controller & routes for: ${cleanIdea}`,
        description: `Build Express routes with workspace permission checks and error handling.`,
        priority: "High",
      },
      {
        title: `Build React UI components for: ${cleanIdea}`,
        description: `Create responsive frontend view, form state, and loading/error feedback.`,
        priority: "Medium",
      },
      {
        title: `Test permissions & edge cases for: ${cleanIdea}`,
        description: `Verify authorized and unauthorized flows and validate inputs end-to-end.`,
        priority: "Low",
      },
    ];

    res.json({ proposedTasks });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate task breakdown", error: error.message });
  }
});

// ==========================================
// DATABASE & SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/devflow-ai";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("📦 Connected to MongoDB successfully!");
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });