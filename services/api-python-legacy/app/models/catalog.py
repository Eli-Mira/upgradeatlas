from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    DateTime,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)


class Brand(Base, TimestampMixin):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)


class LaptopFamily(Base, TimestampMixin):
    __tablename__ = "laptop_families"
    __table_args__ = (UniqueConstraint("brand_id", "slug", name="uq_laptop_families_brand_slug"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    brand_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("brands.id", ondelete="RESTRICT"), nullable=False)
    family_name: Mapped[str] = mapped_column(String(256), nullable=False)
    slug: Mapped[str] = mapped_column(String(256), nullable=False)
    launch_year: Mapped[int | None] = mapped_column(Integer)


class LaptopVariant(Base, TimestampMixin):
    __tablename__ = "laptop_variants"
    __table_args__ = (UniqueConstraint("family_id", "manufacturer_model_code", "region_code", name="uq_laptop_variants_identity"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    family_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("laptop_families.id", ondelete="RESTRICT"), nullable=False)
    manufacturer_model_code: Mapped[str] = mapped_column(String(128), nullable=False)
    region_code: Mapped[str | None] = mapped_column(String(32))
    notes: Mapped[str | None] = mapped_column(Text)


class Cpu(Base, TimestampMixin):
    __tablename__ = "cpus"
    __table_args__ = (UniqueConstraint("maker", "model", name="uq_cpus_identity"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    maker: Mapped[str] = mapped_column(String(64), nullable=False)
    model: Mapped[str] = mapped_column(String(128), nullable=False)
    architecture: Mapped[str | None] = mapped_column(String(64))
    cores: Mapped[int | None] = mapped_column(Integer)
    threads: Mapped[int | None] = mapped_column(Integer)
    tdp_w: Mapped[int | None] = mapped_column(Integer)


class Gpu(Base, TimestampMixin):
    __tablename__ = "gpus"
    __table_args__ = (UniqueConstraint("maker", "model", name="uq_gpus_identity"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    maker: Mapped[str] = mapped_column(String(64), nullable=False)
    model: Mapped[str] = mapped_column(String(128), nullable=False)
    vram_gb: Mapped[int | None] = mapped_column(Integer)
    tgp_w: Mapped[int | None] = mapped_column(Integer)


class Display(Base, TimestampMixin):
    __tablename__ = "displays"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    diagonal_inches: Mapped[float] = mapped_column(Numeric(4, 2), nullable=False)
    resolution_width: Mapped[int] = mapped_column(Integer, nullable=False)
    resolution_height: Mapped[int] = mapped_column(Integer, nullable=False)
    refresh_hz: Mapped[float | None] = mapped_column(Numeric(6, 2))
    panel_type: Mapped[str | None] = mapped_column(String(64))
    color_gamut: Mapped[str | None] = mapped_column(String(64))
    brightness_nits: Mapped[int | None] = mapped_column(Integer)


class LaptopSku(Base, TimestampMixin):
    __tablename__ = "laptop_skus"
    __table_args__ = (
        CheckConstraint("status IN ('draft','review','published','retired')", name="ck_laptop_skus_status"),
        CheckConstraint("base_ram_gb IS NULL OR base_ram_gb >= 0", name="ck_laptop_skus_ram_nonneg"),
        CheckConstraint("base_storage_gb IS NULL OR base_storage_gb >= 0", name="ck_laptop_skus_storage_nonneg"),
        CheckConstraint("mass_g IS NULL OR mass_g >= 0", name="ck_laptop_skus_mass_nonneg"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    variant_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("laptop_variants.id", ondelete="RESTRICT"), nullable=False)
    manufacturer_part_number: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    display_name: Mapped[str] = mapped_column(String(256), nullable=False)
    cpu_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("cpus.id", ondelete="SET NULL"))
    gpu_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("gpus.id", ondelete="SET NULL"))
    display_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("displays.id", ondelete="SET NULL"))
    base_ram_gb: Mapped[int | None] = mapped_column(Integer)
    base_storage_gb: Mapped[int | None] = mapped_column(Integer)
    mass_g: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="draft")
