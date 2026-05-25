from uuid import UUID

from fastapi import BackgroundTasks, FastAPI, HTTPException, status

from app.database import ensure_ai_tables
from app.schemas import (
    AnalysisStartRequest,
    AnalysisStartResponse,
    BudgetForecastRequest,
    CategorySuggestionRequest,
    CategorySuggestionResponse,
    ExpenseCheckRequest,
    HealthResponse,
)
from app.services.analysis_service import AnalysisService
from app.services.anomaly_service import AnomalyService
from app.services.category_service import CategoryService


app = FastAPI(
    title="Grupa12 AI Analytics Service",
    description="Internal AI analytics service for expense analysis, forecasts, anomalies, and category suggestions.",
    version="0.1.0",
)

analysis_service = AnalysisService()
anomaly_service = AnomalyService()
category_service = CategoryService()


@app.on_event("startup")
def startup() -> None:
    ensure_ai_tables()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="ai-service")


@app.post("/ai/expense-check")
def expense_check(payload: ExpenseCheckRequest) -> dict:
    return anomaly_service.analyze_expense(payload.expense, payload.context)


@app.post("/ai/category-suggestion", response_model=CategorySuggestionResponse)
def category_suggestion(payload: CategorySuggestionRequest) -> dict:
    return category_service.suggest_category(
        naziv=payload.naziv,
        opis=payload.opis,
        dobavljac=payload.dobavljac,
        categories=payload.categories,
    )


@app.post("/ai/budget-forecast", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def budget_forecast(_payload: BudgetForecastRequest) -> dict[str, str]:
    return {"message": "Budget forecast endpoint is ready for implementation."}


@app.post("/ai/analysis", response_model=AnalysisStartResponse, status_code=status.HTTP_202_ACCEPTED)
def start_analysis(payload: AnalysisStartRequest, background_tasks: BackgroundTasks) -> AnalysisStartResponse:
    analysis_id = analysis_service.start_analysis(payload.tip, payload.parametri)
    background_tasks.add_task(analysis_service.run_placeholder_analysis, analysis_id)

    return AnalysisStartResponse(
        analysisId=analysis_id,
        status="RUNNING",
        message="AI analysis started.",
    )


@app.get("/ai/analysis/latest")
def get_latest_analysis() -> dict:
    analysis = analysis_service.get_latest_analysis()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No AI analysis found.")
    return analysis


@app.get("/ai/analysis/{analysis_id}")
def get_analysis(analysis_id: UUID) -> dict:
    analysis = analysis_service.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="AI analysis not found.")
    return analysis
