import os
import subprocess
import sys
from pathlib import Path

API_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(API_DIR))

# Keep test DB separate from development database.
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://upgradeatlas_app:ua-dev-change-me@127.0.0.1:5432/upgradeatlas_test",
)

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base

# Ensure tables exist; running twice is a no-op.
subprocess.run(
    [sys.executable, "-m", "alembic", "upgrade", "head"],
    cwd=str(API_DIR),
    env={**os.environ, "DATABASE_URL": settings.database_url},
    check=True,
)

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()
