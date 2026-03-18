from __future__ import annotations

import argparse
import csv
import pickle
from pathlib import Path

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor

FEATURE_COLUMNS = [
    "distance_to_entry",
    "crowd_level",
    "accessibility",
    "user_type",
]
TARGET_COLUMN = "friction_score"


def load_dataset(csv_path: Path) -> tuple[np.ndarray, np.ndarray]:
    """Load feature matrix X and target vector y from dataset CSV."""
    rows: list[list[float]] = []
    targets: list[float] = []

    with csv_path.open("r", encoding="utf-8", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        required_columns = set(FEATURE_COLUMNS + [TARGET_COLUMN])

        if reader.fieldnames is None:
            raise ValueError("CSV has no header row.")

        missing_columns = required_columns.difference(reader.fieldnames)
        if missing_columns:
            raise ValueError(
                f"CSV is missing required columns: {sorted(missing_columns)}"
            )

        for row in reader:
            rows.append([float(row[column]) for column in FEATURE_COLUMNS])
            targets.append(float(row[TARGET_COLUMN]))

    if not rows:
        raise ValueError("CSV contains no data rows.")

    return np.array(rows, dtype=float), np.array(targets, dtype=float)


def train_model(X: np.ndarray, y: np.ndarray, model_name: str):
    """Train a regression model using the selected algorithm."""
    if model_name == "decision_tree":
        model = DecisionTreeRegressor(max_depth=6, random_state=42)
    elif model_name == "linear_regression":
        model = LinearRegression()
    else:
        raise ValueError(
            "Unsupported model. Use 'decision_tree' or 'linear_regression'."
        )

    X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)
    return model


def save_model(model, output_path: Path) -> None:
    """Serialize trained model to pickle file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("wb") as model_file:
        pickle.dump(model, model_file)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train ML model on synthetic CSV data.")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("data") / "synthetic_training_data.csv",
        help="Path to synthetic dataset CSV.",
    )
    parser.add_argument(
        "--model",
        choices=["decision_tree", "linear_regression"],
        default="decision_tree",
        help="Model type to train.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data") / "last_mile_model.pkl",
        help="Output path for trained pickle model.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    X, y = load_dataset(args.input)
    model = train_model(X, y, args.model)
    save_model(model, args.output)

    print(f"Model trained with {args.model} and saved to {args.output}")


if __name__ == "__main__":
    main()
