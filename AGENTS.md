# Repository Guidelines

## Project Structure & Module Organization
- Entry point: `server.js` (Express).
- API routes: `routes/*.js` (e.g., `transactions.js`, `accounts.js`, `categories.js`, `health.js`).
- Services: `services/*Service.js` encapsulate Notion and domain logic.
- Middleware: `middleware/*` (`auth`, `logger`, `errorHandler`, `validation`).
- Config & constants: `config/notion.js`, `constants/*` (e.g., `config.js`, `notionProperties.js`).
- Static UI: `public/` (`index.html`, `login.html`, `public/src/App.jsx` and client helpers).
- Environment files: `.env` (local), `.env.example` (reference).

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm start` — start server on `PORT` (default `3000`).
- `npm run dev` — same as start (no hot reload by default).
- No build step; static assets are served from `public/`.
- Example: `PORT=4000 npm start` to change the port.

## Coding Style & Naming Conventions
- JavaScript (Node/CommonJS). Use 2-space indentation, single quotes, and semicolons.
- File names: routes in kebab-case (e.g., `recent-transactions.js`), services in camelCase (e.g., `transactionService.js`), React components in PascalCase (`App.jsx`).
- Code: camelCase for variables/functions; UPPER_SNAKE_CASE for constants and env keys.
- Keep route handlers thin; delegate business logic to `services/` and reuse `middleware/`.

## Testing Guidelines
- No tests are configured yet. If adding tests, prefer Jest.
- Place tests under `__tests__/` mirroring `routes/`, `services/`, and `middleware/`.
- Name files `*.test.js`; mock `@notionhq/client` to avoid live Notion calls.
- Target service and middleware coverage first; add lightweight endpoint tests with supertest if needed.

## Commit & Pull Request Guidelines
- Commits: clear, imperative summaries (e.g., “Add balance endpoint”); optional Conventional Commit scopes (e.g., `fix(session): ...`).
- PRs: concise description, linked issues, screenshots for UI changes, and notes on env/config impacts.
- Include reproduction steps for bug fixes and rationale for refactors; update docs when behavior/config changes.

## Security & Configuration Tips
- Never commit `.env`. Required keys include: `NOTION_API_KEY`, `NOTION_TRANSACTIONS_DB_ID`, `NOTION_CATEGORIES_DB_ID`, `NOTION_ACCOUNTS_DB_ID`, `SESSION_SECRET`, `APP_USERNAME`, `APP_PASSWORD_HASH`.
- Generate password hash once:
  `node -e "const bcrypt=require('bcrypt'); bcrypt.hash('yourPassword', 12).then(console.log)"`
- See `README.md` and `GET_DATABASE_ID.md` for Notion setup details.
