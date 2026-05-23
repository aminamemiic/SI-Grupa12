from typing import Any
from uuid import UUID
import json

from sqlalchemy import text

from app.database import SessionLocal


class AnalysisRepository:
    def create(self, analysis_type: str, parameters: dict[str, Any]) -> UUID:
        with SessionLocal() as session:
            result = session.execute(
                text(
                    """
                    INSERT INTO ai_analize (tip, status, parametri)
                    VALUES (:tip, 'RUNNING', CAST(:parametri AS jsonb))
                    RETURNING id
                    """
                ),
                {"tip": analysis_type, "parametri": json.dumps(parameters)},
            )
            session.commit()
            return result.scalar_one()

    def complete(self, analysis_id: UUID, result_payload: dict[str, Any]) -> None:
        with SessionLocal() as session:
            session.execute(
                text(
                    """
                    UPDATE ai_analize
                    SET status = 'COMPLETED',
                        rezultat = CAST(:rezultat AS jsonb),
                        zavrseno = CURRENT_TIMESTAMP
                    WHERE id = :id
                    """
                ),
                {"id": analysis_id, "rezultat": json.dumps(result_payload)},
            )
            session.commit()

    def fail(self, analysis_id: UUID, error_message: str) -> None:
        with SessionLocal() as session:
            session.execute(
                text(
                    """
                    UPDATE ai_analize
                    SET status = 'FAILED',
                        error_message = :error_message,
                        zavrseno = CURRENT_TIMESTAMP
                    WHERE id = :id
                    """
                ),
                {"id": analysis_id, "error_message": error_message},
            )
            session.commit()

    def get(self, analysis_id: UUID) -> dict[str, Any] | None:
        with SessionLocal() as session:
            result = session.execute(
                text(
                    """
                    SELECT id, tip, status, parametri, rezultat, error_message, pokrenuto, zavrseno
                    FROM ai_analize
                    WHERE id = :id
                    """
                ),
                {"id": analysis_id},
            )
            row = result.mappings().first()
            return dict(row) if row else None

    def get_latest(self) -> dict[str, Any] | None:
        with SessionLocal() as session:
            result = session.execute(
                text(
                    """
                    SELECT id, tip, status, parametri, rezultat, error_message, pokrenuto, zavrseno
                    FROM ai_analize
                    ORDER BY pokrenuto DESC
                    LIMIT 1
                    """
                )
            )
            row = result.mappings().first()
            return dict(row) if row else None
