"""
Application Flask - Factory pattern avec injection de dépendances.
"""
from flask import Flask
from pathlib import Path

from config.settings import get_config
from config.logging import setup_logging, get_logger
from app.services.process_service import ProcessService
from app.services.git_service import GitService
from app.services.npm_service import NpmService
from app.services.workspace_service import WorkspaceService
from app.services.gemini_service import GeminiService
from app.services.claude_service import ClaudeService
from app.services.chroma_service import ChromaService
from app.routes import register_blueprints, inject_services

logger = get_logger(__name__)


def create_app() -> Flask:
    """
    Factory pour créer et configurer l'application Flask.
    """
    setup_logging(log_level="DEBUG")
    logger.info("=== Démarrage de l'application ===")
    
    config = get_config()
    
    app = Flask(__name__, template_folder="../templates", static_folder="../static")
    app.secret_key = 'dev_secret_key'
    
    # Initialisation des services
    logger.info("Initialisation des services...")
    process_service = ProcessService()
    git_service = GitService()
    npm_service = NpmService()
    workspace_service = WorkspaceService(npm_service, git_service)
    gemini_service = GeminiService(config)
    claude_service = ClaudeService(config)
    
    # Injection des dépendances dans les blueprints
    inject_services(
        process_svc=process_service,
        git_svc=git_service,
        npm_svc=npm_service,
        workspace_svc=workspace_service,
        gemini_svc=gemini_service,
        claude_svc=claude_service
    )
    
    logger.info("Enregistrement des routes...")
    register_blueprints(app)
    
    logger.info("=== Application initialisée ===")
    
    return app