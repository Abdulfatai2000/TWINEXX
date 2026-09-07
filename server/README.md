# TWINEX Backend (Express + MongoDB + Clerk)

Express API server for the TWINEX mobile app.

## Tech Stack

- **Node.js** + **Express** — REST API
- **MongoDB Atlas** — database (via Mongoose ODM)
- **Clerk** — authentication (JWT verification via `@clerk/clerk-sdk`)
- **Render** — free-tier hosting

## Project Structure

```
server/
├── src/
│   ├── server.js          # Express app entry point
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js        # clerkId, name, email, pin, subscription_*
│   │   ├── Task.js        # ownerId, title, description, dueDate, status
│   │   └── Connection.js  # requester_id, target_id, mentor_id, student_id, status
│   ├── routes/
│   │   ├── authRoutes.js      # POST /sync, GET /me
│   │   ├── taskRoutes.js      # CRUD /tasks
│   │   ├── userRoutes.js      # PATCH /users/me (subscription sync)
│   │   └── connectionRoutes.js # CRUD /connections
│   └── utils/
│       └── auth.js            # Clerk middleware + PIN generation
├── .env.example
├── package.json
└── render.yaml
```

## API Endpoints

| Method | Path               | Description                              |
|--------|--------------------|------------------------------------------|
| GET    | `/health`          | Health check                             |
| POST   | `/api/auth/sync`   | Ensure MongoDB user exists (auto-create) |
| GET    | `/api/auth/me`     | Current user profile                     |
| GET    | `/api/tasks`       | List current user's tasks                |
| POST   | `/api/tasks`       | Create a task                            |
| PATCH  | `/api/tasks/:id`   | Update a task                            |
| DELETE | `/api/tasks/:id`   | Delete a task                            |
| PATCH  | `/api/users/me`    | Update subscription fields (RevenueCat)  |
| GET    | `/api/connections` | List active connections                  |
| GET    | `/api/connections/pending` | List pending incoming requests    |
| POST   | `/api/connections` | Send a connection request by PIN         |
| PATCH  | `/api/connections/:id` | Accept / decline a connection         |

All `/api/*` endpoints require a `Bearer <clerk-jwt>` token in the `Authorization` header.

## Local Development

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and Clerk secret key
npm install
npm run dev
```

The server starts on `http://localhost:3000` (or `PORT` env var).

## Environment Variables

| Variable             | Required | Description                                   |
|----------------------|----------|-----------------------------------------------|
| `MONGODB_URI`        | Yes      | MongoDB Atlas connection string               |
| `CLERK_SECRET_KEY`   | Yes      | Clerk backend secret key (`sk_test_...`)      |
| `PORT`               | No       | Server port (default: 3000)                   |
| `NODE_ENV`           | No       | `development` or `production`                 |

## Deploying to Render

1. Copy `server/render.yaml` to your repo
2. In the Render dashboard, click "New" → "Web Service"
3. Connect your GitHub repo
4. Set the following environment variables in the Render dashboard:
   - `MONGODB_URI` — your MongoDB Atlas URI
   - `CLERK_SECRET_KEY` — your Clerk secret key
   - `NODE_ENV` — `production`
   - `PORT` — `10000` (Render free tier requirement)
5. Deploy!

Alternatively, use the `render.yaml` file for a fully automated deploy.