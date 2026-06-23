import os
import sys
from .utils.helper import greet, format_output
from .config import load_config

def main():
    config = load_config("config.json")
    message = greet(config["name"])
    print(message)

if __name__ == "__main__":
    main()
