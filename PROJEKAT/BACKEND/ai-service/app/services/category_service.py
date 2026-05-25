import re
import unicodedata
from typing import Any

from sqlalchemy import text

from app.database import SessionLocal


class CategoryService:
    """Suggests an expense category from an entered expense name."""

    _KEYWORD_GROUPS = [
        {
            "category_terms": ["plate", "plata", "place", "placa"],
            "keywords": ["plata", "plate", "placa", "honorar", "bonus", "regres", "doprinos", "naknada"],
        },
        {
            "category_terms": ["oprema"],
            "keywords": [
                "oprema",
                "laptop",
                "racunar",
                "kompjuter",
                "monitor",
                "printer",
                "server",
                "telefon",
                "namjestaj",
                "stolica",
                "sto",
                "softver",
                "licenca",
            ],
        },
        {
            "category_terms": ["marketing"],
            "keywords": [
                "marketing",
                "oglas",
                "oglasi",
                "reklama",
                "kampanja",
                "promocija",
                "brand",
                "seo",
                "facebook",
                "instagram",
                "google",
                "dizajn",
            ],
        },
        {
            "category_terms": ["putni troskovi", "putni", "putovanje"],
            "keywords": [
                "put",
                "putni",
                "putovanje",
                "hotel",
                "smjestaj",
                "gorivo",
                "taxi",
                "karta",
                "avio",
                "let",
                "dnevnica",
                "parking",
            ],
        },
        {
            "category_terms": ["zakup", "najam", "kirija"],
            "keywords": ["zakup", "najam", "kirija", "rent", "prostor", "kancelarija", "skladiste"],
        },
    ]

    def suggest_category(
        self,
        naziv: str,
        opis: str | None = None,
        dobavljac: str | None = None,
        categories: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        category_options = categories or self._load_categories()
        input_text = self._normalize(" ".join(part for part in [naziv, opis, dobavljac] if part))
        input_tokens = set(input_text.split())

        if not input_text or not category_options:
            return self._empty_result("Nema dovoljno podataka za AI prijedlog kategorije.")

        scored_categories = [
            (self._score_category(category, input_text, input_tokens), category)
            for category in category_options
        ]
        scored_categories.sort(key=lambda item: item[0], reverse=True)

        best_score, best_category = scored_categories[0]
        confidence = min(round(best_score / 8, 2), 0.98)

        if best_score < 1.5:
            return self._empty_result("AI nije pronasao dovoljno pouzdan prijedlog kategorije.")

        return {
            "categoryId": str(best_category.get("id")),
            "categoryName": best_category.get("naziv") or best_category.get("name"),
            "confidence": confidence,
            "reason": "Prijedlog je izabran na osnovu naziva stavke i slicnosti sa dostupnim kategorijama.",
        }

    def _score_category(self, category: dict[str, Any], input_text: str, input_tokens: set[str]) -> float:
        category_name = str(category.get("naziv") or category.get("name") or "")
        category_description = str(category.get("opis") or category.get("description") or "")
        category_text = self._normalize(f"{category_name} {category_description}")
        category_tokens = set(category_text.split())
        score = 0.0

        if not category_text:
            return score

        if category_text and category_text in input_text:
            score += 4.0

        score += len(input_tokens.intersection(category_tokens)) * 2.0

        for group in self._KEYWORD_GROUPS:
            category_matches = any(self._normalize(term) in category_text for term in group["category_terms"])
            if not category_matches:
                continue

            keyword_matches = sum(1 for keyword in group["keywords"] if self._keyword_matches(keyword, input_text, input_tokens))
            if keyword_matches > 0:
                score += 4.0 + keyword_matches * 1.2

        return score

    def _keyword_matches(self, keyword: str, input_text: str, input_tokens: set[str]) -> bool:
        normalized_keyword = self._normalize(keyword)
        if " " in normalized_keyword:
            return normalized_keyword in input_text

        return normalized_keyword in input_tokens

    def _load_categories(self) -> list[dict[str, Any]]:
        session = SessionLocal()
        try:
            rows = session.execute(
                text("SELECT id::text AS id, naziv, opis FROM kategorije ORDER BY naziv ASC;")
            ).mappings()
            return [dict(row) for row in rows]
        finally:
            session.close()

    def _normalize(self, value: str) -> str:
        without_accents = unicodedata.normalize("NFD", value).encode("ascii", "ignore").decode("ascii")
        lowercase = without_accents.lower()
        return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", lowercase)).strip()

    def _empty_result(self, reason: str) -> dict[str, Any]:
        return {
            "categoryId": None,
            "categoryName": None,
            "confidence": 0,
            "reason": reason,
        }
