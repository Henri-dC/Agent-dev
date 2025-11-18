"""
Exceptions personnalisées pour l'application.
"""

class GitError(Exception):
    """Exception levée pour les erreurs des commandes Git."""
    def __init__(self, message, stderr=None, returncode=None):
        super().__init__(message)
        self.stderr = stderr
        self.returncode = returncode

    def __str__(self):
        return f"{super().__str__()} (exit code: {self.returncode})\n{self.stderr}"

