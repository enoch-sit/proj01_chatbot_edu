#!/usr/bin/env python3
"""Test if .env loads correctly"""
from pathlib import Path
import os

try:
    from dotenv import load_dotenv

    env_path = Path(__file__).parent / ".env"
    print(f"Loading .env from: {env_path}")
    print(f".env exists: {env_path.exists()}")
    load_dotenv(dotenv_path=env_path, override=True)
    print(f"AZURE_OPENAI_ENDPOINT: {os.getenv('AZURE_OPENAI_ENDPOINT')}")
    print(
        f"AZURE_OPENAI_API_KEY: {os.getenv('AZURE_OPENAI_API_KEY')[:20] if os.getenv('AZURE_OPENAI_API_KEY') else None}..."
    )
    print(f"AZURE_OPENAI_MODEL: {os.getenv('AZURE_OPENAI_MODEL')}")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")
