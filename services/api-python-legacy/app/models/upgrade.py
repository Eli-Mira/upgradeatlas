from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    JSON,
    DateTime,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)


class RamConfiguration(Base, TimestampMixin):
    __tablename__ = "ram_configurations"
    __table_args__ = (
        CheckConstraint("soldered_gb IS NULL OR soldered_gb >= 0", name="ck_ram_configs_soldered_nonneg"),
        CheckConstraint("slot_count IS NULL OR slot_count >= 0", name="ck_ram_configs_slot_count_nonneg"),
        CheckConstraint("occupied_slot_count IS NULL OR occupied_slot_count >= 0", name="ck_ram_configs_occupied_nonneg"),
        CheckConstraint("documented_max_gb IS NULL OR documented_max_gb >= 0", name="ck_ram_configs_max_nonneg"),
        CheckConstraint("max_meaning IN ('manufacturer_tested','documented_hard_limit','unknown')", name="ck_ram_configs_max_meaning"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    sku_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("laptop_skus.id", ondelete="RESTRICT"), nullable=False, unique=True)
    soldered_gb: Mapped[int | None] = mapped_column(Integer)
    slot_count: Mapped[int | None] = mapped_column(Integer)
    occupied_slot_count: Mapped[int | None] = mapped_column(Integer)
    standard: Mapped[str | None] = mapped_column(String(64))  # DDR4/DDR5 etc.
    documented_max_gb: Mapped[int | None] = mapped_column(Integer)  # NULL = not known
    max_meaning: Mapped[str] = mapped_column(String(32), nullable=False, default="unknown")
    disassembly_risk_notes: Mapped[str | None] = mapped_column(Text)
    warranty_notes: Mapped[str | None] = mapped_column(Text)
    evidence_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("evidence.id", ondelete="RESTRICT"))


class StorageSlot(Base, TimestampMixin):
    __tablename__ = "storage_slots"
    __table_args__ = (
        UniqueConstraint("sku_id", "slot_index", name="uq_storage_slots_sku_index"),
        CheckConstraint("slot_index > 0", name="ck_storage_slots_index_pos"),
        CheckConstraint("protocol IN ('NVMe','SATA','both','unknown')", name="ck_storage_slots_protocol"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    sku_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("laptop_skus.id", ondelete="RESTRICT"), nullable=False)
    slot_index: Mapped[int] = mapped_column(Integer, nullable=False)
    form_factor: Mapped[str | None] = mapped_column(String(32))  # 2280, 2242
    protocol: Mapped[str] = mapped_column(String(16), nullable=False, default="unknown")
    pcie_generation: Mapped[str | None] = mapped_column(String(16))
    occupied_status: Mapped[str] = mapped_column(String(16), nullable=False, default="unknown")
    constraints_text: Mapped[str | None] = mapped_column(Text)
    evidence_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("evidence.id", ondelete="RESTRICT"))


class ComponentClass(Base, TimestampMixin):
    __tablename__ = "component_classes"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    component_type: Mapped[str] = mapped_column(String(16), nullable=False)  # RAM, SSD
    standard: Mapped[str] = mapped_column(String(64), nullable=False)
    form_factor: Mapped[str] = mapped_column(String(64), nullable=False)
    protocol: Mapped[str | None] = mapped_column(String(32))
    capacity_gb: Mapped[int | None] = mapped_column(Integer)
    attributes: Mapped[dict | None] = mapped_column(JSON)


class CompatibilityAssertion(Base, TimestampMixin):
    __tablename__ = "compatibility_assertions"
    __table_args__ = (
        UniqueConstraint("sku_id", "component_class_id", "evidence_id", name="uq_compat_sku_component_evidence"),
        CheckConstraint("outcome IN ('supported','unsupported','unknown','conflicting')", name="ck_compat_outcome"),
        CheckConstraint("confidence_level IN ('manufacturer_verified','reputable_independent','unverified')", name="ck_compat_confidence"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    sku_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("laptop_skus.id", ondelete="RESTRICT"), nullable=False)
    component_class_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("component_classes.id", ondelete="RESTRICT"), nullable=False)
    outcome: Mapped[str] = mapped_column(String(16), nullable=False, default="unknown")
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    scope_notes: Mapped[str | None] = mapped_column(Text)
    confidence_level: Mapped[str] = mapped_column(String(32), nullable=False, default="unverified")
    evidence_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("evidence.id", ondelete="RESTRICT"), nullable=False)
    reviewed_by: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    reviewed_at: Mapped[datetime | None] = mapped_column()
