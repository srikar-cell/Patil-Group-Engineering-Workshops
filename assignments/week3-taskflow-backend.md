# Week 3 Assignment: TaskFlow Backend (REST API)

> **The goal:** Tasks should be stored on a server instead of only in the browser. When you refresh the page, your tasks should still be there (as long as the server keeps running).

**What this covers:** Node.js core ideas, Express, REST routes, middleware, and the request/response cycle.
**What this leaves out (for now):** Login/JWT, password hashing, and databases. Week 4 adds the database. You prepare for that by keeping all data access in **one file** (see Part 2).

---

## Part 0: Write the API contract first (do this before any code)

Create `project-backend/API.md`. List every endpoint with its method, URL, request body, success response, and error responses. Get it reviewed before you start coding.

Base URL: `http://localhost:5000/api`

| Method | URL | Body | Success | Errors |
|---|---|---|---|---|
| GET | `/health` | – | `200 { "status": "ok" }` | – |
| GET | `/tasks` | – | `200 [Task, ...]` | – |
| GET | `/tasks/:id` | – | `200 Task` | `404` |
| POST | `/tasks` | `{ "title": "Buy milk" }` | `201 Task` | `400` if the title is missing or empty |
| PATCH | `/tasks/:id` | `{ "title"?: string, "completed"?: boolean }` | `200 Task` | `400`, `404` |
| DELETE | `/tasks/:id` | – | `204` (no body) | `404` |

**Task shape** (the server creates `id` and `createdAt`, not the browser):
```json
{ "id": "1", "title": "Buy milk", "completed": false, "createdAt": "2026-11-16T10:30:00.000Z" }
```

**Every error uses this one shape:**
```json
{ "error": { "message": "Task not found" } }
```

---

## Part 1: Fix the old code and set up the project

1. Look at `project-backend/http.js`. It has two bugs: `listen()` is called *inside* the request handler, and `myServer()` is called as if it were a function. Fix it and explain why the old version could never start. Write a short comment in the file.
2. In `project-backend`, install the packages:
   ```bash
   npm install express cors
   npm install --save-dev nodemon
   ```
3. Add the scripts `"start": "node src/server.js"` and `"dev": "nodemon src/server.js"`.
4. Read the port from the environment: `process.env.PORT || 5000`.

---

## Part 2: Build the backend with layers (this is the most important part)

Use this folder structure:

```
project-backend/src/
  server.js              # starts the server (app.listen)
  app.js                 # creates the Express app, adds middleware and routes
  routes/tasks.routes.js       # only matches URLs to controller functions
  controllers/tasks.controller.js  # reads req, calls the store, sends res
  store/tasks.store.js         # THE ONLY FILE THAT TOUCHES DATA
  middleware/logger.js
  middleware/validateTask.js
  middleware/notFound.js
  middleware/errorHandler.js
```

### The store rule (this is what gets you ready for Week 4)
`tasks.store.js` keeps the tasks in an array in memory and exports these functions. **Every one of them must be `async`**, even though an array doesn't need it:

```js
async function getAll() {}
async function getById(id) {}
async function create({ title }) {}
async function update(id, changes) {}   // returns null if not found
async function remove(id) {}            // returns false if not found
```

Controllers must **never** touch the array directly. They always go through these functions. Next week we will replace only this one file with database code, and nothing else in the app should need to change. That is how you will know you did it right.

### Middleware to write
- **logger**: prints `METHOD URL STATUS - Xms` for every request (hint: `res.on("finish", ...)`).
- **validateTask**: used on POST and PATCH. Rejects an empty or missing `title` and a `completed` value that isn't `true`/`false`. Responds with `400`.
- **notFound**: any unknown route returns `404` in the standard error shape.
- **errorHandler**: the last middleware, with the signature `(err, req, res, next)`. It catches any error and returns `500` without crashing the server.

Also add `express.json()` and `cors()` (allow `http://localhost:3000`).

---

## Part 3: Connect the TaskFlow frontend

1. Create `project-frontend/src/api/tasksApi.js`. All `fetch` calls go in this file, and components never call `fetch` directly. Read the base URL from `process.env.REACT_APP_API_URL`, and put that value in a `.env` file.
2. In `Taskflow.jsx`:
   - Load the tasks from `GET /tasks` inside `useEffect` when the page opens.
   - Change add, edit, delete, and mark completed so they call the API and then update the state **from the server's response**. Don't use `Date.now()` for ids anymore.
   - Add `loading` and `error` state. Show "Loading..." while a request is running, and show a clear error message if the server is down. Disable the Add button while a request is running.
   - Fix the small bug: the input doesn't clear after you add a task (`setNewTask("")` is commented out).
3. Show `createdAt` as a readable date in the Detail View. The server sends an ISO string.

---

## Part 4: Test it

- Test **every** endpoint with Postman or Thunder Client, including the error cases (empty title, an id that doesn't exist, an unknown route). Save the collection in `project-backend/` and commit it.
- Turn the backend off and check that the frontend shows your error message instead of a blank page.

---

## Deliverables (one PR from a branch named `week3-backend`)
- [ ] `API.md` (reviewed before coding)
- [ ] Fixed `http.js` with a comment
- [ ] Express backend with the layered structure above
- [ ] Frontend loads and changes tasks only through the API, with loading and error states
- [ ] Postman/Thunder Client collection
- [ ] README section: how to run the backend and the frontend together

## How it will be reviewed
| Area | What we look for |
|---|---|
| Contract | The code matches `API.md` exactly: status codes, shapes, and errors |
| Layers | Only `tasks.store.js` touches the data array |
| Middleware | Validation, 404, and the error handler all work. The server never crashes |
| Frontend | No direct `fetch` in components. Loading and error states show up |
| Git | A clean branch, small commits, and a clear PR description |

## Stretch goals (optional)
- `GET /tasks?search=milk&completed=false`: move the search filter to the server.
- Return `{ data, count }` from `GET /tasks` instead of a plain array. Update the contract first.
- Save the in-memory array to a `tasks.json` file using `fs/promises` so the tasks survive a server restart. Change only the store file.

---
*Coming in Week 4: replace `tasks.store.js` with a database. Coming after that: signup/login with JWT and bcrypt. Each task will then belong to a user.*
