# API Documentation

## Authentication

### Login
**Endpoint:** `POST /api/auth/login`

Authenticates a user and returns a session cookie.

#### Request
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Response
**Success (200 OK):**
```json
{
  "message": "Login successful"
}
```
Sets a session cookie in response headers.

**Error Responses:**
- 400 Bad Request (missing fields, invalid email)
- 400 Bad Request (invalid credentials)
- 500 Internal Server Error

### Logout
**Endpoint:** `POST /api/auth/logout`

Invalidates the current user session.

#### Request
Requires a valid session cookie.

#### Response
**Success (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```
Clears session cookie in response headers.

---

### Register
**Endpoint:** `POST /api/auth/register`

Creates a new user account.

#### Request
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "securepassword123",
  "confirmPassword": "securepassword123"
}
```

#### Response
**Success (201 Created):**
```json
{
  "message": "Registration successful",
  "userId": 123
}
```

**Error Responses:**
- 400 Bad Request (missing fields, email in use, passwords don't match)
- 500 Internal Server Error

---

## Journal Entries

### Create Entry
**Endpoint:** `POST /api/entries/add`

Creates a new journal entry.

#### Request
```json
{
  "title": "My Journal Entry",
  "content": "Today was a great day...",
  "category": "Personal",
  "date": "2023-05-15",
  "image": "https://example.com/image.jpg"
}
```

#### Response
**Success (201 Created):**
```json
{
  "success": true,
  "entry": {
    "id": 456,
    "title": "My Journal Entry",
    "content": "Today was a great day...",
    "date": "2023-05-15T00:00:00.000Z",
    "userId": 123,
    "categoryId": 789,
    "image": "https://example.com/image.jpg"
  }
}
```

**Error Responses:**
- 400 Bad Request (validation errors)
- 401 Unauthorized
- 500 Internal Server Error

### Get Entry
**Endpoint:** `GET /api/entries/:id`

Retrieves a specific journal entry.

#### Request
Requires a valid session cookie.

#### Response
**Success (200 OK):**
```json
{
  "success": true,
  "entry": {
    "id": 456,
    "title": "My Journal Entry",
    "content": "Today was a great day...",
    "date": "2023-05-15T00:00:00.000Z",
    "userId": 123,
    "category": {
      "id": 789,
      "title": "Personal",
      "description": "Personal reflections",
      "image": "default.jpg"
    },
    "image": "https://example.com/image.jpg",
    "mood": "Happy",
    "tags": ["reflection", "personal"]
  }
}
```

**Error Responses:**
- 400 Bad Request (invalid ID)
- 401 Unauthorized
- 404 Not Found
- 500 Internal Server Error

---

## User Tags

**Endpoint:** `GET /api/user/tags`

Retrieves all unique tags used by the authenticated user.

#### Response
**Success (200 OK):**
```json
{
  "tags": ["reflection", "personal", "work"]
}
```

---

## Dashboard

**Route:** `/dashboard`

**Method:** `GET`

Retrieves journal entries and analytics data for the authenticated user's dashboard, with optional date filtering.

### Query Parameters
| Parameter  | Type   | Description | Example  |
|------------|--------|-------------|-----------|
| startDate  | string (YYYY-MM-DD) | Optional start date | 2023-05-01 |
| endDate    | string (YYYY-MM-DD) | Optional end date | 2023-05-31 |

### Response
**Success (200 OK):**
```json
{
  "entries": [
    {
      "id": 123,
      "title": "My Journal Entry",
      "content": "Today was a productive day...",
      "date": "2023-05-15T00:00:00.000Z",
      "mood": "Happy",
      "tags": ["productivity", "work"],
      "category": {
        "id": 456,
        "title": "Work",
        "description": "Work-related entries",
        "image": "work-icon.png"
      }
    }
  ]
}
```

**Error Responses:**
- 401 Unauthorized
- 500 Internal Server Error

---

## Profile Edit

**Route:** `/profile.edit`

### Methods:
- `GET`: Retrieves current user profile data.
- `POST`: Updates user profile information.

### Authentication
- Required: Yes
- Type: Session cookie

### GET /profile.edit
#### Response
**Success (200 OK):**
```json
{
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Error Responses:**
- 401 Unauthorized
- 302 Redirect to /login

### POST /profile.edit
#### Request Body (Form Data)
| Field | Type | Required | Description |
|--------|------|----------|-------------|
| name | string | Yes | User's full name (2-100 characters) |
| email | string | Yes | Must be valid and unique |
| phone | string | Yes | Valid phone number format |
| currentPassword | string | Conditional | Required if changing password |
| newPassword | string | Conditional | Must match confirmPassword, min 8 characters |
| confirmPassword | string | Conditional | Must match newPassword |

#### Response
**Success (302 Redirect):** Redirects to `/viewprofile`.

**Error Responses (400 Bad Request):**
```json
{
  "errors": {
    "name": "Name must be between 2 and 100 characters",
    "email": "Invalid email format",
    "phone": "Invalid phone number",
    "password": "Current password is incorrect"
  }
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "An unexpected error occurred. Please try again."
}
```

## Add Journal
### Route: `/api/journal/:journalId/edit`

### GET `/api/journal/:journalId/edit`
**Description:** Retrieves a specific journal entry with associated data for editing.

#### Path Parameters
| Parameter  | Type    | Description                 | Example |
|------------|--------|-----------------------------|---------|
| journalId  | integer | ID of the journal entry to edit | 123     |

#### Response
##### **Success (200 OK)**
```json
{
  "journal": {
    "id": 123,
    "title": "My Journal Entry",
    "content": "Today was a great day...",
    "date": "2023-05-15",
    "mood": "Happy",
    "tags": ["work", "personal"],
    "image": "https://example.com/image.jpg",
    "category": {
      "id": 456,
      "title": "Personal",
      "description": "Personal reflections",
      "image": "default.jpg"
    }
  },
  "categories": [
    {
      "id": 456,
      "title": "Personal",
      "description": "Personal reflections",
      "image": "default.jpg"
    },
    {
      "id": 457,
      "title": "Work",
      "description": "Work-related entries",
      "image": "work.jpg"
    }
  ],
  "existingTags": ["work", "personal", "goals"]
}
```

##### **Error Responses**
- **400 Bad Request:** If journal ID is invalid
- **401 Unauthorized:** If user is not authenticated
- **404 Not Found:** If journal doesn't exist or doesn't belong to user

### PUT `/api/journal/:journalId/edit`
**Description:** Updates an existing journal entry.

#### Path Parameters
| Parameter  | Type    | Description                 | Example |
|------------|--------|-----------------------------|---------|
| journalId  | integer | ID of the journal entry to update | 123     |

#### Request Body (JSON)
```json
{
  "title": "Updated Journal Entry",
  "content": "Updated content...",
  "date": "2023-05-16",
  "category": "Work",
  "tags": ["meeting", "progress"],
  "image": "https://example.com/updated-image.jpg",
  "manualMood": "Excited"
}
```

#### Response
##### **Success (200 OK)**
```json
{
  "message": "Journal entry updated successfully",
  "journalId": 123
}
```

##### **Error Responses**
- **400 Bad Request:**
```json
{
  "error": "Title, content, date and category are required"
}
```
- **500 Internal Server Error:**
```json
{
  "error": "Failed to update journal entry. Please try again."
}
```

---

## Delete Journal
### DELETE `/api/journal/:journalId/delete`
**Description:** Deletes a specific journal entry after verifying ownership.

#### Path Parameters
| Parameter  | Type    | Description                 | Example |
|------------|--------|-----------------------------|---------|
| journalId  | integer | ID of the journal to delete | 123     |

#### Response
##### **Success (200 OK)**
```json
{
  "message": "Journal deleted successfully"
}
```

##### **Error Responses**
- **400 Bad Request:**
```json
{"error": "Invalid journal ID"}
```
- **401 Unauthorized:** If user is not authenticated
- **403 Forbidden:** If user doesn't own the journal
- **404 Not Found:**
```json
{"error": "Journal not found"}
```
- **500 Internal Server Error:**
```json
{"error": "Failed to delete journal"}
```

---

## Journal Listing
### GET `/api/journals`
**Description:** Retrieves filtered journal entries with available filter options.

#### Query Parameters
| Parameter  | Type    | Description                    | Example       |
|------------|--------|--------------------------------|---------------|
| search     | string | Search term for title/content | "meeting"     |
| categoryId | integer | Filter by category ID         | 5             |
| mood       | string | Filter by mood                | "Happy"       |
| startDate  | string (YYYY-MM-DD) | Start date for range filter | "2023-01-01" |
| endDate    | string (YYYY-MM-DD) | End date for range filter   | "2023-12-31" |
| tag        | string | Filter by tag                 | "work"        |

#### Response
##### **Success (200 OK)**
```json
{
  "journals": [
    {
      "id": 123,
      "title": "Team Meeting",
      "content": "Discussed project timeline...",
      "date": "2023-05-15T00:00:00.000Z",
      "mood": "Happy",
      "tags": ["work", "meeting"],
      "category": {
        "id": 5,
        "title": "Work"
      }
    }
  ],
  "filters": {
    "categories": [
      {"id": 5, "title": "Work"},
      {"id": 6, "title": "Personal"}
    ],
    "moods": ["Happy", "Neutral", "Sad"]
  }
}
```

##### **Error Responses**
- **401 Unauthorized:** If user is not authenticated
- **500 Internal Server Error**

