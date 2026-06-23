import json
from typing import Any


def greet(name: str) -> str:
    return f"Hello, {name}!"


def format_output(data: Any) -> str:
    return json.dumps(data, indent=2)


def calculate_score(scores: list[float]) -> float:
    return sum(scores) / len(scores) if scores else 0.0
