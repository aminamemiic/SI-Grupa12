from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.config import settings


engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def ensure_ai_tables() -> None:
    with engine.begin() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto;"))
        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS ai_analize (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    tip VARCHAR(50) NOT NULL,
                    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
                    parametri JSONB NOT NULL DEFAULT '{}'::jsonb,
                    rezultat JSONB,
                    error_message TEXT,
                    pokrenuto TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    zavrseno TIMESTAMP,

                    CONSTRAINT chk_ai_analize_status
                        CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED'))
                );
                """
            )
        )
