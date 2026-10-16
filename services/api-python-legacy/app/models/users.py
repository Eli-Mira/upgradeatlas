from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    ForeignKey,
    String,
    JSON,
    DateTime,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)


class User(Base, TimestampMixin):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("role IN ('user','editor','admin')", name="ck_users_role"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    hashed_password: Mapped[str | None] = mapped_column(String(512))
    external_auth_id: Mapped[str | None] = mapped_column(String(256))
    display_name: Mapped[str | None] = mapped_column(String(128))
    locale: Mapped[str] = mapped_column(String(8), nullable=False, default="ar")
    role: Mapped[str] = mapped_column(String(16), nullable=False, default="user")
    deleted_at: Mapped[datetime | None] = mapped_column()


class Favorite(Base):
    __tablename__ = "favorites"

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    sku_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("laptop_skus.id", ondelete="CASCADE"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)


class SavedComparison(Base, TimestampMixin):
    __tablename__ = "saved_comparisons"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str | None] = mapped_column(String(256))


class SavedComparisonItem(Base):
    __tablename__ = "saved_comparison_items"

    comparison_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("saved_comparisons.id", ondelete="CASCADE"), primary_key=True)
    sku_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("laptop_skus.id", ondelete="CASCADE"), primary_key=True)


class RecommendationSession(Base):
    __tablename__ = "recommendation_sessions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    preferences: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)