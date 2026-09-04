# Users State Database

Сервис хранит состояние страницы пользователей в нормализованной реляционной схеме. Внешний API по-прежнему отдаёт и принимает единый `UserPageState`, но внутри данные разложены по таблицам пользователей, ролей и связей.

```mermaid
erDiagram
    users_page_state {
        int id PK "singleton row, id = 1"
        int version "optimistic lock version"
        timestamptz created_at
        timestamptz updated_at
    }

    users {
        string email PK
        string display_name
        timestamptz created_at
        timestamptz updated_at
    }

    user_roles {
        string id PK
        string name
        string color
        int sort_order
        boolean is_catalog
        timestamptz created_at
        timestamptz updated_at
    }

    user_role_assignments {
        string user_email PK, FK
        string role_id PK, FK
        int sort_order
    }

    user_linked_emails {
        string user_email PK, FK
        string linked_email PK, FK
        int sort_order
    }

    users ||--o{ user_role_assignments : "has roles"
    user_roles ||--o{ user_role_assignments : "assigned to users"
    users ||--o{ user_linked_emails : "source email"
    users ||--o{ user_linked_emails : "linked email"
```

## Tables

| Table | Purpose |
| --- | --- |
| `users_page_state` | Singleton metadata row for the whole state. Stores `version` for optimistic locking. |
| `users` | Known user emails and optional display names from `userNames`. |
| `user_roles` | Role catalog and role metadata. `is_catalog = true` means the role appears in top-level `roles`; assigned-only roles can be stored with `is_catalog = false`. |
| `user_role_assignments` | Many-to-many relation between users and roles, preserving per-user role order with `sort_order`. |
| `user_linked_emails` | Self-referential user email links, preserving link order with `sort_order`. |

## Migration

Migration `002_relational_users_page_state` creates the relational tables, copies data from the old JSONB columns in `users_page_state`, and then drops `roles`, `user_roles`, `user_names`, and `linked_emails` from the singleton table.

Startup runs `alembic upgrade head`, so existing deployments migrate on first service launch after the new version is deployed.
