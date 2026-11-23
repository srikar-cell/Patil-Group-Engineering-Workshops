import React from "react";
import { useState, useEffect } from "react";
import "./taskflow.css";

function Taskflow() {
    const api = "http://localhost:8000/tasks"
    const [search, setSearch] = useState("");
    const [newTask, setNewTask] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search is handled by the backend (GET /tasks?search=...)
    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`${api}?search=${encodeURIComponent(search)}`)
            .then((res) => {
                if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
                return res.json();
            })
            .then((data) => setTasks(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [api]);

    function addTask() {
        if (newTask.trim() === "") return;

        const today = new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

        setTasks([
            ...tasks,
            { id: Date.now(), title: newTask, completed: false, createdAt: today },
        ]);
        setNewTask("");
    }

    function selectTask(id) {
        if (selectedId === id) {
            setSelectedId(null);
        } else {
            setSelectedId(id);
        }
    }
    function toggleCompleted(id) {
        setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    }

    function editTask(id, oldTitle) {
        const title = prompt("Edit task:", oldTitle);
        if (title === null || title.trim() === "") return;
        setTasks(tasks.map((t) => (t.id === id ? { ...t, title: title } : t)));
    }

    function deleteTask(id) {
        setTasks(tasks.filter((t) => t.id !== id));
        if (selectedId === id) setSelectedId(null);
    }

    const selectedTask = tasks.find((t) => t.id === selectedId);

    return (
        <div>
            <header className="header">
                <h1>TaskFlow</h1>
            </header>

            <div className="card">
                <h2>List View</h2>

                {loading && <p className="value">Loading tasks...</p>}
                {error && <p className="value">Could not load tasks: {error}</p>}

                <input
                    className="text-box"
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="add-row">
                    <input
                        className="text-box"
                        type="text"
                        placeholder="Add a new task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                    />
                    <button className="add-btn" onClick={addTask}>Add</button>
                </div>

                {tasks.map((task) => (
                    <div className="task" key={task.id}>
                        <div>
                            <input
                                type="checkbox"
                                checked={selectedId === task.id}
                                onChange={() => selectTask(task.id)}
                            />
                            <span className={task.completed ? "title done" : "title"}>
                                {task.title}
                            </span>
                        </div>
                        <div className="task-buttons">
                            <button onClick={() => editTask(task.id, task.title)}>Edit</button>
                            <button onClick={() => deleteTask(task.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedTask && (
                <div className="card">
                    <h2>Detail View</h2>

                    <p className="label">Title</p>
                    <p className="value">{selectedTask.title}</p>

                    <p className="label">Status</p>
                    <p className="value">{selectedTask.completed ? "Completed" : "Pending"}</p>

                    <p className="label">Created</p>
                    <p className="value">{selectedTask.createdAt}</p>

                    <div className="task-buttons">
                        <button onClick={() => toggleCompleted(selectedTask.id)}>
                            {selectedTask.completed ? "Mark as Pending" : "Mark as Completed"}
                        </button>
                        <button onClick={() => deleteTask(selectedTask.id)}>Delete</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Taskflow