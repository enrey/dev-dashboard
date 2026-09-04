FROM python:3.14-slim AS builder

WORKDIR /app
RUN pip install --no-cache-dir uv

COPY pyproject.toml README.md uv.lock* ./
RUN if [ -f uv.lock ]; then uv sync --frozen; else uv sync; fi


FROM python:3.14-slim AS runtime

WORKDIR /app
RUN pip install --no-cache-dir uv

COPY --from=builder /app/.venv /app/.venv
COPY . .

ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 5005

CMD ["sh", "-c", "uv run alembic upgrade head && uv run uvicorn app.main:app --host 0.0.0.0 --port 5005"]
