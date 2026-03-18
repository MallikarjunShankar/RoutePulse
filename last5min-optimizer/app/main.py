from __future__ import annotations

from fastapi import FastAPI

from app.models import OptimizeLastMileRequest, OptimizeLastMileResponse
from app.services.scoring import evaluate_last_mile

app = FastAPI(title="last5min-optimizer")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/optimize-last-mile", response_model=OptimizeLastMileResponse)
def optimize_last_mile(payload: OptimizeLastMileRequest) -> OptimizeLastMileResponse:
    result = evaluate_last_mile(
        user_location=(payload.user_location.lat, payload.user_location.lon),
        destination=(payload.destination.lat, payload.destination.lon),
        use_case=payload.use_case,
    )

    return OptimizeLastMileResponse(**result)
