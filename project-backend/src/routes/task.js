const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const filePath = path.join(__dirname, '../data/tasks.json');

const getTasks = () => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data || '[]');
    } catch (error) {
        return [];
    }
};

const saveTasks = (tasks) => {
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), 'utf-8');
};

// 1. Get all tasks
router.get('/', (req, res) => {
    try {
        let tasks = getTasks();

        // Optional search query (?search=...)
        if (req.query.search) {
<<<<<<< HEAD
            console.log("working or not", req.query.search);
            const term = req.query.search.toLowerCase();
            console.log("working or not term", term);
            tasks = tasks.filter((t) => t.title.toLowerCase().includes(term));

            console.log("working or not tasks >]:", tasks);

        }
        console.log("working or not ", res.json(tasks));
=======
            tasks = tasks.filter((t) =>
                t.title.toLowerCase().includes(req.query.search.toLowerCase())
            );
        }
>>>>>>> b9bbe5884d25bdadb7629e2e420201615afad2fc

        return res.json(tasks);
    } catch (error) {
        console.error("something went wrong please check", error);
        return res.status(500).json({ error: "something went wrong" });
    }
});

// 2. Get single task
router.get('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        const tasks = getTasks();
        const task = tasks.find((t) => t.id === id);

        if (task === undefined) {
            return res.status(404).json({ error: "task not found" });
        }

        return res.json(task);
    } catch (error) {
        console.error("something went wrong please check", error);
        return res.status(500).json({ error: "something went wrong" });
    }
});

// 3. Create a new task
router.post('/', (req, res) => {
    try {
        const { id, title, completed } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({ error: "title is required" });
        }

        const tasks = getTasks();

        let taskId;
        if (id !== undefined && id !== null && id !== "") {
            taskId = Number(id);
            if (Number.isNaN(taskId)) {
                return res.status(400).json({ error: "id must be a valid number" });
            }
            const exists = tasks.some((t) => t.id === taskId);
            if (exists) {
                return res.status(409).json({ error: `Task with id ${taskId} already exists` });
            }
        } else {
            taskId = Date.now();
        }

        const newTask = {
            id: taskId,
            title: title.trim(),
            completed: Boolean(completed) || false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        saveTasks(tasks);

        return res.status(201).json(newTask);
    } catch (error) {
        console.error("something went wrong please check", error);
        return res.status(500).json({ error: "something went wrong" });
    }
});

// 4. Update task
const updateTask = (req, res) => {
    try {
        const id = Number(req.params.id || req.body.id);

        if (!id || Number.isNaN(id)) {
            return res.status(400).json({
                error: "Task ID is required in the URL (e.g. /tasks/:id) or in the request body ({ id })"
            });
        }

        const tasks = getTasks();
        const task = tasks.find((t) => t.id === id);

        if (task === undefined) {
            return res.status(404).json({ error: "task not found" });
        }

        const { title, completed } = req.body;
        if (title !== undefined) task.title = title.trim();
        if (completed !== undefined) task.completed = completed;
        task.updatedAt = new Date().toISOString();

        saveTasks(tasks);
        return res.json(task);
    } catch (error) {
        console.error("something went wrong please check", error);
        return res.status(500).json({ error: "something went wrong" });
    }
};

// Supports both PUT and PATCH, with :id in URL or id in body
router.put('/:id', updateTask);
router.patch('/:id', updateTask);
router.put('/', updateTask);

// 5. Delete task
router.delete('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        const tasks = getTasks();
        const index = tasks.findIndex((t) => t.id === id);

        if (index === -1) {
            return res.status(404).json({ error: "task not found" });
        }

        tasks.splice(index, 1);
        saveTasks(tasks);

        return res.status(204).send();
    } catch (error) {
        console.error("something went wrong please check", error);
        return res.status(500).json({ error: "something went wrong" });
    }
});

module.exports = router;
