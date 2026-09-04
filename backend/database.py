import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load .env here rather than relying on the importer (main.py, alembic/env.py,
# evals) to have done it first — this module reads DATABASE_URL at import
# time, and main.py's own load_dotenv() call happens well after it already
# imports database.py, so without this, DATABASE_URL from .env was silently
# ignored in favor of the SQLite default.
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# Default to a SQLite file living next to this module (backend/flouv.db).
# Using an absolute path ensures the app and the Alembic migrations target the
# exact same database regardless of the current working directory.
DEFAULT_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "flouv.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")

# SQLite requires this specific argument, Postgres does not
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
