# config/database.py
import os
from typing import Generator
from functools import lru_cache

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.engine import Engine
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Configuration (Production-Ready)
# --------------------------------------------------------------------------- #


@lru_cache()
def get_database_url() -> str:
    """Build DB URL from environment variables with fallback defaults."""
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    host = os.getenv("POSTGRES_HOST")
    port = os.getenv("POSTGRES_PORT")
    db = os.getenv("POSTGRES_DB")

    return f"postgresql://{user}:{password}@{host}:{port}/{db}"

# --------------------------------------------------------------------------- #
# Engine & Session Factory
# --------------------------------------------------------------------------- #
Base = declarative_base()

ASYNC_DATABASE_URL = get_database_url().replace("postgresql://", "postgresql+asyncpg://")

async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    future=True,
    echo=False
)

async_session_maker = sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)
class Database:
    def __init__(self):
        self._engine = None
        self._SessionLocal: sessionmaker = None

    def init_engine(self) -> None:
        """Create engine with production settings."""
        url = get_database_url()

        self._engine = create_engine(
            url,
            pool_size=int(os.getenv("DB_POOL_SIZE", "20")),
            max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "30")),
            pool_pre_ping=True,           # Detect dead connections
            pool_timeout=30,
            echo=os.getenv("DB_ECHO", "false").lower() == "true",
            future=True,                  # SQLAlchemy 2.0 style
            connect_args={"connect_timeout": 10},
        )

        # Optional: Log connection events
        @event.listens_for(self._engine, "connect")
        def on_connect(dbapi_connection, connection_record):
            logger.info("New DB connection established")

        self._SessionLocal = sessionmaker(
            bind=self._engine,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
            class_=Session,
        )

    @property
    def engine(self) -> Engine:
        if not self._engine:
            self.init_engine()
        return self._engine

    @property
    def SessionLocal(self) -> sessionmaker:
        if not self._SessionLocal:
            self.init_engine()
        return self._SessionLocal

    # ------------------------------------------------------------------- #
    # Dependency for FastAPI (or any framework)
    # ------------------------------------------------------------------- #
    def get_db(self) -> Generator[Session, None, None]:
        """Yield a DB session and guarantee close."""
        if not self._SessionLocal:
            self.init_engine()

        db = self._SessionLocal()
        try:
            yield db
        except Exception as exc:
            logger.error(f"Database session error: {exc}")
            db.rollback()
            raise
        finally:
            db.close()

    def get_session(self) -> Session:
        """Return a new standalone DB session (for background tasks)."""
        if not self._SessionLocal:
            self.init_engine()
        return self._SessionLocal()


# Singleton instance
db = Database()
engine = db.engine