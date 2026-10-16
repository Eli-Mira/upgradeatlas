from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)


class Source(Base, TimestampMixin):
    __tablename__ = "sources"
    __table_args__ = (
        CheckConstraint(
            "usage_permission_status IN ('unknown','permitted','restricted','prohibited')",
            name="ck_sources_permission_status",
        ),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    url: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    source_type: Mapped[str] = mapped_column(String(64), nullable=False)
    publisher: Mapped[str | None] = mapped_column(String(256))
    usage_permission_status: Mapped[str] = mapped_column(String(24), nullable=False, default="unknown")
    last_accessed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str | None] = mapped_column(Text)


class Evidence(Base, TimestampMixin):
    __tablename__ = "evidence"
    __table_args__ = (
        CheckConstraint(
            "verification_status IN ('unverified','manufacturer_verified','reputable_independent_verified')",
            name="ck_evidence_verification_status",
        ),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    source_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("sources.id", ondelete="RESTRICT"), nullable=False)
    locator: Mapped[str | None] = mapped_column(Text)  # page/section locator, not full text copy
    concise_paraphrase: Mapped[str] = mapped_column(Text, nullable=False)
    fact_scope: Mapped[str] = mapped_column(Text, nullable=False)  # exact SKU/field scope
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    verification_status: Mapped[str] = mapped_column(String(40), nullable=False, default="unverified")
    reviewer_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    superseded_by: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("evidence.id", ondelete="SET NULL"))


class ConflictFlag(Base, TimestampMixin):
    __tablename__ = "conflict_flags"
    __table_args__ = (
        CheckConstraint("status IN ('open','resolved','dismissed')", name="ck_conflict_flags_status"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    entity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    entity_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    field_name: Mapped[str] = mapped_column(String(128), nullable=False)
    evidence_ids: Mapped[str] = mapped_column(Text, nullable=False, default="[]")  # JSON array stored as text (portable)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="open")
    resolution_notes: Mapped[str | None] = mapped_column(Text)
    resolved_by: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
