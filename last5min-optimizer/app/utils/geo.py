from __future__ import annotations

from math import asin, cos, radians, sin, sqrt

EARTH_RADIUS_METERS = 6_371_000.0


def haversine_distance_meters(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
    *,
    radius_meters: float = EARTH_RADIUS_METERS,
) -> float:
    """Calculate great-circle distance between two points on Earth in meters.

    Args:
        lat1: Latitude of the first point in decimal degrees.
        lon1: Longitude of the first point in decimal degrees.
        lat2: Latitude of the second point in decimal degrees.
        lon2: Longitude of the second point in decimal degrees.
        radius_meters: Sphere radius in meters; defaults to Earth's mean radius.

    Returns:
        Distance between the two points in meters.
    """
    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)

    delta_lat = lat2_rad - lat1_rad
    delta_lon = lon2_rad - lon1_rad

    hav = (
        sin(delta_lat / 2.0) ** 2
        + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lon / 2.0) ** 2
    )
    central_angle = 2.0 * asin(sqrt(hav))

    return radius_meters * central_angle
