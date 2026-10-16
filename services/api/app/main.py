from fastapi import FastAPI
from sqlalchemy import text

from app.db.session import engine

app = FastAPI(title="UpgradeAtlas API", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok"}
