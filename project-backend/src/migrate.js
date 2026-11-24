const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const DB_PASSWORD = process.env.DB_PASSWORD || "Srikar@6476";
const jsonFilePath = path.join(__dirname, "data/tasks.json");

// 1. MySQL Database Connection
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: DB_PASSWORD,
    database: "taskflow_db",
    waitForConnections: true,
    connectionLimit: 10
}).promise();

async function syncJsonFile() {
    try {
        const [rows] = await db.execute("SELECT * FROM tasks ORDER BY id ASC");
        const formatted = rows.map((t) => ({
            ...t,
            completed: Boolean(t.completed)
        }));
        fs.writeFileSync(jsonFilePath, JSON.stringify(formatted, null, 2), "utf-8");
        console.log("tasks.json updated");
    } catch (error) {
        console.error("Error syncing tasks.json:", error.message);
    }
}

// 2. Test and Auto-Initialize Database
async function checkConnection() {
    try {
        const rootConn = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: DB_PASSWORD
        }).promise();

        await rootConn.query("CREATE DATABASE IF NOT EXISTS `taskflow_db`");
        await rootConn.query("USE `taskflow_db`");
        await rootConn.query(`
            CREATE TABLE IF NOT EXISTS \`tasks\` (
                \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
                \`title\` VARCHAR(255) NOT NULL,
                \`completed\` BOOLEAN DEFAULT FALSE,
                \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        await rootConn.end();

        await db.query("SELECT 1");
        console.log("MySQL connected successfully!");
        await syncJsonFile();
    } catch (error) {
        console.error("MySQL connection failed:", error);
    }
}

checkConnection();

// 3. GET task
app.get(["/api/tasks", "/tasks"], async (req, res) => {
    try {
        const { search } = req.query;

        let sql = "SELECT * FROM tasks";
        let values = [];

        if (search) {
            sql += " WHERE title LIKE ?";
            values.push(`%${search}%`);
        }

        sql += " ORDER BY id ASC";

        const [tasks] = await db.execute(sql, values);

        res.status(200).json(tasks.map((t) => ({ ...t, completed: Boolean(t.completed) })));

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// 4. POST task
app.post(["/api/tasks", "/tasks"], async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        // MySQL automatically fills createdAt with CURRENT_TIMESTAMP
        const [result] = await db.execute(
            "INSERT INTO tasks (title) VALUES (?)",
            [title.trim()]
        );

        const [tasks] = await db.execute(
            "SELECT * FROM tasks WHERE id = ?",
            [result.insertId]
        );
        await syncJsonFile();

        res.status(201).json({ ...tasks[0], completed: Boolean(tasks[0].completed) });

    } catch (error) {
        console.error("POST task error:", error);
        res.status(500).json({
            message: error.message
        });
    }
});

// 5. PUT task
app.put(["/api/tasks/:id", "/tasks/:id"], async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;

        const updates = [];
        const values = [];

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    message: "Valid title is required"
                });
            }

            updates.push("title = ?");
            values.push(title.trim());
        }

        if (completed !== undefined) {
            if (typeof completed !== "boolean") {
                return res.status(400).json({
                    message: "Completed must be true or false"
                });
            }

            updates.push("completed = ?");
            values.push(completed ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                message: "No fields provided for update"
            });
        }

        values.push(id);

        const sql = `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`;

        const [result] = await db.execute(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const [tasks] = await db.execute(
            "SELECT * FROM tasks WHERE id = ?",
            [id]
        );

        // Synchronize tasks.json
        await syncJsonFile();

        res.status(200).json({ ...tasks[0], completed: Boolean(tasks[0].completed) });

    } catch (error) {
        console.error("PUT task error:", error);
        res.status(500).json({
            message: error.message
        });
    }
});

// 6. Delete task
app.delete(["/api/tasks/:id", "/tasks/:id"], async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            "DELETE FROM tasks WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }
        await syncJsonFile();

        res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error("DELETE task error:", error);
        res.status(500).json({
            message: error.message
        });
    }
});

// 8. Start Server
const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
