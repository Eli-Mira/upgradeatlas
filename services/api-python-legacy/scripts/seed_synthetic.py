"""
Seed clearly labeled SYNTHETIC demonstration data (not real laptop configs/prices).

Usage:
    DATABASE_URL=... python services/api/scripts/seed_synthetic.py
Defaults to the local development database URL.
"""
import os

from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal, engine
from app.models.catalog import Brand, LaptopFamily, LaptopVariant, LaptopSku
from app.models.governance import Source, Evidence
from app.models.upgrade import RamConfiguration, StorageSlot


SYNTHETIC = "SYNTHETIC DEMO DATA - NOT A REAL LAPTOP CONFIGURATION"


def ensure_source(db: Session, url: str) -> Source:
    src = db.query(Source).filter_by(url=url).one_or_none()
    if src is None:
        src = Source(
            url=url,
            source_type="demo_fixture",
            publisher="UpgradeAtlas project",
            usage_permission_status="unknown",
            notes=SYNTHETIC,
        )
        db.add(src)
        db.flush()
    return src


def run() -> None:
    db = SessionLocal()
    try:
        for part_no, base_ram in (("EX-C15-01", 16), ("EX-G15-02", 16)):
            mk = f"DEMO-{part_no}"
            if db.query(LaptopSku).filter_by(manufacturer_part_number=mk).first():
                print(f"skip: {mk} already seeded")
                continue

            brand = Brand(name=f"DemoTech-{part_no}", slug=f"demotech-{part_no.lower()}")
            db.add(brand)
            db.flush()

            family = LaptopFamily(brand_id=brand.id, family_name="Demo Campus Family", slug=f"demo-{part_no.lower()}")
            db.add(family)
            db.flush()

            variant = LaptopVariant(family_id=family.id, manufacturer_model_code=part_no, region_code="XX", notes=SYNTHETIC)
            db.add(variant)
            db.flush()

            source = ensure_source(db, f"demo://upgradeatlas/{part_no}")
            evidence = Evidence(
                source_id=source.id,
                concise_paraphrase=SYNTHETIC,
                fact_scope=f"synthetic seed for {part_no}",
                verification_status="unverified",
            )
            db.add(evidence)
            db.flush()

            sku = LaptopSku(
                variant_id=variant.id,
                manufacturer_part_number=mk,
                display_name=f"Synthetic Demo SKU {part_no}",
                base_ram_gb=base_ram,
                base_storage_gb=512,
                status="draft",
            )
            db.add(sku)
            db.flush()

            db.add(RamConfiguration(
                sku_id=sku.id,
                soldered_gb=base_ram,
                slot_count=0,
                occupied_slot_count=0,
                documented_max_gb=None,
                max_meaning="unknown",
                evidence_id=evidence.id,
            ))
            db.add(StorageSlot(
                sku_id=sku.id,
                slot_index=1,
                protocol="unknown",
                occupied_status="unknown",
                evidence_id=evidence.id,
            ))
        db.commit()
        print("seeded synthetic demo SKUs (CLEARLY MARKED SYNTHETIC)")
    finally:
        db.close()


if __name__ == "__main__":
    os.environ.setdefault("DATABASE_URL", str(settings.database_url))
    run()
