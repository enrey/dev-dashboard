import os
import subprocess
import sys

import uvicorn


def _load_env_file(path: str) -> None:
    if not os.path.isabs(path):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        path = os.path.join(base_dir, path)
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)


def dev() -> None:
    env_file = os.getenv("ENV_FILE", "dev.env")
    _load_env_file(".env")
    _load_env_file(env_file)
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5005"))
    uvicorn.run("app.main:app", host=host, port=port)


def migrate() -> None:
    env_file = os.getenv("ENV_FILE", "dev.env")
    _load_env_file(".env")
    _load_env_file(env_file)
    args = sys.argv[1:] or ["upgrade", "head"]
    raise SystemExit(subprocess.call([sys.executable, "-m", "alembic", *args]))
