from uuid import UUID

from fastapi import BackgroundTasks, FastAPI, HTTPException, status

from app.database import ensure_ai_tables
from app.schemas import (
    AnalysisStartRequest,
    AnalysisStartResponse,
    BudgetForecastRequest,
    CategorySuggestionRequest,
    ExpenseCheckRequest,
    HealthResponse,
)
from app.services.analysis_service import AnalysisService


app = FastAPI(
    title="Grupa12 AI Analytics Service",
    description="Internal AI analytics service for expense analysis, forecasts, anomalies, and category suggestions.",
    version="0.1.0",
)

analysis_service = AnalysisService()


@app.on_event("startup")
def startup() -> None:
    ensure_ai_tables()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="ai-service")


@app.post("/ai/expense-check", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def expense_check(_payload: ExpenseCheckRequest) -> dict[str, str]:
    return {"message": "Expense anomaly detection endpoint is ready for implementation."}


@app.post("/ai/category-suggestion", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def category_suggestion(_payload: CategorySuggestionRequest) -> dict[str, str]:
    return {"message": "Category suggestion endpoint is ready for implementation."}


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
