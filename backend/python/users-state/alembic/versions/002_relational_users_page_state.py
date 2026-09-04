"""relational users page state

Revision ID: 002_relational_users_page_state
Revises: 001_initial
Create Date: 2026-06-23
"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision = "002_relational_users_page_state"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_roles",
        sa.Column("id", sa.String(length=128), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("color", sa.String(length=7), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=True),
        sa.Column("is_catalog", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_table(
        "users",
        sa.Column("email", sa.String(length=320), primary_key=True),
        sa.Column("display_name", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_table(
        "user_role_assignments",
        sa.Column("user_email", sa.String(length=320), nullable=False),
        sa.Column("role_id", sa.String(length=128), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.ForeignKeyConstraint(["role_id"], ["user_roles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_email"], ["users.email"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_email", "role_id"),
    )
    op.create_table(
        "user_linked_emails",
        sa.Column("user_email", sa.String(length=320), nullable=False),
        sa.Column("linked_email", sa.String(length=320), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.ForeignKeyConstraint(["linked_email"], ["users.email"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_email"], ["users.email"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_email", "linked_email"),
    )

    op.create_index("ix_user_role_assignments_role_id", "user_role_assignments", ["role_id"])
    op.create_index("ix_user_linked_emails_linked_email", "user_linked_emails", ["linked_email"])

    op.execute(
        """
        INSERT INTO user_roles (id, name, color, sort_order, is_catalog)
        SELECT
            role_item.role->>'id',
            role_item.role->>'name',
            role_item.role->>'color',
            role_item.ord - 1,
            true
        FROM users_page_state state
        CROSS JOIN LATERAL jsonb_array_elements(state.roles) WITH ORDINALITY AS role_item(role, ord)
        WHERE state.id = 1
          AND role_item.role ? 'id'
          AND role_item.role->>'id' <> ''
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            color = EXCLUDED.color,
            sort_order = EXCLUDED.sort_order,
            is_catalog = true,
            updated_at = now()
        """
    )
    op.execute(
        """
        INSERT INTO user_roles (id, name, color, sort_order, is_catalog)
        SELECT DISTINCT ON (assigned_role.role->>'id')
            assigned_role.role->>'id',
            assigned_role.role->>'name',
            assigned_role.role->>'color',
            NULL,
            false
        FROM users_page_state state
        CROSS JOIN LATERAL jsonb_each(state.user_roles) AS user_role(user_email, roles)
        CROSS JOIN LATERAL jsonb_array_elements(user_role.roles) AS assigned_role(role)
        WHERE state.id = 1
          AND assigned_role.role ? 'id'
          AND assigned_role.role->>'id' <> ''
        ON CONFLICT (id) DO NOTHING
        """
    )
    op.execute(
        """
        INSERT INTO users (email, display_name)
        SELECT user_name.email, user_name.display_name
        FROM users_page_state state
        CROSS JOIN LATERAL jsonb_each_text(state.user_names) AS user_name(email, display_name)
        WHERE state.id = 1
        ON CONFLICT (email) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            updated_at = now()
        """
    )
    op.execute(
        """
        INSERT INTO users (email)
        SELECT DISTINCT user_role.user_email
        FROM users_page_state state
        CROSS JOIN LATERAL jsonb_each(state.user_roles) AS user_role(user_email, roles)
        WHERE state.id = 1
        ON CONFLICT (email) DO NOTHING
        """
    )
    op.execute(
        """
        INSERT INTO users (email)
        SELECT DISTINCT linked_user.email
        FROM users_page_state state
        CROSS JOIN LATERAL jsonb_each(state.linked_emails) AS linked_group(user_email, emails)
        CROSS JOIN LATERAL (
            SELECT linked_group.user_email AS email
            UNION
            SELECT linked_email.email
            FROM jsonb_array_elements_text(linked_group.emails) AS linked_email(email)
        ) AS linked_user
        WHERE state.id = 1
        ON CONFLICT (email) DO NOTHING
        """
    )
    op.execute(
        """
        INSERT INTO user_role_assignments (user_email, role_id, sort_order)
        SELECT
            user_role.user_email,
            assigned_role.role->>'id',
            assigned_role.ord - 1
        FROM users_page_state state
        CROSS JOIN LATERAL jsonb_each(state.user_roles) AS user_role(user_email, roles)
        CROSS JOIN LATERAL jsonb_array_elements(user_role.roles) WITH ORDINALITY AS assigned_role(role, ord)
        WHERE state.id = 1
          AND assigned_role.role ? 'id'
          AND assigned_role.role->>'id' <> ''
        ON CONFLICT (user_email, role_id) DO UPDATE SET
            sort_order = EXCLUDED.sort_order
        """
    )
    op.execute(
        """
        INSERT INTO user_linked_emails (user_email, linked_email, sort_order)
        SELECT
            linked_group.user_email,
            linked_email.email,
            linked_email.ord - 1
        FROM users_page_state state
        CROSS JOIN LATERAL jsonb_each(state.linked_emails) AS linked_group(user_email, emails)
        CROSS JOIN LATERAL jsonb_array_elements_text(linked_group.emails) WITH ORDINALITY AS linked_email(email, ord)
        WHERE state.id = 1
        ON CONFLICT (user_email, linked_email) DO UPDATE SET
            sort_order = EXCLUDED.sort_order
        """
    )

    op.drop_column("users_page_state", "linked_emails")
    op.drop_column("users_page_state", "user_names")
    op.drop_column("users_page_state", "user_roles")
    op.drop_column("users_page_state", "roles")


def downgrade() -> None:
    op.add_column(
        "users_page_state",
        sa.Column("roles", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
    )
    op.add_column(
        "users_page_state",
        sa.Column("user_roles", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
    )
    op.add_column(
        "users_page_state",
        sa.Column("user_names", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
    )
    op.add_column(
        "users_page_state",
        sa.Column("linked_emails", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
    )

    op.execute(
        """
        UPDATE users_page_state
        SET
            roles = COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_build_object('id', id, 'name', name, 'color', color)
                        ORDER BY sort_order
                    )
                    FROM user_roles
                    WHERE is_catalog = true
                ),
                '[]'::jsonb
            ),
            user_roles = COALESCE(
                (
                    SELECT jsonb_object_agg(user_email, roles)
                    FROM (
                        SELECT
                            assignment.user_email,
                            jsonb_agg(
                                jsonb_build_object(
                                    'id', role.id,
                                    'name', role.name,
                                    'color', role.color
                                )
                                ORDER BY assignment.sort_order
                            ) AS roles
                        FROM user_role_assignments assignment
                        JOIN user_roles role ON role.id = assignment.role_id
                        GROUP BY assignment.user_email
                    ) role_groups
                ),
                '{}'::jsonb
            ),
            user_names = COALESCE(
                (
                    SELECT jsonb_object_agg(email, display_name)
                    FROM users
                    WHERE display_name IS NOT NULL
                ),
                '{}'::jsonb
            ),
            linked_emails = COALESCE(
                (
                    SELECT jsonb_object_agg(user_email, emails)
                    FROM (
                        SELECT
                            user_email,
                            jsonb_agg(linked_email ORDER BY sort_order) AS emails
                        FROM user_linked_emails
                        GROUP BY user_email
                    ) linked_groups
                ),
                '{}'::jsonb
            )
        WHERE id = 1
        """
    )

    op.drop_index("ix_user_linked_emails_linked_email", table_name="user_linked_emails")
    op.drop_index("ix_user_role_assignments_role_id", table_name="user_role_assignments")
    op.drop_table("user_linked_emails")
    op.drop_table("user_role_assignments")
    op.drop_table("users")
    op.drop_table("user_roles")
