import uuid

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.db.session import SessionLocal
from app.models.catalog import Brand, LaptopFamily, LaptopVariant, LaptopSku


def unique_value(prefix: str = "sku") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def test_unique_manufacturer_part_number(db):
    v = unique_value()
    brand = Brand(name=f"b-{v}", slug=f"b-{v}")
    db.add(brand)
    db.flush()
    family = LaptopFamily(brand_id=brand.id, family_name="F1", slug=f"f1-{v}")
    db.add(family)
    db.flush()
    variant = LaptopVariant(family_id=family.id, manufacturer_model_code=f"M-{v}")
    db.add(variant)
    db.flush()

    db.add(LaptopSku(variant_id=variant.id, manufacturer_part_number=f"MPN-{v}", display_name="SKU A"))
    db.flush()
    db.add(LaptopSku(variant_id=variant.id, manufacturer_part_number=f"MPN-{v}", display_name="SKU B"))
    with pytest.raises(IntegrityError):
        db.flush()


def test_negative_ram_check(db):
    v = unique_value()
    brand = Brand(name=f"b2-{v}", slug=f"b2-{v}")
    db.add(brand)
    db.flush()
    family = LaptopFamily(brand_id=brand.id, family_name="F2", slug=f"f2-{v}")
    db.add(family)
    db.flush()
    variant = LaptopVariant(family_id=family.id, manufacturer_model_code=f"X-{v}")
    db.add(variant)
    db.flush()

    row = LaptopSku(variant_id=variant.id, manufacturer_part_number=f"MPN2-{v}", display_name="SKU", base_ram_gb=-1)
    db.add(row)
    with pytest.raises(IntegrityError):
        db.flush()


def test_invalid_compatibility_outcome(db):
    v = unique_value()
    # Need component class + sku + evidence + source first
    from app.models.governance import Source, Evidence
    from app.models.users import User
    source = Source(url=f"https://example.test/{v}", source_type="manufacturer")
    db.add(source)
    db.flush()
    evidence = Evidence(source_id=source.id, concise_paraphrase="test", fact_scope="sku")
    db.add(evidence)
    db.flush()

    from app.models.upgrade import ComponentClass, CompatibilityAssertion
    component = ComponentClass(component_type="RAM", standard="DDR5", form_factor="SO-DIMM")
    db.add(component)
    db.flush()

    # family/sku
    brand = Brand(name=f"bk-{v}", slug=f"bk-{v}")
    db.add(brand); db.flush()
    family = LaptopFamily(brand_id=brand.id, family_name="FK", slug=f"fk-{v}")
    db.add(family); db.flush()
    variant = LaptopVariant(family_id=family.id, manufacturer_model_code=f"VK-{v}")
    db.add(variant); db.flush()
    sku = LaptopSku(variant_id=variant.id, manufacturer_part_number=f"MPN3-{v}", display_name="SKU")
    db.add(sku); db.flush()

    assertion = CompatibilityAssertion(
        sku_id=sku.id,
        component_class_id=component.id,
        outcome="maybe",
        reason="invalid",
        evidence_id=evidence.id,
    )
    db.add(assertion)
    with pytest.raises(IntegrityError):
        db.flush()


def test_negative_offer_price(db):
    from app.models.offer import Retailer, RetailerOffer
    from app.models.governance import Source
    v = unique_value()
    source = Source(url=f"https://supplier.test/{v}", source_type="retailer")
    db.add(source)
    db.flush()

    # sku chain
    brand = Brand(name=f"bo-{v}", slug=f"bo-{v}")
    db.add(brand); db.flush()
    family = LaptopFamily(brand_id=brand.id, family_name="FO", slug=f"fo-{v}")
    db.add(family); db.flush()
    variant = LaptopVariant(family_id=family.id, manufacturer_model_code=f"VO-{v}")
    db.add(variant); db.flush()
    sku = LaptopSku(variant_id=variant.id, manufacturer_part_number=f"MPNO-{v}", display_name="SKU")
    db.add(sku); db.flush()

    retailer = Retailer(name=f"ret-{v}", website_url="https://shop.test")
    db.add(retailer); db.flush()
    offer = RetailerOffer(sku_id=sku.id, retailer_id=retailer.id, product_url="https://shop.test/p", displayed_price_egp=-1, source_id=source.id)
    db.add(offer)
    with pytest.raises(IntegrityError):
        db.flush()
