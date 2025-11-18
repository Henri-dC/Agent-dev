import os
import json
from flask import Blueprint, render_template, request, redirect, url_for, flash
from config.settings import reload_config
from app.services.workspace_service import WorkspaceService
from app.services.process_service import ProcessService

project_bp = Blueprint('project', __name__, url_prefix='/')

CONFIG_PATH = 'project_config.json'
BASE_PROJECT_PATH = 'C:/Users/PC/VSC Dosss/Agent dev/'

# Services
_workspace_service: WorkspaceService = None
_process_service: ProcessService = None

def init_services(workspace_svc=None, process_svc=None):
    """Injecte les services nécessaires."""
    global _workspace_service, _process_service
    _workspace_service = workspace_svc
    _process_service = process_svc


def get_existing_projects():
    """Retourne la liste des projets existants."""
    excluded_dirs = {'IA', 'workspace', '.git'}
    projects = []
    if os.path.exists(BASE_PROJECT_PATH):
        for item in os.listdir(BASE_PROJECT_PATH):
            if os.path.isdir(os.path.join(BASE_PROJECT_PATH, item)) and item not in excluded_dirs:
                projects.append(item)
    return projects

@project_bp.route('/', methods=['GET'])
def project_selection():
    """Affiche la page de sélection et de création de projet."""
    projects = get_existing_projects()
    return render_template('project_selection.html', projects=projects)

@project_bp.route('/reset', methods=['GET'])
def reset_project():
    """Arrête les serveurs et retourne à l'accueil."""
    _process_service.stop_all()
    return redirect(url_for('project.project_selection'))


def _setup_and_start_project(project_name):
    """Met à jour la configuration, initialise et démarre un projet."""
    project_path = os.path.join(BASE_PROJECT_PATH, project_name).replace('\\\\', '/')
    
    # Mettre à jour la configuration
    with open(CONFIG_PATH, 'r+') as f:
        config = json.load(f)
        config['dev_path'] = f"{project_path}/dev"
        config['prod_path'] = f"{project_path}/prod"
        config['backend_dev_path'] = f"{project_path}/backend_dev"
        f.seek(0)
        json.dump(config, f, indent=4)
        f.truncate()
    
    reload_config()
    
    # Initialiser le service ChromaDB avec le nom du projet
    from app.services.chroma_service import init_chroma_service
    init_chroma_service(project_name)

    # Initialiser et démarrer l'environnement
    from config.settings import get_config
    app_config = get_config()
    
    _workspace_service.setup_all()
    _process_service.start_dev_server(
        app_config.paths.dev_path,
        app_config.servers.dev_port
    )
    _process_service.start_backend_server(
        app_config.paths.backend_dev_path,
        app_config.servers.backend_port
    )

@project_bp.route('/select-project', methods=['POST'])
def select_project():
    """Met à jour la configuration, initialise et démarre le projet sélectionné."""
    project_name = request.form.get('project_name')
    if not project_name:
        flash('Veuillez sélectionner un projet.', 'error')
        return redirect(url_for('project.project_selection'))

    try:
        _setup_and_start_project(project_name)
        flash(f"Projet '{project_name}' démarré.", 'success')
        return redirect(url_for('api.main_page'))

    except Exception as e:
        flash(f"Erreur lors du démarrage du projet : {e}", 'error')
        return redirect(url_for('project.project_selection'))

@project_bp.route('/create-project', methods=['POST'])
def create_project():
    """Crée un nouveau projet et met à jour la configuration."""
    project_name = request.form.get('new_project_name')
    if not project_name or not project_name.strip():
        flash('Le nom du projet ne peut pas être vide.', 'error')
        return redirect(url_for('project.project_selection'))

    project_path = os.path.join(BASE_PROJECT_PATH, project_name).replace('\\\\', '/')

    if os.path.exists(project_path):
        flash(f"Le projet '{project_name}' existe déjà.", 'error')
        return redirect(url_for('project.project_selection'))

    try:
        os.makedirs(project_path)
        os.makedirs(f"{project_path}/dev")
        os.makedirs(f"{project_path}/prod")
        os.makedirs(f"{project_path}/backend_dev")
        
        _setup_and_start_project(project_name)
        
        flash(f"Projet '{project_name}' créé et démarré avec succès.", 'success')
        return redirect(url_for('api.main_page'))
        
    except (IOError, OSError, json.JSONDecodeError) as e:
        flash(f"Erreur lors de la création du projet : {e}", 'error')
        return redirect(url_for('project.project_selection'))
