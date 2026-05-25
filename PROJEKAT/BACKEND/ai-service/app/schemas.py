from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str


class ExpenseCheckRequest(BaseModel):
    expense: dict[str, Any]
    context: dict[str, Any] = Field(default_factory=dict)


class CategorySuggestionRequest(BaseModel):
    naziv: str = Field(min_length=1, max_length=200)
    opis: str | None = None
    dobavljac: str | None = None
    categories: list[dict[str, Any]] = Field(default_factory=list)


class CategorySuggestionResponse(BaseModel):
    categoryId: str | None = None
    categoryName: str | None = None
    confidence: float
    reason: str


class BudgetForecastRequest(BaseModel):
    budget_id: UUID | None = None
    parameters: dict[str, Any] = Field(default_factory=dict)


class AnalysisStartRequest(BaseModel):
    tip: str = "FULL_ANALYSIS"
    parametri: dict[str, Any] = Field(default_factory=dict)


class AnalysisStartResponse(BaseModel):
    analysisId: UUID
    status: str
    message: str
