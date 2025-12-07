import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState("");


  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/tasks/");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);
  async function handleAddTask(e) {
    e.preventDefault(); // stop page reload

    if (!newTitle.trim()) {
      return; // ignore empty input
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/tasks/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const createdTask = await response.json();
      // add new task to list
      setTasks((prev) => [...prev, createdTask]);
      setNewTitle(""); // clear input
    } catch (err) {
      setError(err.message);
    }
  }
    async function handleToggleComplete(task) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/tasks/${task.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: task.title,
          completed: !task.completed, // flip the value
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updated = await response.json();

      // update task in state
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteTask(id) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/tasks/${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      // remove task from state
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }




      return (
    <div className="container">
      <h1>Task Manager</h1>

      <form onSubmit={handleAddTask}>
        <input
          type="text"
          value={newTitle}
          placeholder="Enter task..."
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" className="add-btn">Add</button>
      </form>

      {loading && <p>Loading tasks...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <ul style={{ paddingLeft: "0" }}>
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <span>
              {task.title}{" "}
              {task.completed ? (
                <span className="done-text">(Done)</span>
              ) : (
                <span className="pending-text">(Pending)</span>
              )}
            </span>

            <div className="action-btns">
              <button
                className="toggle-btn"
                onClick={() => handleToggleComplete(task)}
              >
                {task.completed ? "Undo" : "Done"}
              </button>

              <button
                className="delete-btn"
                onClick={() => handleDeleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );


}

export default App;
