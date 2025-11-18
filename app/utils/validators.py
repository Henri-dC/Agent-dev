"""
Utilitaires de validation.
"""
from pathlib import Path
from typing import Union


class ValidationError(Exception):
    """Exception levée lors d'une validation échouée."""
    pass


def is_safe_path(base_dir: Union[str, Path], target_path: Union[str, Path], 
                 follow_symlinks: bool = True) -> bool:
    """
    Vérifie qu'un chemin est contenu dans un répertoire de base.
    Protection contre path traversal attacks.
    
    Args:
        base_dir: Répertoire de base autorisé
        target_path: Chemin à valider
        follow_symlinks: Suivre les liens symboliques
    
    Returns:
        True si le chemin est sûr, False sinon
    """
    try:
        base = Path(base_dir).resolve()
        
        if follow_symlinks:
            target = Path(target_path).resolve()
        else:
            target = Path(target_path).absolute()
        
        # Vérifier que target est dans base ou est base
        return base in target.parents or base == target
    except (ValueError, OSError):
        return False


def validate_workspace_path(workspace_path: Union[str, Path], 
                            base_dir: Union[str, Path]) -> Path:
    """
    Valide et normalise un chemin de workspace.
    
    Args:
        workspace_path: Chemin à valider
        base_dir: Répertoire de base du projet
    
    Returns:
        Path validé et résolu
    
    Raises:
        ValidationError: Si le chemin n'est pas valide
    """
    try:
        path = Path(workspace_path).resolve()
    except (ValueError, OSError) as e:
        raise ValidationError(f"Chemin invalide: {workspace_path} - {e}")
    
    if not is_safe_path(base_dir, path):
        raise ValidationError(
            f"Chemin non autorisé (en dehors de {base_dir}): {path}"
        )
    
    return path


def validate_file_path(file_path: str, allowed_workspaces: dict[str, Path]) -> tuple[Path, Path]:
    """
    Valide un chemin de fichier et retourne le workspace et le chemin absolu.
    
    Args:
        file_path: Chemin relatif avec préfixe (ex: 'dev/src/App.jsx')
        allowed_workspaces: Dictionnaire {prefix: base_path}
    
    Returns:
        Tuple (workspace_base_path, absolute_file_path)
    
    Raises:
        ValidationError: Si le chemin n'est pas valide
    """
    if not file_path:
        raise ValidationError("Chemin de fichier vide")
    
    # Déterminer le workspace
    workspace_base = None
    relative_path = None
    
    for prefix, base_path in allowed_workspaces.items():
        if file_path.startswith(f"{prefix}/"):
            workspace_base = base_path
            relative_path = file_path[len(prefix)+1:]
            break
    
    if workspace_base is None:
        raise ValidationError(
            f"Préfixe de workspace non reconnu dans: {file_path}\n"
            f"Préfixes autorisés: {', '.join(allowed_workspaces.keys())}"
        )
    
    # Construire le chemin absolu
    absolute_path = (workspace_base / relative_path).resolve()
    
    # Vérifier la sécurité
    if not is_safe_path(workspace_base.parent, absolute_path):
        raise ValidationError(
            f"Chemin non autorisé (tentative de path traversal): {file_path}"
        )
    
    return workspace_base, absolute_path


def sanitize_command(command: str) -> str:
    """
    Nettoie une commande shell pour éviter les injections.
    
    Note: Cette fonction est basique. Pour une vraie sécurité,
    utilisez subprocess avec des listes d'arguments.
    
    Args:
        command: Commande à nettoyer
    
    Returns:
        Commande nettoyée
    """
    # Supprimer les caractères dangereux communs
    dangerous_chars = [';', '&&', '||', '|', '`', '$', '(', ')']
    
    for char in dangerous_chars:
        if char in command and not _is_safe_command(command):
            raise ValidationError(
                f"Caractère potentiellement dangereux détecté dans la commande: {char}"
            )
    
    return command.strip()


def _is_safe_command(command: str) -> bool:
    """
    Vérifie si une commande contenant des caractères spéciaux est sûre.
    
    Whitelist de commandes connues sûres.
    """
    safe_commands = [
        'npm install',
        'npm run',
        'npx prisma',
        'git ',
    ]
    
    return any(command.startswith(safe_cmd) for safe_cmd in safe_commands)