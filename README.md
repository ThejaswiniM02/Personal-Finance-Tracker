# Personal Finance Tracker

A full‑stack personal finance tracker built as a Frontend Developer Intern assignment.  
It showcases a modern React dashboard, secure authentication, and a basic Node/Express backend with MongoDB.

## Tech Stack

- Frontend: React (Vite), React Router, Tailwind CSS
- Backend: Node.js, Express, MongoDB (Mongoose)
- Auth: JWT (JSON Web Tokens), bcrypt for password hashing

## Features

- User signup, login, and logout with JWT
- Protected routes for dashboard and profile
- Dashboard with:
  - Summary cards (total income, total expense, net balance)
  - Add, edit, delete transactions (income/expense)
  - Filters by type and category
  - Text search on category/note
- Profile page:
  - View email
  - Update name (and persisted on backend)
- Error handling and validation on both client and server

## Getting Started

### 1. Clone the repo

git clone https://github.com/<your-username>/<this-repo>.git
cd <this-repo>

text

### 2. Backend setup

cd backend
npm install

text

Create a `.env` file in `backend`:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

text

Run the backend:

npm run dev

text

The API will be available at `http://localhost:5000`.

### 3. Frontend setup

In another terminal:

cd frontend # or project root if frontend is at top level
npm install
npm run dev

text

The app will be available at `http://localhost:5173` (Vite default).

## API Overview

Base URL: `http://localhost:5000`

### Auth

- `POST /api/auth/signup`  
  - Body: `{ name, email, password }`  
  - Returns: `{ token, user }`

- `POST /api/auth/login`  
  - Body: `{ email, password }`  
  - Returns: `{ token, user }`

- `GET /api/auth/me`  
  - Headers: `Authorization: Bearer <token>`  
  - Returns current user profile

- `PATCH /api/auth/me`  
  - Headers: `Authorization: Bearer <token>`  
  - Body: `{ name }` (and other profile fields as added)  
  - Updates and returns user profile

### Transactions

All transaction routes require `Authorization: Bearer <token>`.

- `GET /api/transactions` – list all transactions for the logged‑in user  
- `POST /api/transactions` – create a transaction  
  - Body: `{ amount, type, category, date, note }`
- `PATCH /api/transactions/:id` – update a transaction  
- `DELETE /api/transactions/:id` – delete a transaction

## Security Practices

- Passwords are hashed with bcrypt before storing in MongoDB.
- JWT is used for stateless authentication, verified by middleware on protected routes.
- Transaction routes are scoped to the authenticated user via middleware.

## Scaling Notes

If taken to production, the project can be scaled by:

- Splitting frontend and backend into separate deployable services
- Using environment‑based configuration for API base URLs and secrets
- Adding centralized logging, rate limiting, and request validation
- Moving static assets and user uploads to a CDN/object storage
- Introducing role‑based access control if needed
