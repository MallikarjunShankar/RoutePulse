from __future__ import annotations

from typing import Any, Mapping, Sequence

from app.utils.geo import haversine_distance_meters

LAST_MILE_THRESHOLD_METERS = 500.0
NEARBY_ENTRY_THRESHOLD_METERS = 300.0


def _coords_from_entry(entry: Mapping[str, Any]) -> tuple[float, float]:
    """Extract latitude and longitude from a map-like entry object."""
    return float(entry["lat"]), float(entry["lon"])


def is_last_mile(
    user_coords: Sequence[float],
    destination_coords: Sequence[float],
) -> tuple[bool, float]:
    """Check whether a user is within the last-mile distance to destination.

    Args:
        user_coords: User coordinates as (latitude, longitude).
        destination_coords: Destination coordinates as (latitude, longitude).

    Returns:
        A tuple containing:
        - is_last_mile: True when distance is <= 500 meters.
        - distance_meters: Calculated Haversine distance in meters.
    """
    user_lat, user_lon = float(user_coords[0]), float(user_coords[1])
    dest_lat, dest_lon = float(destination_coords[0]), float(destination_coords[1])

    distance_meters = haversine_distance_meters(user_lat, user_lon, dest_lat, dest_lon)
    return distance_meters <= LAST_MILE_THRESHOLD_METERS, distance_meters


def filter_nearby_entries(
    user_coords: Sequence[float],
    entries: Sequence[Mapping[str, Any]],
    *,
    threshold_meters: float = NEARBY_ENTRY_THRESHOLD_METERS,
) -> list[Mapping[str, Any]]:
    """Return entries whose distance from the user is within threshold meters.

    Args:
        user_coords: User coordinates as (latitude, longitude).
        entries: Entry records containing `lat` and `lon` keys.
        threshold_meters: Maximum allowed distance from user in meters.

    Returns:
        A list of entries located within the given threshold.
    """
    user_lat, user_lon = float(user_coords[0]), float(user_coords[1])

    nearby: list[Mapping[str, Any]] = []
    for entry in entries:
        entry_lat, entry_lon = _coords_from_entry(entry)
        distance_meters = haversine_distance_meters(user_lat, user_lon, entry_lat, entry_lon)
        if distance_meters <= threshold_meters:
            nearby.append(entry)

    return nearby
