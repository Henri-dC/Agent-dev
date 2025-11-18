"""
Wrapper pour l'exécution de commandes shell.
"""
import subprocess
from pathlib import Path
from typing import Optional, Union
from dataclasses import dataclass

from app.utils.exceptions import GitError
from config.logging import get_logger

logger = get_logger(__name__)


@dataclass
class CommandResult:
    """Résultat d'une commande shell."""
    command: str
    returncode: int
    stdout: str
    stderr: str
    cwd: str
    
    @property
    def success(self) -> bool:
        """Indique si la commande a réussi."""
        return self.returncode == 0
    
    @property
    def failed(self) -> bool:
        """Indique si la commande a échoué."""
        return self.returncode != 0


class CommandExecutor:
    """Exécuteur de commandes shell avec gestion d'erreurs."""
    
    def __init__(self, default_timeout: int = 300):
        """
        Args:
            default_timeout: Timeout par défaut en secondes (5 minutes)
        """
        self.default_timeout = default_timeout
    
    def run(
        self,
        command: str,
        cwd: Union[str, Path] = ".",
        timeout: Optional[int] = None,
        check: bool = False,
        capture_output: bool = True
    ) -> CommandResult:
        """
        Exécute une commande shell.
        
        Args:
            command: Commande à exécuter
            cwd: Répertoire de travail
            timeout: Timeout en secondes (None = utiliser default_timeout)
            check: Lever une exception si returncode != 0
            capture_output: Capturer stdout et stderr
        
        Returns:
            CommandResult contenant le résultat de l'exécution
        
        Raises:
            GitError: Si check=True et la commande échoue
            subprocess.TimeoutExpired: Si la commande dépasse le timeout
        """
        cwd_str = str(cwd)
        timeout_val = timeout or self.default_timeout
        
        logger.info(f"Exécution: {command} (cwd={cwd_str})")
        
        try:
            result = subprocess.run(
                command,
                cwd=cwd_str,
                shell=True,
                capture_output=capture_output,
                text=True,
                encoding='utf-8',
                errors='replace', # Gérer les erreurs d'encodage sur Windows
                timeout=timeout_val,
                start_new_session=True
            )
            
            if result.stdout:
                logger.debug(f"STDOUT: {result.stdout.strip()}")
            if result.stderr:
                logger.debug(f"STDERR: {result.stderr.strip()}")
            
            if check and result.returncode != 0:
                error_message = f"La commande a échoué: {command}"
                logger.error(
                    f"{error_message} (code {result.returncode})\nSTDERR: {result.stderr.strip()}"
                )
                raise GitError(
                    message=error_message,
                    stderr=result.stderr,
                    returncode=result.returncode
                )
            
            return CommandResult(
                command=command,
                returncode=result.returncode,
                stdout=result.stdout,
                stderr=result.stderr,
                cwd=cwd_str
            )
        
        except subprocess.TimeoutExpired as e:
            logger.error(f"Timeout ({timeout_val}s) pour: {command}")
            # Renvoyer une CommandResult qui échoue au lieu de lever une exception
            return CommandResult(
                command=command,
                returncode=-1,
                stdout="",
                stderr=f"Timeout après {timeout_val}s",
                cwd=cwd_str
            )
        
        except Exception as e:
            # Si ce n'est pas une GitError, la wrapper
            if not isinstance(e, GitError):
                logger.exception(f"Erreur inattendue lors de l'exécution de: {command}")
                return CommandResult(
                    command=command,
                    returncode=-1,
                    stdout="",
                    stderr=str(e),
                    cwd=cwd_str
                )
            # Si c'est déjà une GitError, la relancer
            raise e
    
    def run_check(
        self,
        command: str,
        cwd: Union[str, Path] = ".",
        timeout: Optional[int] = None
    ) -> CommandResult:
        """
        Exécute une commande et lève une exception si elle échoue.
        
        Raccourci pour run(..., check=True)
        """
        return self.run(command, cwd, timeout, check=True)


# Instance globale
_executor: Optional[CommandExecutor] = None


def get_executor() -> CommandExecutor:
    """Récupère l'instance globale de CommandExecutor."""
    global _executor
    if _executor is None:
        _executor = CommandExecutor()
    return _executor


def run_command(
    command: str,
    cwd: Union[str, Path] = ".",
    timeout: Optional[int] = None,
    check: bool = False
) -> CommandResult:
    """
    Fonction helper pour exécuter une commande.
    
    Équivalent à get_executor().run(...)
    """
    return get_executor().run(command, cwd, timeout, check)