# Микроменеджер Dashboard

Микроменеджер Dashboard — панель аналитики активности разработчиков. Проект собирает данные из Git-репозиториев, GitLab, Jira, Confluence и сервисов присутствия, чтобы показывать поток поставки, командное взаимодействие и временные линии работ.

## Состав проекта

- `frontend/` — одностраничное приложение на React и TypeScript.
- `backend/dotnet/` — .NET API для Git, GitLab, Jira, Confluence и фоновых задач.
- `backend/python/users-state/` — FastAPI-сервис для хранения настроек страницы пользователей и ролевых связей в PostgreSQL.
- `docker-compose.yml` — локальный кластер OpenSearch и OpenSearch Dashboards.

## Быстрый запуск через Docker

Потребуются Docker Engine с Compose и `make`.

Из корня репозитория выполните:

```bash
make run
```

Команда собирает и запускает единый локальный Compose-проект: frontend,
OpenSearch, OpenSearch Dashboards, PostgreSQL, Users State API и .NET API для
Jira, Git, GitLab и Confluence. Интеграционные API запускаются в read-only
режиме: они отдают демоданные из OpenSearch и не обращаются к внешним Jira,
GitLab или Confluence.

Откройте <http://localhost:8081>. Дополнительно доступны:

- OpenSearch Dashboards: <http://localhost:5601>
- Users State API: <http://localhost:5005/users-page/state>
- Swagger .NET API: <http://localhost:5001/swagger>, <http://localhost:5002/swagger>, <http://localhost:5003/swagger>, <http://localhost:5006/swagger>

Полезные команды:

```bash
make status       # состояния контейнеров
make stop         # остановить локальный Compose-проект
make seed-demo    # заново импортировать демосрез
```

`make seed-demo` пересоздаёт локальные индексы `jira`, `git`, `gitlab` и
`confluence`. Используйте её только если эти данные можно заменить.

### Проверка сборки .NET

   ```bash
   docker build \
     --file backend/dotnet/Dockerfile.build \
     --tag micromanager-dotnet-build:local \
     backend/dotnet
   ```

Эта команда восстанавливает NuGet-зависимости и собирает весь
`backend/dotnet/git-an.sln` в конфигурации `Release`. Локальная установка .NET
SDK для такой проверки не требуется.

## Локальный запуск без Docker

### Требования

- Node.js 20.19+ и Corepack (входит в Node.js; используется для pnpm).
- .NET SDK 7 для основных API.
- .NET Core SDK 3.1 только для устаревшего сервиса фоновых задач.
- Python 3.14+ и `uv`.
- PostgreSQL 16.
- Локальный OpenSearch на порту `9200`.
- Redis 6.2+ только для сервиса фоновых задач.

### 1. Frontend

1. Скопируйте пример переменных окружения в каталог frontend:

   ```bash
   cp .env.example frontend/.env.local
   ```

2. При необходимости измените URL API в `frontend/.env.local`.

3. Установите зависимости и запустите dev-сервер:

   ```bash
   cd frontend
   corepack enable
   pnpm install --frozen-lockfile
   pnpm dev
   ```

4. Откройте <http://localhost:3000>.

### Frontend demo-режим без бэкенда

Демо использует MSW и снимки тестовых ответов API, включённые в frontend. Поэтому
его можно запускать без Docker, OpenSearch и API-сервисов:

```bash
cd frontend
corepack enable
pnpm install --frozen-lockfile
pnpm demo -- --port 8082
```

Откройте, например,
<http://localhost:8082/actions?dateStart=04-14-2025&dateEnd=04-28-2025>.
В demo-режиме MSW запускается до React и перехватывает запросы к API, поэтому
бэкенд не требуется. Данные в `frontend/src/mocks/data/` — анонимизированный
тестовый срез в тематике «Войны и мира». Для production demo-сборки используйте
`VITE_DEMO=true pnpm build`.

Фронтенд использует pnpm через Corepack. Docker-сборка хранит pnpm store в
BuildKit cache, что ускоряет повторные сборки; не заменяйте его на npm-кэш.

### 2. Users State API

1. Создайте в PostgreSQL базу `users_state_db` и пользователя, указанного в строке подключения.

2. Подготовьте локальные переменные:

   ```bash
   cp backend/python/users-state/dev.env.example \
     backend/python/users-state/dev.env
   ```

3. Запустите миграции и API:

   ```bash
   cd backend/python/users-state
   uv sync
   uv run alembic upgrade head
   uv run dev
   ```

4. Проверьте <http://localhost:5005/users-page/state>.

### 3. .NET API

1. Заполните development-конфиги нужных интеграций:

   - `backend/dotnet/Analyzer.Jira.Web.Api/appsettings.Development.json`
   - `backend/dotnet/Analyzer.Confluence.Web.Api/appsettings.Development.json`
   - `backend/dotnet/Analyzer.GitLab.Web.Api/appsettings.Development.json`
   - `backend/dotnet/Analyzer.Git.Web.Api/appsettings.Development.json`

   Не добавляйте реальные токены и пароли в Git. Для локальных секретов используйте переменные окружения или .NET User Secrets.

2. В отдельных терминалах запустите нужные API:

   ```bash
   ASPNETCORE_URLS=http://localhost:5001 \
     dotnet run --no-launch-profile \
     --project backend/dotnet/Analyzer.Jira.Web.Api

   ASPNETCORE_URLS=http://localhost:5002 \
     dotnet run --no-launch-profile \
     --project backend/dotnet/Analyzer.Git.Web.Api

   ASPNETCORE_URLS=http://localhost:5003 \
     dotnet run --no-launch-profile \
     --project backend/dotnet/Analyzer.GitLab.Web.Api

   ASPNETCORE_URLS=http://localhost:5006 \
     dotnet run --no-launch-profile \
     --project backend/dotnet/Analyzer.Confluence.Web.Api
   ```

3. Swagger будет доступен по адресам `http://localhost:<порт>/swagger`.

## Тесты

Frontend:

```bash
cd frontend
pnpm test
```

Users State API:

```bash
cd backend/python/users-state
uv run pytest
```

## Проверка перед публикацией

Перед созданием публичного репозитория удалите локальные `.env`, сборочные артефакты, внутренние URL, реальные email, токены, пароли и данные компаний.

Проверка текущих файлов:

```bash
gitleaks detect --source . --no-git
trufflehog filesystem .
```

Если репозиторий уже содержит историю Git, дополнительно проверьте всю историю:

```bash
gitleaks git .
trufflehog git file://.
```

Найденные ранее реальные ключи необходимо отозвать у провайдера, даже если они уже удалены из файлов.

## Участие в разработке

См. [CONTRIBUTING.md](CONTRIBUTING.md).

## Безопасность

См. [SECURITY.md](SECURITY.md).

## Лицензия

MIT. См. [LICENSE](LICENSE).
