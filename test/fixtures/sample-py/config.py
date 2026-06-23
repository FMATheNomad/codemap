from dataclasses import dataclass
from typing import Optional


@dataclass
class Config:
    name: str
    version: Optional[str] = None
    debug: bool = False


def load_config(path: str) -> Config:
    return Config(name="default")


def create_default_config() -> Config:
    return Config(name="default", version="1.0.0", debug=False)
