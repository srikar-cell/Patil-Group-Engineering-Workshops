const express = require("express");
const router = express.Router();

const {
    db,
    getSelectAllTasksQuery,
    getSearchTasksQuery,
    getSelectTaskByIdQuery,
    getInsertTaskQuery,
    getUpdateTaskQuery,
    getDeleteTaskQuery
} = require("../migrate");

const formatTask = (t) => ({
    ...t,
    completed: Boolean(t.completed)
});

// 1. GET Task (with search)
router.get("/", async (req, res) => {
    try {
        const { search } = req.query;

        let sql;
        let values = [];

        if (search) {
            sql = getSearchTasksQuery();
            values.push(`%${search.trim()}%`);
        } else {
            sql = getSelectAllTasksQuery();
        }

        const [tasks] = await db.execute(sql, values);
        return res.status(200).json(tasks.map(formatTask));
    } catch (error) {
        console.error("GET /tasks error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// 2. GET Single Task by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const sql = getSelectTaskByIdQuery();
        const [tasks] = await db.execute(sql, [id]);

        if (tasks.length === 0) {
            return res.status(404).json({ error: "task not found" });
        }

        return res.status(200).json(formatTask(tasks[0]));
    } catch (error) {
        console.error("GET /tasks/:id error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// 3. POST New Task
router.post("/", async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: "title is required" });
        }

        const insertSql = getInsertTaskQuery();
        const [result] = await db.execute(insertSql, [title.trim()]);

        const selectSql = getSelectTaskByIdQuery();
        const [tasks] = await db.execute(selectSql, [result.insertId]);

        return res.status(201).json(formatTask(tasks[0]));
    } catch (error) {
        console.error("POST /tasks error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// 4. PUT Update Task Title 
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;

        const updates = [];
        const values = [];

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({ error: "valid title is required" });
            }
            updates.push("title = ?");
            values.push(title.trim());
        }

        if (completed !== undefined) {
            if (typeof completed !== "boolean") {
                return res.status(400).json({ error: "completed must be true or false" });
            }
            updates.push("completed = ?");
            values.push(completed ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "no fields provided for update" });
        }

        values.push(id);

        const updateSql = getUpdateTaskQuery(updates);
        const [result] = await db.execute(updateSql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "task not found" });
        }

        const selectSql = getSelectTaskByIdQuery();
        const [tasks] = await db.execute(selectSql, [id]);

        return res.status(200).json(formatTask(tasks[0]));
    } catch (error) {
        console.error("PUT /tasks/:id error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// Fallback PUT / with id in body
router.put("/", async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: "task id is required for update" });
    }
    req.params.id = id;
    return router.handle(req, res);
});

// 5. DELETE Task
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleteSql = getDeleteTaskQuery();
        const [result] = await db.execute(deleteSql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "task not found" });
        }

        return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("DELETE /tasks/:id error:", error);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
