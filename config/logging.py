"""
Configuration du système de logging.
"""
import logging
import sys
from pathlib import Path


def setup_logging(log_level: str = "INFO", log_file: Path = None):
    """Configure le système de logging pour l'application."""
    
    # Format des logs
    log_format = "[%(levelname)s] %(name)s - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    
    # Configuration du logger root
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format=log_format,
        datefmt=date_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Ajouter un handler fichier si spécifié
    if log_file:
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(
            logging.Formatter(log_format, datefmt=date_format)
        )
        logging.getLogger().addHandler(file_handler)
    
    # Réduire le niveau de log pour les librairies externes
    logging.getLogger("werkzeug").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Récupère un logger nommé."""
    return logging.getLogger(name)