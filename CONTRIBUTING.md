# Contributing

## Development Setup

1. Install the prerequisites from `README.md`.
2. Copy `.env.example` to `.env` and adjust local endpoints.
3. Install frontend dependencies with `npm install` in `frontend/`.
4. Install Python service dependencies with `uv sync` in `backend/python/users-state/`.
5. Restore .NET dependencies with `dotnet restore` in `backend/dotnet/`.

## Pull Requests

- Keep changes scoped and describe the user-visible behavior.
- Add or update tests for behavior changes.
- Do not include real company data, private URLs, credentials, or generated local artifacts.
- Run the relevant checks before opening a PR.

## Checks

Frontend:

```bash
cd frontend
npm test
npm run build
```

Users-state API:

```bash
cd backend/python/users-state
uv run pytest
uvx ruff check app tests
```

Security scan before publication:

```bash
gitleaks detect --source . --no-git
trufflehog filesystem .
```
