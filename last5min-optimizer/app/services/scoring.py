from __future__ import annotations

from typing import TypedDict

from app.utils.geo import haversine_distance_meters


class UseCaseConfig(TypedDict):
    threshold_km: float
    priority_level: int
    score_boost: float


# Centralized configuration so hackathon teams can tune thresholds quickly.
USE_CASE_CONFIG: dict[str, UseCaseConfig] = {
    "emergency": {
        "threshold_km": 2.0,
        "priority_level": 4,
        "score_boost": 30.0,
    },
    "delivery": {
        "threshold_km": 5.0,
        "priority_level": 3,
        "score_boost": 20.0,
    },
    "mobility": {
        "threshold_km": 7.0,
        "priority_level": 2,
        "score_boost": 10.0,
    },
    "logistics": {
        "threshold_km": 15.0,
        "priority_level": 1,
        "score_boost": 5.0,
    },
}


def normalize_use_case(use_case: str) -> str:
    normalized = (use_case or "").strip().lower()
    if normalized in USE_CASE_CONFIG:
        return normalized
    return "delivery"


def calculate_distance_km(
    user_location: tuple[float, float],
    destination: tuple[float, float],
) -> float:
    distance_meters = haversine_distance_meters(
        user_location[0],
        user_location[1],
        destination[0],
        destination[1],
    )
    return distance_meters / 1000.0


def select_threshold_km(use_case: str) -> float:
    normalized_use_case = normalize_use_case(use_case)
    return USE_CASE_CONFIG[normalized_use_case]["threshold_km"]


def calculate_priority_level(use_case: str) -> int:
    normalized_use_case = normalize_use_case(use_case)
    return USE_CASE_CONFIG[normalized_use_case]["priority_level"]


def calculate_score(distance_km: float, use_case: str) -> float:
    normalized_use_case = normalize_use_case(use_case)
    config = USE_CASE_CONFIG[normalized_use_case]
    threshold_km = config["threshold_km"]
    boost = config["score_boost"]

    if threshold_km <= 0:
        return 0.0

    # Distance is the primary real-world constraint.
    base_score = max(0.0, 100.0 - ((distance_km / threshold_km) * 100.0))
    score = min(100.0, base_score + boost)
    return round(score, 2)

def classify_status(distance_km: float, threshold_km: float) -> str:
    if threshold_km <= 0:
        return "far"

    if distance_km <= 0.5 * threshold_km:
        return "optimal"
    if distance_km <= threshold_km:
        return "acceptable"
    return "far"


def evaluate_last_mile(
    user_location: tuple[float, float],
    destination: tuple[float, float],
    use_case: str,
) -> dict[str, float | int | str]:
    normalized_use_case = normalize_use_case(use_case)
    threshold_km = select_threshold_km(normalized_use_case)
    distance_km = calculate_distance_km(user_location, destination)
    score = calculate_score(distance_km, normalized_use_case)
    priority_level = calculate_priority_level(normalized_use_case)
    status = classify_status(distance_km, threshold_km)

    return {
        "distance": round(distance_km, 3),
        "use_case": normalized_use_case,
        "threshold_used": threshold_km,
        "score": score,
        "priority_level": priority_level,
        "status": status,
    }
