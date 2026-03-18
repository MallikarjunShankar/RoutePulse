from __future__ import annotations

import argparse
import csv
import random
from pathlib import Path

DEFAULT_SAMPLES = 800
MIN_SAMPLES = 500
MAX_SAMPLES = 1000

USER_TYPE_ENCODING = {
    "regular": 0,
    "vip": 1,
    "emergency": 2,
}


def _clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def _compute_friction_score(
    distance_to_entry: float,
    crowd_level: float,
    accessibility: float,
    user_type_encoded: int,
) -> float:
    """Rule-based friction score where lower values indicate easier access."""
    distance_norm = distance_to_entry / 300.0
    crowd_norm = crowd_level
    accessibility_penalty = 1.0 - accessibility

    base = (distance_norm * 0.45) + (crowd_norm * 0.35) + (accessibility_penalty * 0.20)

    if user_type_encoded == USER_TYPE_ENCODING["emergency"]:
        base -= 0.22
    elif user_type_encoded == USER_TYPE_ENCODING["vip"]:
        base -= 0.08

    noise = random.uniform(-0.03, 0.03)
    return round(_clamp(base + noise, 0.0, 1.0), 4)


def generate_dataset(sample_count: int) -> list[dict[str, float | int]]:
    rows: list[dict[str, float | int]] = []
    user_types = list(USER_TYPE_ENCODING.values())

    for _ in range(sample_count):
        distance_to_entry = round(random.uniform(10.0, 300.0), 2)
        crowd_level = round(random.uniform(0.0, 1.0), 4)
        accessibility = round(random.uniform(0.0, 1.0), 4)
        user_type_encoded = random.choice(user_types)

        friction_score = _compute_friction_score(
            distance_to_entry=distance_to_entry,
            crowd_level=crowd_level,
            accessibility=accessibility,
            user_type_encoded=user_type_encoded,
        )

        rows.append(
            {
                "distance_to_entry": distance_to_entry,
                "crowd_level": crowd_level,
                "accessibility": accessibility,
                "user_type": user_type_encoded,
                "friction_score": friction_score,
            }
        )

    return rows


def save_dataset_csv(rows: list[dict[str, float | int]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=[
                "distance_to_entry",
                "crowd_level",
                "accessibility",
                "user_type",
                "friction_score",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate synthetic training data CSV.")
    parser.add_argument(
        "--samples",
        type=int,
        default=DEFAULT_SAMPLES,
        help="Number of rows to generate (500-1000).",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducible data.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data") / "synthetic_training_data.csv",
        help="Output CSV path.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if not (MIN_SAMPLES <= args.samples <= MAX_SAMPLES):
        raise ValueError(
            f"Sample count must be between {MIN_SAMPLES} and {MAX_SAMPLES}, got {args.samples}."
        )

    random.seed(args.seed)
    dataset = generate_dataset(sample_count=args.samples)
    save_dataset_csv(dataset, output_path=args.output)
    print(f"Generated {len(dataset)} rows at {args.output}")


if __name__ == "__main__":
    main()
