"""
Centralized structured logging configuration.
"""

import logging
import sys
from typing import Optional


def setup_logging(log_level: Optional[str] = None) -> None:
    """
    Sets up root and application logger formatting and handlers.
    """
    level_str = (log_level or "INFO").upper()
    level = getattr(logging, level_str, logging.INFO)

    log_format = "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    # Configure root logger
    logging.basicConfig(
        level=level,
        format=log_format,
        datefmt=date_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

    # Silence overly verbose third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Returns a configured logger instance with the given name.
    """
    return logging.getLogger(name)
