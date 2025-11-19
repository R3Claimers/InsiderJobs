# InsiderJobs

InsiderJobs is a full‑stack job portal where candidates can search and apply for jobs and companies can manage job openings and applications.

- GitHub: https://github.com/R3Claimers/InsiderJobs
- Live Client: https://insiderjobs-r3claimers.vercel.app/

---

## Features

**For candidates**

- Sign in using Clerk authentication.
- Browse all available jobs.
- Filter jobs by **location** and **job role**.
- View detailed job descriptions.
- Upload resume (PDF) to their profile.
- Apply for specific job openings.
- View list and status of their job applications.

**For companies**

- Register and log in as a company.
- Manage company profile (including logo-image upload).
- Post new job openings.
- View the list of posted jobs.
- See applicants for each job with their basic details and resumes.
- Accept or reject applications (update application status).
- Toggle job visibility (visible / hidden from candidates).
- Delete job openings.

---

## Tech Stack

- **Frontend**: React, Vite, React Router, Tailwind CSS, React Toastify, Quill
- **Backend**: Node.js, Express, MongoDB (Mongoose), EJS (for server-side views), express.static()
- **Auth**: Clerk
- **Storage / Media**: Cloudinary for images, cloud storage for uploaded resumes
- **Other**: Multer, pdf-parse, JWT, Bcrypt, Sentry, Morgan, CORS, GeoNames API

---

## Project Structure

```bash
InsiderJobs/
├── client/                 # React + Vite frontend
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── AppDownload.jsx
│       │   ├── Footer.jsx
│       │   ├── Hero.jsx
│       │   ├── JobCard.jsx
│       │   ├── JobListing.jsx
│       │   ├── Loading.jsx
│       │   ├── Navbar.jsx
│       │   └── RecruiterLogin.jsx
│       ├── context/
│       │   └── AppContext.jsx
│       ├── pages/
│       │   ├── AddJob.jsx
│       │   ├── Applications.jsx
│       │   ├── ApplyJob.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Home.jsx
│       │   ├── ManageJobs.jsx
│       │   └── ViewApplications.jsx
│       └── utils/
│           └── api.js
│
└── server/                 # Express backend API
    ├── config/
    │   ├── cloudinary.js
    │   ├── db.js
    │   ├── instrument.js
    │   └── multer.js
    ├── controllers/
    │   ├── companyController.js
    │   ├── jobController.js
    │   ├── userController.js
    │   └── webhooks.js
    ├── middleware/
    │   └── authMiddleware.js
    ├── models/
    │   ├── company.js
    │   ├── job.js
    │   ├── jobApplication.js
    │   └── user.js
    ├── routes/
    │   ├── companyRoutes.js
    │   ├── jobRoutes.js
    │   └── userRoutes.js
    ├── public/              # Serves static files via express.static()
    ├── views/               # EJS templates for server-rendered pages
    └── server.js
```

---

## Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- MongoDB instance (local or hosted)
- Cloudinary account (for company image uploads)
- Clerk project (for authentication)

---

## Environment Variables

Create a `.env` file inside `server/` with at least the following variables (names may need to match your existing config):

```bash
# Server
PORT=5000
MONGO_URI=your-mongodb-connection-string

# JWT / auth (if used inside controllers)
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Clerk
CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_WEBHOOK_SECRET=your-clerk-webhook-secret

# Sentry (optional)
SENTRY_DSN=your-sentry-dsn
```

Also configure the Clerk frontend keys in the Vite client (e.g. `.env` in `client/`):

```bash
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
VITE_API_BASE_URL=http://localhost:5000
```

Adjust variable names if they differ in your actual code.

---

## Setup Instructions

From the repository root:

```powershell
# 1. Install client dependencies
cd client
npm install

# 2. Install server dependencies
cd ../server
npm install
```

Make sure the `.env` files for server (and client, if needed) are created before running the app.

---

## Running the Project Locally

Open two terminals from the repository root.

**Start the backend (server):**

```powershell
cd server
npm run server   # uses nodemon
# or
npm start        # plain node
```

By default the API runs on `http://localhost:5000`.

**Start the frontend (client):**

```powershell
cd client
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`).

---

## API Overview

Base URL (local): `http://localhost:5000`

- Health check: `GET /` → returns `"API working"`.
- Webhooks: `POST /webhooks` → Clerk webhook handler.
- Company routes are under `/api/company`.
- Job routes are under `/api/jobs`.
- User routes are under `/api/users`.

All protected company routes use `protectCompany` middleware, which expects a valid authenticated company (e.g., via JWT or Clerk integration, depending on your implementation).

### Company Routes (`/api/company`)

- `POST /register`

  - Description: Register a new company account with optional logo/image upload.
  - Auth: Public.
  - Body (multipart/form-data):
    - `name`, `email`, `password`, other profile fields.
    - `image` (file, company logo) – handled by Multer.

- `POST /login`

  - Description: Log in a company and return auth token / session data.
  - Auth: Public.
  - Body (JSON): `email`, `password`.

- `GET /company`

  - Description: Get authenticated company profile data.
  - Auth: Protected (`protectCompany`).

- `POST /post-job`

  - Description: Create a new job posting.
  - Auth: Protected.
  - Body (JSON): fields like `title`, `description`, `location`, `type`, `salary`, etc.

- `GET /applicants`

  - Description: Get applicants for the company's jobs, including resume links and application status.
  - Auth: Protected.

- `GET /list-jobs`

  - Description: Get list of jobs posted by the authenticated company.
  - Auth: Protected.

- `PATCH /application-status/:id`

  - Description: Change status of a job application (e.g., `pending`, `accepted`, `rejected`).
  - Auth: Protected.
  - Params: `id` = application ID.
  - Body (JSON): `{ status: "accepted" | "rejected" | "pending" }`.

- `PATCH /job-visibility/:id`

  - Description: Toggle visibility of a job (show/hide from candidates).
  - Auth: Protected.
  - Params: `id` = job ID.
  - Body (JSON): `{ isVisible: boolean }`.

- `DELETE /job/:id`
  - Description: Delete a job posting created by the authenticated company.
  - Auth: Protected.
  - Params: `id` = job ID.

### Job Routes (`/api/jobs`)

- `GET /`

  - Description: Get list of jobs with optional filtering (e.g., by role / location).
  - Auth: Public (used by candidates).
  - Query params (examples):
    - `location` – filter by location.
    - `role` – filter by job role.

- `GET /:id`
  - Description: Get details of a single job by its ID.
  - Auth: Public.

### User Routes (`/api/users`)

- `GET /user`

  - Description: Get profile data of the logged‑in user (candidate).
  - Auth: Typically requires a valid Clerk session (handled by `clerkMiddleware`).

- `POST /apply`

  - Description: Apply to a job as the current user.
  - Body (JSON): contains job ID and possibly additional fields (cover letter, expected salary, etc.).

- `GET /applications`

  - Description: Get list of jobs the user has applied to, including status.
  - Auth: User must be logged in.

- `PUT /resume`
  - Description: Upload or update the user resume.
  - Auth: User must be logged in.
  - Body (multipart/form-data): `resume` (PDF file) – handled by Multer.

---

## High‑Level User Flows

**Candidate flow**

1. Sign in with Clerk on the client.
2. Browse jobs from `/api/jobs` with optional filters.
3. Upload resume via `PUT /api/users/resume`.
4. Apply for a job via `POST /api/users/apply`.
5. Track application status via `GET /api/users/applications`.

**Company flow**

1. Register/Llogin via `/api/company/register` and `/api/company/login`.
2. View company data via `GET /api/company/company`.
3. Post jobs with `POST /api/company/post-job`.
4. View applicants with `GET /api/company/applicants`.
5. Accept/reject applications via `PATCH /api/company/application-status/:id`.
6. Toggle visibility or delete jobs using `PATCH /api/company/job-visibility/:id` and `DELETE /api/company/job/:id`.

---

## Deployment

The client is deployed on Vercel at:

- https://job-portal-new-client-sandy.vercel.app/

You can deploy the server separately (e.g., on Render, Railway, or Vercel Serverless) and set `VITE_API_BASE_URL` accordingly in the client config.

---

## Notes

- Some request/response shapes are inferred from the route names and may differ slightly from your actual implementation. Adjust field names and examples as needed.
- For full details, see the controllers in `server/controllers/` and models in `server/models/`.
