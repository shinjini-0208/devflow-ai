import TaskCard from "./TaskCard";

const COLUMNS = ["Backlog", "To Do", "In Progress", "Review", "Done"];

function KanbanBoard({ tasks, onStatusChange, onDeleteTask, onOpenComments }) {
  return (
    <div className="kanban-board">
      {COLUMNS.map((columnName) => {
        const columnTasks = tasks.filter((task) => task.status === columnName);

        return (
          <div key={columnName} className="kanban-column">
            <div className="kanban-column-header">
              <h3>{columnName}</h3>
              <span className="task-count">{columnTasks.length}</span>
            </div>

            <div className="kanban-column-list">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task._id || task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onDeleteTask={onDeleteTask}
                  onOpenComments={onOpenComments}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KanbanBoard;