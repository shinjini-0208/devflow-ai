import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import KanbanBoard from "./components/KanbanBoard";
import CreateTaskModal from "./components/CreateTaskModal";
import TaskCommentsModal from "./components/TaskCommentsModal";
import AIAssistantModal from "./components/AIAssistantModal";
import DashboardPage from "./components/DashboardPage";
import TeamPage from "./components/TeamPage";
import NotificationsPage from "./components/NotificationsPage";
import AuthPage from "./components/AuthPage";

const API_BASE = "https://devflow-ai-backend-ihoj.onrender.com/api" || "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("devflow_token"));

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [activeCommentTask, setActiveCommentTask] = useState(null);
  const [activePage, setActivePage] = useState("kanban");

  const [priorityFilter, setPriorityFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");

  useEffect(() => {
    const savedUser = localStorage.getItem("devflow_user");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      fetchProjects();
      fetchActivitiesAndNotifications();
    }
  }, [user, token]);

  useEffect(() => {
    if (selectedProject && user) {
      fetchTasks(selectedProject._id);
    }
  }, [selectedProject]);

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("devflow_token", userToken);
    localStorage.setItem("devflow_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("devflow_token");
    localStorage.removeItem("devflow_user");
  };

  const handleRoleChange = (newRole) => {
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    localStorage.setItem("devflow_user", JSON.stringify(updatedUser));
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE}/projects`);
      const data = await response.json();
      setProjects(data);
      if (data.length > 0) setSelectedProject(data[0]);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/tasks?projectId=${projectId}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivitiesAndNotifications = async () => {
    try {
      const [actRes, notifRes] = await Promise.all([
        fetch(`${API_BASE}/activities`),
        fetch(`${API_BASE}/notifications`),
      ]);
      setActivities(await actRes.json());
      setNotifications(await notifRes.json());
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  const handleAddProject = async () => {
    if (user?.role === "Developer") {
      alert("Developers cannot create projects (RBAC policy).");
      return;
    }

    const name = window.prompt("Enter new project name:");
    if (!name || !name.trim()) return;

    const description = window.prompt("Enter project description:", "Track tasks and Al workflows.");

    try {
      const response = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const newProj = await response.json();
      setProjects([...projects, newProj]);
      setSelectedProject(newProj);
      setActivePage("kanban");
      fetchActivitiesAndNotifications();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleAddTask = async (newTaskData) => {
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTaskData,
          assignee: user?.name || "You",
          projectId: selectedProject?._id,
        }),
      });
      const savedTask = await response.json();
      setTasks((prev) => [...prev, savedTask]);
      fetchActivitiesAndNotifications();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleApproveAITasks = async (approvedSubtasks) => {
    for (const sub of approvedSubtasks) {
      await handleAddTask({
        title: sub.title,
        description: sub.description,
        priority: sub.priority || "Medium",
        status: "To Do",
        dueDate: "No date",
      });
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
      fetchActivitiesAndNotifications();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (user?.role === "Developer") {
      alert("Permission Denied: Developers can update task status, but only Admins or Managers can delete tasks.");
      return;
    }
    try {
      await fetch(`${API_BASE}/tasks/${taskId}`, { method: "DELETE" });
      setTasks(tasks.filter((task) => task._id !== taskId));
      fetchActivitiesAndNotifications();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, { method: "PATCH" });
      setNotifications(await res.json());
    } catch (error) {
      console.error("Error marking notifications read:", error);
    }
  };

  // If user is not logged in, show Auth Page
  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === "All" || task.assignee === assigneeFilter;
    return matchesPriority && matchesAssignee;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderPage = () => {
    if (loading) return <p style={{ color: "#64748b" }}>Loading project data...</p>;
    if (activePage === "team") return <TeamPage user={user} onRoleChange={handleRoleChange} />;

    if (activePage === "overview") return <DashboardPage tasks={tasks} activities={activities} />;
    
    if (activePage === "notifications") return <NotificationsPage notifications={notifications} onMarkAllRead={handleMarkAllRead} />;

    return (
      <>
        <div className="project-header">
          <div>
            <h1>{selectedProject?.name || "Select a Project"}</h1>
            <p style={{ color: "#64748b", marginTop: "6px" }}>{selectedProject?.description}</p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-ai" onClick={() => setIsAIModalOpen(true)}>✨ AI Copilot</button>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ New Task</button>
          </div>
        </div>

        <div className="filter-bar">
          <label>
            Priority:
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
        </div>

        <KanbanBoard
          tasks={filteredTasks}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
          onOpenComments={(task) => setActiveCommentTask(task)}
        />
      </>
    );
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onAddProjectClick={handleAddProject}
        unreadCount={unreadCount}
      />

      <div className="main-container">
        <header className="navbar">
          <div className="workspace-badge">Workspace: Core Engineering Team</div>
          <div className="user-profile">
            <span>{user.name}</span>
            <span className={`role-tag ${user.role.toLowerCase()}`}>{user.role}</span>
            <button className="btn-secondary" onClick={handleLogout} style={{ padding: "4px 8px", fontSize: "12px", marginLeft: "10px" }}>
              Logout
            </button>
          </div>
        </header>

        <main className="page-content">
          {renderPage()}
          {isModalOpen && <CreateTaskModal onClose={() => setIsModalOpen(false)} onAddTask={handleAddTask} />}
          {isAIModalOpen && <AIAssistantModal project={selectedProject} onClose={() => setIsAIModalOpen(false)} onApproveTasks={handleApproveAITasks} />}
          {activeCommentTask && <TaskCommentsModal task={activeCommentTask} onClose={() => { setActiveCommentTask(null); fetchActivitiesAndNotifications(); }} />}
        </main>
      </div>
    </div>
  );
}

export default App;