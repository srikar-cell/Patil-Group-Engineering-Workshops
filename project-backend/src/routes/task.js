const express = require('express');
const pool = require('../data/db');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const jsonFilePath = path.join(__dirname, '../data/tasks.json');

// Helper to format database row for frontend
const formatTask = (row) => ({
    ...row,
    completed: Boolean(row.completed)
});

// Helper to sync tasks.json
async function syncJsonFile() {
    try {
        const [rows] = await pool.execute('SELECT * FROM tasks ORDER BY id ASC');
        fs.writeFileSync(jsonFilePath, JSON.stringify(rows.map(formatTask), null, 2), 'utf-8');
    } catch (err) {
        console.error('Error syncing tasks.json:', err.message);
    }
}

// 1. GET - Fetch All Tasks and Search Tasks
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;

        let sql = 'SELECT * FROM tasks';
        const values = [];

        if (search) {
            sql += ' WHERE title LIKE ?';
            values.push(`%${search.trim()}%`);
        }

        sql += ' ORDER BY id ASC';

        const [tasks] = await pool.execute(sql, values);
        return res.status(200).json(tasks.map(formatTask));
    } catch (error) {
        console.error('Fetch tasks error:', error);
        return res.status(500).json({ message: error.message });
    }
});

// 2. GET - Fetch Single Task by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [tasks] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        return res.status(200).json(formatTask(tasks[0]));
    } catch (error) {
        console.error('Fetch single task error:', error);
        return res.status(500).json({ message: error.message });
    }
});

// 3. POST - Add New Task
router.post('/', async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({ message: 'Task title is required' });
        }

        const [result] = await pool.execute(
            'INSERT INTO tasks (title) VALUES (?)',
            [title.trim()]
        );

        const [tasks] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        await syncJsonFile();

        return res.status(201).json(formatTask(tasks[0]));
    } catch (error) {
        console.error('Add task error:', error);
        return res.status(500).json({ message: error.message });
    }
});

// 4. PUT - Update Task Title or Completion Status
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;

        const updates = [];
        const values = [];

        if (title !== undefined) {
            if (typeof title !== 'string' || !title.trim()) {
                return res.status(400).json({ message: 'Valid title is required' });
            }
            updates.push('title = ?');
            values.push(title.trim());
        }

        if (completed !== undefined) {
            updates.push('completed = ?');
            values.push(Boolean(completed) ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields provided for update' });
        }

        values.push(id);

        const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
        const [result] = await pool.execute(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const [tasks] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);
        await syncJsonFile();

        return res.status(200).json(formatTask(tasks[0]));
    } catch (error) {
        console.error('Update task error:', error);
        return res.status(500).json({ message: error.message });
    }
});

// 5. DELETE - Delete Task
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await syncJsonFile();
        return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
