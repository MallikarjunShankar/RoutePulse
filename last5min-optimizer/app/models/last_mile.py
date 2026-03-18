from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    lat: float = Field(ge=-90.0, le=90.0)
    lon: float = Field(ge=-180.0, le=180.0)


class OptimizeLastMileRequest(BaseModel):
    user_location: Coordinates
    destination: Coordinates
    use_case: Literal["delivery", "emergency", "mobility", "logistics"] = "delivery"


class OptimizeLastMileResponse(BaseModel):
    distance: float
    use_case: str
    threshold_used: float
    score: float
    priority_level: int
    status: Literal["optimal", "acceptable", "far"]
