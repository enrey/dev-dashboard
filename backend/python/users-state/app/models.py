from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func, text
from sqlalchemy.orm import Mapped, declarative_base, mapped_column

Base = declarative_base()


class UsersPageState(Base):
    __tablename__ = "users_page_state"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("1"))
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        server_onupdate=func.now(),
    )


class UserRoleRecord(Base):
    __tablename__ = "user_roles"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    color: Mapped[str] = mapped_column(String(7), nullable=False)
    sort_order: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_catalog: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        server_onupdate=func.now(),
    )


class UserRecord(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), primary_key=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        server_onupdate=func.now(),
    )


class UserRoleAssignment(Base):
    __tablename__ = "user_role_assignments"

    user_email: Mapped[str] = mapped_column(
        String(320),
        ForeignKey("users.email", ondelete="CASCADE"),
        primary_key=True,
    )
    role_id: Mapped[str] = mapped_column(
        String(128),
        ForeignKey("user_roles.id", ondelete="CASCADE"),
        primary_key=True,
    )
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))


class UserLinkedEmail(Base):
    __tablename__ = "user_linked_emails"

    user_email: Mapped[str] = mapped_column(
        String(320),
        ForeignKey("users.email", ondelete="CASCADE"),
        primary_key=True,
    )
    linked_email: Mapped[str] = mapped_column(
        String(320),
        ForeignKey("users.email", ondelete="CASCADE"),
        primary_key=True,
    )
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
