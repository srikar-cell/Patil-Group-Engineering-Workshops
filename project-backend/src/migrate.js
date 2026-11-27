const mysql = require("mysql2");

// Database configuration
const DB_HOST = "localhost";
const DB_USER = "root";
const DB_PASSWORD = "Srikar@6476";
const DB_NAME = "taskflow_db";

// MySQL Database Connection Pool
const db = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
}).promise();


// ====================================================================
// SQL QUERY FUNCTIONS
// Every SQL query is encapsulated in its own function.
// ====================================================================

// Query: Create database
function getCreateDatabaseQuery() {
    return "CREATE DATABASE IF NOT EXISTS `taskflow_db`";
}

// Query: Use database
function getUseDatabaseQuery() {
    return "USE `taskflow_db`";
}

// Query: Create tasks table
function getCreateTableQuery() {
    return `
        CREATE TABLE IF NOT EXISTS \`tasks\` (
            \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
            \`title\` VARCHAR(255) NOT NULL,
            \`completed\` BOOLEAN DEFAULT FALSE,
            \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
            \`updatedAt\` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
        )
    `;
}

// Query: Fetch all tasks ordered by id
function getSelectAllTasksQuery() {
    return "SELECT * FROM tasks ORDER BY id ASC";
}

// Query: Search tasks by title
function getSearchTasksQuery() {
    return "SELECT * FROM tasks WHERE title LIKE ? ORDER BY id ASC";
}

// Query: Fetch single task by id
function getSelectTaskByIdQuery() {
    return "SELECT * FROM tasks WHERE id = ?";
}

// Query: Insert new task
function getInsertTaskQuery() {
    return "INSERT INTO tasks (title) VALUES (?)";
}

// Query: Update task fields dynamically
function getUpdateTaskQuery(updateFields) {
    return `UPDATE tasks SET ${updateFields.join(", ")} WHERE id = ?`;
}

// Query: Delete task
function getDeleteTaskQuery() {
    return "DELETE FROM tasks WHERE id = ?";
}


// ====================================================================
// DATABASE INITIALIZATION / MIGRATION FUNCTION
// ====================================================================
async function initDatabase() {
    let rootConn;
    try {
        rootConn = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD
        }).promise();

        await rootConn.query(getCreateDatabaseQuery());
        await rootConn.query(getUseDatabaseQuery());
        await rootConn.query(getCreateTableQuery());

        console.log("MySQL Database & Tables initialized successfully!");
    } catch (error) {
        console.error("Database migration error:", error.message);
        throw error;
    } finally {
        if (rootConn) {
            await rootConn.end();
        }
    }
}

// Allow standalone execution: node src/migrate.js
if (require.main === module) {
    initDatabase()
        .then(() => {
            console.log("Migration completed.");
            process.exit(0);
        })
        .catch(() => process.exit(1));
}


// ====================================================================
// EXPORTS
// Export db connection and all query functions for import by task.js
// ====================================================================
module.exports = {
    db,
    initDatabase,
    getCreateDatabaseQuery,
    getUseDatabaseQuery,
    getCreateTableQuery,
    getSelectAllTasksQuery,
    getSearchTasksQuery,
    getSelectTaskByIdQuery,
    getInsertTaskQuery,
    getUpdateTaskQuery,
    getDeleteTaskQuery
};
