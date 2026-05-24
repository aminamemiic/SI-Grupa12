from typing import Any
from uuid import UUID

from app.repositories.analysis_repository import AnalysisRepository


class AnalysisService:
    def __init__(self) -> None:
        self.repository = AnalysisRepository()

    def start_analysis(self, analysis_type: str, parameters: dict[str, Any]) -> UUID:
        return self.repository.create(analysis_type, parameters)

    def run_placeholder_analysis(self, analysis_id: UUID) -> None:
        try:
            self.repository.complete(
                analysis_id,
                {
                    "message": "AI analysis infrastructure is ready. Domain logic will be implemented incrementally.",
                    "findings": [],
                    "summary": None,
                },
            )
        except Exception as exc:
            self.repository.fail(analysis_id, str(exc))

    def get_analysis(self, analysis_id: UUID) -> dict[str, Any] | None:
        return self.repository.get(analysis_id)

    def get_latest_analysis(self) -> dict[str, Any] | None:
        return self.repository.get_latest()
