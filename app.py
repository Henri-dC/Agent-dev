"""
Point d'entrée principal de l'application.
"""
import atexit
from app import create_app
from config.logging import get_logger
from app.services.process_service import process_service

logger = get_logger(__name__)

# Enregistrer l'arrêt des serveurs à la fermeture de l'application
atexit.register(process_service.stop_all)


if __name__ == '__main__':
    try:
        # Créer l'application Flask via la factory
        app = create_app()
        
        # Lancer le serveur Flask
        logger.info("Démarrage du serveur Flask sur http://0.0.0.0:5000")
        
        # use_reloader=False car nous gérons les processus enfants manuellement
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=False
        )
    
    except Exception as e:
        logger.critical(f"Le serveur n'a pas pu démarrer: {e}", exc_info=True)