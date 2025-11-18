"""
Modèles pour les actions Gemini.
"""
from dataclasses import dataclass
from typing import Literal, Optional
from enum import Enum


class ActionType(str, Enum):
    """Types d'actions possibles."""
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    RUN_SHELL_COMMAND = "RUN_SHELL_COMMAND"


@dataclass
class FileAction:
    """Action sur un fichier."""
    action: ActionType
    file_path: str
    content: Optional[str] = None
    new_content: Optional[str] = None
    
    def get_content(self) -> Optional[str]:
        """Retourne le contenu (content ou new_content)."""
        return self.content or self.new_content
    
    def validate(self) -> tuple[bool, str]:
        """Valide l'action."""
        if not self.file_path:
            return False, "file_path est requis"
        
        if self.action in [ActionType.CREATE, ActionType.UPDATE]:
            if not self.get_content():
                return False, f"content ou new_content requis pour {self.action}"
        
        return True, "OK"


@dataclass
class ShellCommandAction:
    """Action de commande shell."""
    action: Literal[ActionType.RUN_SHELL_COMMAND]
    command: str
    cwd: Optional[str] = None
    
    def validate(self) -> tuple[bool, str]:
        """Valide l'action."""
        if not self.command:
            return False, "command est requis"
        
        return True, "OK"


@dataclass
class GeminiResponse:
    """Réponse de l'API Gemini."""
    explanation: str
    actions: list[FileAction | ShellCommandAction]
    
    @classmethod
    def from_dict(cls, data: dict) -> 'GeminiResponse':
        """Crée une instance depuis un dictionnaire en validant les actions."""
        actions = []
        
        for i, action_data in enumerate(data.get('actions', [])):
            action_type_str = action_data.get('action')
            
            if not action_type_str:
                raise ValueError(f"Action #{i+1} n'a pas de type ('action')")

            try:
                action_type = ActionType(action_type_str)
            except ValueError:
                raise ValueError(f"Action #{i+1} a un type invalide: {action_type_str}")

            action_obj = None
            if action_type == ActionType.RUN_SHELL_COMMAND:
                action_obj = ShellCommandAction(
                    action=action_type,
                    command=action_data.get('command', ''),
                    cwd=action_data.get('cwd')
                )
            else:
                action_obj = FileAction(
                    action=action_type,
                    file_path=action_data.get('file_path', ''),
                    content=action_data.get('content'),
                    new_content=action_data.get('new_content')
                )
            
            is_valid, error_msg = action_obj.validate()
            if not is_valid:
                raise ValueError(f"Action #{i+1} ({action_type.value}) est invalide: {error_msg}")
            
            actions.append(action_obj)
        
        return cls(
            explanation=data.get('explanation', 'Aucune explication fournie.'),
            actions=actions
        )