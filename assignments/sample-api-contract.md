# Sample API Contract: Library Books API

> **This is an example.** It shows what a good `API.md` looks like, using a different app (a small library that tracks books). Use it as a guide for format and detail when you write your own TaskFlow contract. Don't copy it.

---

## 1. Overview

| | |
|---|---|
| **Base URL** | `http://localhost:5000/api` |
| **Format** | JSON only. Requests with a body must send `Content-Type: application/json` |
| **Auth** | None (this version) |
| **Storage** | In-memory. Data is lost when the server restarts |
| **Dates** | ISO 8601 strings in UTC, e.g. `"2026-11-16T10:30:00.000Z"` |

---

## 2. Data model

### Book
| Field | Type | Set by | Rules |
|---|---|---|---|
| `id` | string | server | Unique, never changes |
| `title` | string | client | Required, 1–200 characters, spaces trimmed |
| `author` | string | client | Required, 1–100 characters |
| `year` | number | client | Optional, a whole number between 1450 and the current year |
| `available` | boolean | client | Optional. Default `true` |
| `createdAt` | string | server | Set when the book is created |
| `updatedAt` | string | server | Updated on every change |

**Example**
```json
{
  "id": "b7",
  "title": "The Pragmatic Programmer",
  "author": "Andrew Hunt",
  "year": 1999,
  "available": true,
  "createdAt": "2026-11-16T10:30:00.000Z",
  "updatedAt": "2026-11-16T10:30:00.000Z"
}
```

---

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
| 404 | `NOT_FOUND` | No book has that id, or the route doesn't exist |
| 500 | `INTERNAL_ERROR` | Unexpected server failure. The message is generic and never shows a stack trace |

---

## 4. Endpoints

### 4.1 Health check
`GET /health`

**200 OK**
```json
{ "status": "ok", "uptimeSeconds": 512 }
```

---

### 4.2 List books
`GET /books`

**Query parameters (all optional)**
| Param | Type | Example | Effect |
|---|---|---|---|
| `search` | string | `?search=pragmatic` | Case-insensitive match on `title` or `author` |
| `available` | `true` / `false` | `?available=true` | Return only available or only borrowed books |

**200 OK**
```json
{
  "data": [ { "id": "b7", "title": "The Pragmatic Programmer", "...": "..." } ],
  "count": 1
}
```
If nothing matches, the response is `{ "data": [], "count": 0 }`, **not** a 404.

---

### 4.3 Get one book
`GET /books/:id`

**200 OK** returns a `Book`.

**404 Not Found**
```json
{ "error": { "code": "NOT_FOUND", "message": "Book b99 not found" } }
```

---

### 4.4 Create a book
`POST /books`

**Request**
```json
{ "title": "Clean Code", "author": "Robert C. Martin", "year": 2008 }
```

**201 Created** returns the new `Book`, with the `Location: /api/books/b8` header.

**400 Bad Request**: example with two problems
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid book data",
    "details": [
      { "field": "author", "issue": "required" },
      { "field": "year", "issue": "must be an integer between 1450 and 2026" }
    ]
  }
}
```

---

### 4.5 Update a book
`PATCH /books/:id`

Send **only** the fields you want to change. Any field you leave out stays the same. The client can't change `id`, `createdAt`, or `updatedAt`, and the server ignores them if they are sent.

**Request**
```json
{ "available": false }
```

**200 OK** returns the updated `Book` (with a new `updatedAt`).
**400**: the same validation rules as create, applied only to the fields that were sent. An empty body `{}` is also a 400.
**404**: no book has that id.

---

### 4.6 Delete a book
`DELETE /books/:id`

**204 No Content**: the response has no body.
**404**: no book has that id.

---

## 5. Summary table

| Method | URL | Success | Possible errors |
|---|---|---|---|
| GET | `/health` | 200 | – |
| GET | `/books` | 200 | – |
| GET | `/books/:id` | 200 | 404 |
| POST | `/books` | 201 | 400 |
| PATCH | `/books/:id` | 200 | 400, 404 |
| DELETE | `/books/:id` | 204 | 404 |
| *any* | *unknown route* | – | 404 |

---

## 6. Example session (curl)

```bash
curl -X POST http://localhost:5000/api/books -H "Content-Type: application/json" -d '{"title":"Clean Code","author":"Robert C. Martin"}'
# → 201 {"id":"b1","title":"Clean Code",...}

curl -X PATCH http://localhost:5000/api/books/b1 -H "Content-Type: application/json" -d '{"available":false}'
# → 200 {"id":"b1","available":false,...}

curl http://localhost:5000/api/books?available=false
# → 200 {"data":[{"id":"b1",...}],"count":1}

curl -X DELETE http://localhost:5000/api/books/b1
# → 204

curl http://localhost:5000/api/books/b1
# → 404 {"error":{"code":"NOT_FOUND","message":"Book b1 not found"}}
```
