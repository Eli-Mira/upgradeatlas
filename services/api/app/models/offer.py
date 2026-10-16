from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    ForeignKey,
    Numeric,
    String,
    Text,
    DateTime,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)


class Retailer(Base, TimestampMixin):
    __tablename__ = "retailers"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    website_url: Mapped[str] = mapped_column(Text, nullable=False)
    country: Mapped[str] = mapped_column(String(8), nullable=False, default="EG")
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="active")


class RetailerOffer(Base, TimestampMixin):
    __tablename__ = "retailer_offers"
    __table_args__ = (
        CheckConstraint(
            "available_status IN ('in_stock','out_of_stock','limited','unknown')",
            name="ck_retailer_offers_available_status",
        ),
        CheckConstraint("displayed_price_egp IS NULL OR displayed_price_egp >= 0", name="ck_retailer_offers_price_nonneg"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    sku_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("laptop_skus.id", ondelete="RESTRICT"), nullable=False)
    retailer_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("retailers.id", ondelete="RESTRICT"), nullable=False)
    retailer_sku: Mapped[str | None] = mapped_column(String(128))
    product_url: Mapped[str] = mapped_column(Text, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="EGP")
    displayed_price_egp: Mapped[float | None] = mapped_column(Numeric(12, 2))
    available_status: Mapped[str] = mapped_column(String(16), nullable=False, default="unknown")
    observed_at: Mapped[datetime | None] = mapped_column()
    recorded_at: Mapped[datetime] = mapped_column(default=func.now(), nullable=False)
    source_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("sources.id", ondelete="RESTRICT"), nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class OfferPriceObservation(Base, TimestampMixin):
    __tablename__ = "offer_price_observations"
    __table_args__ = (
        CheckConstraint("price_egp IS NULL OR price_egp >= 0", name="ck_offer_obs_price_nonneg"),
        CheckConstraint("stock_status IN ('in_stock','out_of_stock','limited','unknown')", name="ck_offer_obs_stock_status"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    offer_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("retailer_offers.id", ondelete="CASCADE"), nullable=False)
    price_egp: Mapped[float | None] = mapped_column(Numeric(12, 2))
    stock_status: Mapped[str] = mapped_column(String(16), nullable=False, default="unknown")
    observed_at: Mapped[datetime] = mapped_column(default=func.now(), nullable=False)
    source_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("sources.id", ondelete="RESTRICT"), nullable=False)
