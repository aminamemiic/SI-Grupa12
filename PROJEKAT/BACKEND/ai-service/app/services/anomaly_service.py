from typing import Any


class AnomalyService:
    def analyze_expense(self, expense: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        amount = self._to_float(expense.get("iznos"))
        findings: list[dict[str, Any]] = []

        historical_expenses = context.get("historicalExpenses") or []
        historical_amounts = [
            self._to_float(item.get("iznos"))
            for item in historical_expenses
            if self._to_float(item.get("iznos")) > 0
        ]

        if len(historical_amounts) >= 3:
            average = sum(historical_amounts) / len(historical_amounts)
            if average > 0 and amount >= average * 2.5:
                findings.append(
                    {
                        "type": "AMOUNT_OUTLIER",
                        "severity": "HIGH",
                        "message": f"Iznos je {amount / average:.1f} puta veci od prosjeka slicnih troskova.",
                        "evidence": {
                            "currentAmount": round(amount, 2),
                            "averageAmount": round(average, 2),
                            "sampleSize": len(historical_amounts),
                        },
                    }
                )

        duplicate_candidates = context.get("duplicateCandidates") or []
        has_duplicate_finding = len(duplicate_candidates) > 0
        if has_duplicate_finding:
            findings.append(
                {
                    "type": "POTENCIJALNI_DUPLIKAT",
                    "severity": "MEDIUM",
                    "message": "Pronadjen je moguci dupli trosak sa istim nazivom, iznosom i datumom.",
                    "evidence": {"duplicateKind": "EXACT", "duplicateCount": len(duplicate_candidates)},
                }
            )

        budget = context.get("budget")
        if budget and not has_duplicate_finding:
            planned_amount = self._to_float(budget.get("planiraniIznos"))
            spent_before = self._to_float(budget.get("potrosenoPrijeTroska"))
            projected_spent = spent_before + amount

            if planned_amount > 0 and projected_spent > planned_amount:
                findings.append(
                    {
                        "type": "BUDGET_EXCEEDED",
                        "severity": "HIGH",
                        "message": "Trosak bi doveo do prekoracenja planiranog budzeta.",
                        "evidence": {
                            "plannedAmount": round(planned_amount, 2),
                            "spentBefore": round(spent_before, 2),
                            "projectedSpent": round(projected_spent, 2),
                            "deviation": round(projected_spent - planned_amount, 2),
                        },
                    }
                )

        anomaly_findings = [
            finding for finding in findings if self._is_anomaly_finding(finding)
        ]
        status = "ANOMALIJA" if anomaly_findings else "VALIDAN"
        severity = self._resolve_severity(anomaly_findings, findings)
        risk_score = self._resolve_risk_score(anomaly_findings, findings)
        explanation = (
            " ".join(finding["message"] for finding in findings)
            if findings
            else "AI analiza nije pronasla znacajna odstupanja za uneseni trosak."
        )

        return {
            "status": status,
            "riskScore": risk_score,
            "severity": severity,
            "findings": findings,
            "explanation": explanation,
            "recommendedAction": (
                "Provjeriti trosak i pratecu dokumentaciju prije dalje obrade."
                if findings
                else "Nije potrebna dodatna akcija."
            ),
        }

    def _resolve_severity(
        self, anomaly_findings: list[dict[str, Any]], findings: list[dict[str, Any]]
    ) -> str:
        if any(finding.get("severity") == "HIGH" for finding in anomaly_findings):
            return "HIGH"
        if findings:
            return "MEDIUM"
        return "LOW"

    def _resolve_risk_score(
        self, anomaly_findings: list[dict[str, Any]], findings: list[dict[str, Any]]
    ) -> float:
        if not findings:
            return 0.12
        if any(finding.get("severity") == "HIGH" for finding in anomaly_findings):
            return 0.9
        if anomaly_findings:
            return 0.55
        return 0.35

    def _is_anomaly_finding(self, finding: dict[str, Any]) -> bool:
        return finding.get("type") != "POTENCIJALNI_DUPLIKAT"

    def _to_float(self, value: Any) -> float:
        try:
            return float(value or 0)
        except (TypeError, ValueError):
            return 0.0
