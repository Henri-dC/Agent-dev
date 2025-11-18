"""
Routes de preview et proxy pour le serveur de développement.
"""
from flask import Blueprint, Response, request
import requests

from config.settings import get_config
from config.logging import get_logger

logger = get_logger(__name__)

preview_bp = Blueprint('preview', __name__)

# Session pour le proxy
_session = requests.Session()
_session.headers.update({'User-Agent': 'dev-preview-proxy/1.0'})


@preview_bp.route('/preview')
@preview_bp.route('/preview/')
def preview_root():
    """Proxy pour la page d'accueil du serveur de développement."""
    config = get_config()
    target_url = config.servers.dev_url
    
    try:
        response = _session.get(target_url, timeout=10)
        content = response.text
        
        # Injecter une balise <base> pour que tous les chemins relatifs pointent vers le proxy
        base_tag = '<base href="/preview/">'
        # Insérer la balise juste après l'ouverture de <head>
        content = content.replace('<head>', f'<head>\n    {base_tag}', 1)
        
        return Response(content, status=response.status_code, content_type=response.headers['Content-Type'])
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Erreur proxy pour la racine de dev: {e}")
        return Response(f"Le serveur de développement ne semble pas être démarré. Erreur: {e}", status=503)
        
        
@preview_bp.route('/preview/<path:path>')
def proxy_dev_assets(path):
    """
    Proxy pour les assets du serveur de dev.
    
    Args:
        path: Chemin de l'asset à proxyfier
    
    Returns:
        Réponse HTTP avec le contenu de l'asset
    """
    config = get_config()
    # Reconstruire l'URL cible complète, y compris les requêtes de modules comme @vite/client
    target_path = request.full_path.replace('/preview/', '/', 1)
    target = f"{config.servers.dev_url}{target_path}"
    
    logger.debug(f"Proxying asset: {request.full_path} -> {target}")
    
    try:
        response = _session.get(target, stream=True, timeout=5)
        
        content_type = response.headers.get('Content-Type', 'application/octet-stream')
        
        # Si c'est le client Vite, on modifie le contenu pour corriger le HMR
        if path == '@vite/client' and 'javascript' in content_type:
            content = response.text
            vite_url = config.servers.dev_url.replace('http://', '')
            # Remplace l'hôte de connexion WebSocket par celui du serveur Vite
            content = content.replace('host: location.host', f'host: "{vite_url}"')
            raw_content = content.encode('utf-8')
        else:
            raw_content = response.raw.read()

        excluded_headers = {"content-encoding", "transfer-encoding", "connection"}
        headers = [
            (k, v) for k, v in response.headers.items() 
            if k.lower() not in excluded_headers
        ]
        
        return Response(
            raw_content,
            status=response.status_code,
            headers=headers,
            content_type=content_type
        )
    except requests.exceptions.RequestException as e:
        logger.error(f"Erreur proxy pour {path}: {e}")
        return Response(f"Erreur proxy Vite: {e}", status=502)


# Route de secours pour intercepter les chemins que Vite demande à la racine
@preview_bp.route('/<path:path>')
def proxy_vite_root_paths(path):
    """Redirige les requêtes de Vite à la racine vers le proxy."""
    # On intercepte et on transfère tout ce qui n'a pas été géré par une autre route
    logger.debug(f"Intercepted root request for '{path}', forwarding to proxy.")
    return proxy_dev_assets(path)