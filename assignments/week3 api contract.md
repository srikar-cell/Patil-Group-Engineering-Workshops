## 1. Overview

| | |
|---|---|
| **Base URL** | `http://localhost:8000/api` |
| **Format** | JSON only. Requests with a body must send `Content-Type: application/json` |
| **Auth** | None (this version) |
| **Storage** | In-memory. Data is lost when the server restarts |
| **Dates** | ISO 8601 strings in UTC, e.g. `"2026-11-16T10:30:00.000Z"` |

---

## 2. Data model| Field | Type | Set by | Rules |
|---|---|---|---|
| **id**| number | Server | Unique ID generated using Date.now() |
| **title** | string | Client | Required, cannot be empty, spaces trimmed |
| **completed** | boolean | Server | Default va lue is false |
| **createdAt** | string | Server | Automatically generated when the task is created |

**Example**
```json
{
  "id": "100022093",
  "title": "Github Changes",
  "completed" : "false",
  "createdAt": "2026-17-16T10:30:00.000Z",
}
```

## 3. Error format

Every error response has the same shape, no matter which endpoint sent it:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title is required",
    "details": [{ "field": "title", "issue": "required" }]
  }
}
```

| HTTP status | `code` | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | The body is missing a field or has a wrong value. `details` lists each problem |
| 400 | `INVALID_JSON` | The request body isn't valid JSON |
| 404 | `NOT_FOUND` | No task has that id, or the route doesn't exist |
| 500 | `INTERNAL_ERROR` | Unexpected server failure. The message is generic and never shows a stack trace |


## 4. Endpoints

### 4.1 Health check
`GET /health`

**200 OK**
```json
{ "status": "ok", "uptimeSeconds": 512 }
```

### 4.2 List tasks
`GET /tasks`

**Query parameters (all optional)**
| Param | Type | Example | Effect |
|---|---|---|---|
| `search` | string | `?search=Github changes` | Case-insensitive match on `title` |
| `available` | `true` / `false` | `?available=true` | Return only available or only borrowed tasks |


**200 OK**
```json
{
  "data": [ { "id": "100022093", "title": "Github Changes", "...": "..." } ],
  "count": 1
}
```
If nothing matches, the response is `{ "data": [], "count": 0 }`, **not** a 404.

---

### 4.3 Get one book
`GET /tasks/:id`

**200 OK** returns a `tasks`.

**404 Not Found**
```json
{ "error": { "code": "NOT_FOUND", "message": "task 100022093 not found" } }
```

---

### 4.4 Create a task
`POST /tasks`

**Request**
```json
{ "id":"100022093", "title": "react project created", "completed" : "false", "createdAt": "2026-17-16T10:30:00.000Z" }
```

**201 Created** returns the new `tasks`, with the `Location: /api/tasks/100022074` header.

**400 Bad Request**: example with two problems
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid task data",
    "details": [
      { "field": "title", "issue": "required" }
    ]
  }
}
```

### 4.5 Update a task
`PATCH /tasks/:id`

Send **only** the fields you want to change. Any field you leave out stays the same. The client can't change `id`, `createdAt`, or `updatedAt`, and the server ignores them if they are sent.

**Request**
```json
{ "available": false }
```

**200 OK** returns the updated `task` (with a new `updatedAt`).
**400**: the same validation rules as create, applied only to the fields that were sent. An empty body `{}` is also a 400.
**404**: no task has that id.

---

### 4.6 Delete a task
`DELETE /tasks/:id`

**204 No Content**: the response has no body.
**404**: no task has that id.

---

## 5. Summary table

| Method | URL | Success | Possible errors |
|---|---|---|---|
| GET | `/health` | 200 | – |
| GET | `/tasks` | 200 | – |
| GET | `/tasks/:id` | 200 | 404 |
| POST | `/tasks` | 201 | 400 |
| PATCH | `/tasks/:id` | 200 | 400, 404 |
| DELETE | `/tasks/:id` | 204 | 404 |
| *any* | *unknown route* | – | 404 |

---

## 6. Example session (curl)

```bash
curl -X POST http://localhost:8000/api/tasks -H "Content-Type: application/json" -d '{"title":"Github Changes"}'
# → 201 {"id":"100022093","title":" Github changes",...}

curl -X PATCH http://localhost:8000/api/tasks/100022093 -H "Content-Type: application/json" -d '{"available":false}'
# → 200 {"id":"100022093","available":false,...}

curl http://localhost:8000/api/books?available=false
# → 200 {"data":[{"id":"100022093",...}],"count":1}

curl -X DELETE http://localhost:8000/api/tasks/100022093
# → 204

curl http://localhost:8000/api/tasks/100022093
# → 404 {"error":{"code":"NOT_FOUND","message":"task 100022074 not found"}}
```