# Student Success Agent

Student Success Agent helps students organize coursework, plan study time, and search for internship opportunities. Its main intelligent feature is a backend **Agentic AI study planner**: it reads a student's unfinished tasks, recommends priorities, builds a schedule, checks that schedule against constraints, and replans when validation finds a problem.

## Agentic AI study planner

The planner is available from **Timetable → Ask AI to plan my week**. The **Tasks** page is used to add, complete, and review tasks; it does not launch the full planning run.

The workflow is:

```text
Supabase tasks and student availability
                 │
                 ▼
       Observe and validate input
                 │
                 ▼
   Gemini recommendations ──► Rules fallback
                 │
                 ▼
      Rank tasks and make a plan
                 │
                 ▼
      Validate schedule constraints
          │               │
       valid          has errors
          │               ▼
          │          Replan schedule
          └───────┬───────┘
                  ▼
       Save plan and show results
```

### What the agent does

1. **Observes the student's work.** The FastAPI route loads the student profile and tasks from Supabase. It passes task titles, deadlines, estimated durations, and statuses to the planning workflow.
2. **Validates task data.** Missing or invalid task fields are rejected before scheduling.
3. **Gets recommendations.** Gemini can return a priority label, a reason, and suggested study hours for each task. If Gemini is unavailable, rate-limited, or not configured, the workflow uses the built-in mock/rules recommendation engine and identifies that source in the result.
4. **Ranks tasks.** The Python priority engine scores incomplete tasks mainly from deadline and duration. A high-priority recommendation can add a modest score boost. Completed tasks are excluded.
5. **Creates a schedule.** The scheduler allocates task hours within the student's available hours per day.
6. **Checks the plan.** The validator checks overlapping blocks, daily study-hour limits, deadline conflicts, and completed tasks.
7. **Replans when needed.** If the first schedule fails validation, the workflow attempts a revised schedule and returns both the initial validation issues and the final result.
8. **Handles overdue work.** Overdue tasks are reported with warnings and can be scheduled in a recovery plan. A `SCHEDULE VALID` result means the final plan passed the implemented checks; it does not erase or meet an already-passed deadline.
9. **Saves and displays the result.** The backend saves the weekly plan in `agent_schedules`. The Timetable page displays priority scores, recommendations, scheduled blocks, validation status, fallback source, and overdue recovery details.

The planner combines Gemini's recommendations with deterministic scheduling and validation rules. Gemini does not decide whether a schedule is valid; the validator checks it.

## Other features

- **Tasks:** Add academic tasks with a course, deadline, and estimated hours; review pending, completed, and overdue work.
- **Timetable:** View the weekly plan, ask the agent to plan from saved tasks, and inspect its results. The page also has a separate missed-block simulation for demonstrating local re-planning behavior.
- **InternshipHunter:** Build a LinkedIn Jobs search from role or company, career goal, skills, degree, and location. In the Next.js page, Gemini can suggest three role and keyword searches using text generation only. Each suggestion opens a LinkedIn search in a new tab; LinkedIn supplies the live postings and company names.
- **Semantic internship matching API:** `POST /internships/match` creates a Gemini embedding and ranks internship rows already stored in Supabase with the `match_internships` pgvector function. This searches the saved internship table; it does not retrieve live LinkedIn listings.

InternshipHunter does not use Google Search grounding or the LinkedIn Jobs API. AI suggestions are search phrases, not claims that a particular listing is open. LinkedIn may require the user to sign in.

## Architecture

```text
Next.js / React UI or vanilla JavaScript UI
                    │
                    ▼
             FastAPI REST API
              ┌─────┴─────┐
              ▼           ▼
        Supabase DB   Python agent workflow
      PostgreSQL +      ├─ Gemini recommendations
        pgvector        ├─ mock/rules fallback
                        ├─ priority engine
                        ├─ scheduler
                        └─ validator and replanner
```

The frontend calls FastAPI. Supabase and Gemini credentials stay on the backend; browser configuration contains only the API URL and the selected demo student ID.

## Technology stack

| Area | Technologies |
| --- | --- |
| Main frontend | Next.js App Router, React, TypeScript, Tailwind CSS, Motion, Bootstrap Icons |
| Alternate frontend | HTML, CSS, and vanilla JavaScript in `vini-frontend/` |
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| Data | Supabase, PostgreSQL, pgvector |
| AI | Google Gemini API through `google-genai`; rules-based fallback for planner recommendations |
| Internship links | LinkedIn Jobs search URLs; LinkedIn displays the results externally |

## Repository layout

```text
student_success_agent/
├── backend/
│   ├── app/                  # FastAPI routes, Supabase, embeddings, Gemini search ideas
│   ├── tests/                # API contract tests (external providers are mocked)
│   └── requirements.txt
├── database/
│   └── schema.sql            # Supabase tables, pgvector index, matching function
├── frontend/                 # Next.js application
│   ├── app/                  # Tasks, Timetable, InternshipHunter pages
│   ├── components/           # Shared UI and agent result display
│   └── lib/                  # API client and frontend types
├── sbs-agentic_ai/           # Agent cycle, recommendations, ranking, scheduler, validators
├── vini-frontend/            # Alternate vanilla JavaScript portal
└── README.md
```

## Setup

### Requirements

- Python 3.10 or later
- Node.js and npm
- A Supabase project for saved profiles, tasks, skills, and schedules
- A Gemini API key for Gemini recommendations, text-only InternshipHunter suggestions, and semantic embeddings

The planner can use its rules fallback when Gemini recommendations are unavailable. InternshipHunter's AI search suggestions require a working Gemini text-generation request; the direct LinkedIn search button works without that feature.

### 1. Configure Supabase

Run [`database/schema.sql`](database/schema.sql) in the Supabase SQL Editor for a new project. The schema creates the `users`, `academic_tasks`, `skills`, `internships`, and `agent_schedules` tables, plus the pgvector matching function. Review it before applying changes to a project with a custom schema.

### 2. Configure the backend

From the repository root, create and activate the backend environment, then install dependencies:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Copy `backend/.env.example` to `backend/.env` and set the values for your Supabase project and Gemini key:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
```

Keep these secrets in `backend/.env`. Never put a Supabase service-role key or Gemini key in a `NEXT_PUBLIC_*` variable or commit a `.env` file.

Start the API from the `backend/` directory:

```powershell
uvicorn app.main:app --reload --port 8000
```

API health check: `http://127.0.0.1:8000/health`

Interactive API docs: `http://127.0.0.1:8000/docs`

### 3. Create a student and tasks

Use `POST /students` in the API docs to create a student profile. Use the returned student ID in the frontend configuration. Add pending tasks with deadlines and positive estimated hours so the agent has work to plan. Set `available_hours` on the student profile to control the daily planning capacity.

The agent plan endpoint is:

```text
POST /students/{user_id}/agent/plan
```

It loads the student's saved tasks, runs the agent cycle, and saves the resulting weekly schedule. The frontend normally calls this endpoint when you click **Ask AI to plan my week** in Timetable.

### 4. Configure and start the Next.js frontend

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_DEMO_USER_ID=YOUR_SUPABASE_STUDENT_UUID
```

Keep `NEXT_PUBLIC_API_URL` matched to the backend port. If you change the frontend environment file, restart the Next.js dev server.

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

### Optional: run the vanilla JavaScript portal

The alternate portal is in `vini-frontend/`. With the backend running on port 8000, serve it from the repository root:

```powershell
python -m http.server 5500 --directory vini-frontend
```

Open `http://127.0.0.1:5500`. Its API base is configured in `vini-frontend/js/`.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check backend availability |
| `POST` | `/students` | Create a student profile |
| `GET` | `/students/{student_id}` | Read a profile |
| `POST` | `/tasks` | Create a task |
| `GET` | `/tasks/{user_id}` | List a student's tasks |
| `PATCH` | `/tasks/{task_id}/status` | Update task status |
| `POST` | `/students/{user_id}/agent/plan` | Run the planner and save its weekly plan |
| `GET` | `/schedule/{user_id}` | Read the saved weekly schedule |
| `POST` | `/internships/search-ideas` | Generate Gemini text-only LinkedIn search phrases |
| `POST` | `/internships/match` | Match against internships already stored in Supabase |

## Demo walkthrough

1. Add multiple pending tasks on the **Tasks** page, with varied due dates and estimated hours. Include one task due yesterday to demonstrate overdue recovery.
2. Open **Timetable** and select **Ask AI to plan my week**.
3. Show the task score order, Gemini or Rules fallback badge, recommendation reasons, and proposed schedule.
4. Point to `SCHEDULE VALID` and explain that it means the final schedule passed the implemented constraints.
5. Show the overdue warning and recovery plan for the task due yesterday.
6. Open **Internships**, generate AI search suggestions, and open one on LinkedIn to show live postings and company names.

## Notes and limitations

- Gemini quotas and model availability are controlled by the configured Google AI project. The agent planner falls back to rules for recommendation errors; the text-only InternshipHunter suggestion request can still fail if its Gemini text-generation request is unavailable.
- Internship results and company information are displayed by LinkedIn after opening a search link. The app does not scrape or embed LinkedIn's job results.
- The semantic matching endpoint requires internship rows with embeddings in Supabase. It cannot find jobs that are not in that table.
- API contract tests mock Supabase and Gemini. They do not replace testing with the configured production services.
- Local `.env` and `.env.local` files are ignored by Git. Rotate any key that has been exposed.
