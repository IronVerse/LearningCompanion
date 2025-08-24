# AI Tutor Backend

This directory contains a simple Node.js/Express server designed to
serve as the backend API for the **AI Personalized Learning
Companion**. The goal of this service is to provide endpoints for
diagnostics, question selection, grading, hint generation and progress
tracking while interfacing with a Postgres database and language
models.

## Prerequisites

- **Node.js** (v14 or later is recommended)
- **npm** (comes bundled with Node.js)
- **PostgreSQL** instance running and accessible (see `.env.example`)
- [Flyway](https://flywaydb.org/) migrations have been applied to
  initialize your database schema.

## Setup

1. Copy the example environment configuration to `.env` and adjust
   values as necessary:

   ```sh
   cp .env.example .env
   # then edit .env in your favourite editor
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

   The API will listen on the port defined in your `.env` file (default
   3000). Visit `http://localhost:3000/health` to check that it’s running.

4. As you build out features, create additional route modules under
   `src/routes` and import them into `src/index.js`. Consider
   organizing business logic into service classes under `src/services`
   to keep routes thin.

## Migrations and Database

This repository includes a sibling `database` directory containing Flyway
migrations and a Docker Compose setup for Postgres. Before running
the backend, ensure that your database is up and the migrations
have been executed:

```sh
cd ../database
docker compose up -d postgres
docker compose run --rm flyway migrate
```

Configure the `DATABASE_URL` in `.env` to point to this Postgres
instance.

## Extending the API

Future steps may include implementing:

- **Diagnostic endpoint** to assess a user’s initial proficiency in
  specified topics.
- **Question selection** logic informed by user mastery (e.g. based
  on Bayesian Knowledge Tracing or simple accuracy heuristics).
- **Grading** endpoints that evaluate user answers and record
  attempts in the `attempts` table.
- **Hint/Explanation** generation using prompts to a language model
  provider.
- **Progress tracking** and administrative views to observe
  individual or cohort performance.

See `src/index.js` for TODO comments marking where these features
should be added in subsequent steps.

# AI Tutor Backend (step 2)

This step refactors the server so **endpoints live in `src/index.js`**, while
logic is in **controllers** and **services**. The controller layer handles HTTP
concerns (params/validation/response codes) and delegates to services which
contain business logic and DB queries.

## Run
```bash
npm install
cp .env.example .env
npm run dev
```

## Folder layout
- `src/index.js` – Express app & routes (endpoints only)
- `src/controllers/*` – translate HTTP to service calls
- `src/services/*` – business logic & database queries
- `src/db/pool.js` – Postgres connection pool
- `src/utils/*` – helpers (errors, response)

## Sample endpoints
- `GET /health` – health check
- `GET /subjects` – list subjects
- `POST /questions/next` – pick the next question for a user/topic
- `POST /questions/grade` – grade selected options and record an attempt
