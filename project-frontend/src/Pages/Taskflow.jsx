import React, { useState, useEffect } from "react";
import "./taskflow.css";

function Taskflow() {
    // Backend API base URL
    const API_URL = "http://localhost:8000/api/tasks";

    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState("");
    const [newTask, setNewTask] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    // 1. GET task
    const fetchTasks = async (searchQuery = "") => {
        try {
            const url = searchQuery
                ? `${API_URL}?search=${encodeURIComponent(searchQuery)}`
                : API_URL;

            const response = await fetch(url);
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);


    const handleSearch = (e) => {
        const query = e.target.value;
        setSearch(query);
        fetchTasks(query);
    };

    // 2. Add new task
    const addTask = async () => {
        if (newTask.trim() === "") return;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTask.trim() }),
            });

            if (response.ok) {
                const createdTask = await response.json();
                setTasks((prevTasks) => [...prevTasks, createdTask]);
                setNewTask("");
            }
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    // 3. PUT (Edit task title)
    const editTask = async (id, oldTitle) => {
        const title = prompt("Edit task:", oldTitle);
        if (title === null || title.trim() === "") return;

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim() }),
            });

            if (response.ok) {
                const updatedTask = await response.json();
                setTasks((prevTasks) =>
                    prevTasks.map((t) => (t.id === id ? updatedTask : t))
                );
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    // 4. PUT task
    const toggleCompleted = async (id) => {
        const currentTask = tasks.find((t) => t.id === id);
        if (!currentTask) return;

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: !currentTask.completed }),
            });

            if (response.ok) {
                const updatedTask = await response.json();
                setTasks((prevTasks) =>
                    prevTasks.map((t) => (t.id === id ? updatedTask : t))
                );
            }
        } catch (error) {
            console.error("Error toggling task completion:", error);
        }
    };

    // 5. DELETE task
    const deleteTask = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id));
                if (selectedId === id) setSelectedId(null);
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const selectTask = (id) => {
        setSelectedId((prev) => (prev === id ? null : id));
    };

    const selectedTask = tasks.find((t) => t.id === selectedId);

    return (
        <div>
            <header className="header">
                <h1>TaskFlow</h1>
            </header>

            <div className="card">
                <h2>List View</h2>
                <input
                    className="text-box"
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={handleSearch}
                />

                <div className="add-row">
                    <input
                        className="text-box"
                        type="text"
                        placeholder="Add a new task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={addTask}
                    />
                    <button className="add-btn" onClick={addTask}>
                        Add
                    </button>
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

            {/* DETAIL VIEW */}
            {selectedTask && (
                <div className="card">
                    <h2>Detail View</h2>

                    <p className="label">Title</p>
                    <p className="value">{selectedTask.title}</p>

                    <p className="label">Status</p>
                    <p className="value">
                        {selectedTask.completed ? "Completed" : "Pending"}
                    </p>

                    <p className="label">Created</p>
                    <p className="value">
                        {selectedTask.createdAt
                            ? new Date(selectedTask.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })
                            : "N/A"}
                    </p>

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

export default Taskflow;
