"""
Service de gestion npm.
"""
from pathlib import Path

from app.utils.shell import run_command, CommandResult
from config.logging import get_logger

logger = get_logger(__name__)


class NpmService:
    """Gère les opérations npm."""
    
    def __init__(self):
        pass
    
    def has_package_json(self, path: Path) -> bool:
        """
        Vérifie si un répertoire contient package.json.
        
        Args:
            path: Répertoire à vérifier
        
        Returns:
            True si package.json existe, False sinon
        """
        return (path / 'package.json').exists()
    
    def has_node_modules(self, path: Path) -> bool:
        """
        Vérifie si node_modules existe.
        
        Args:
            path: Répertoire à vérifier
        
        Returns:
            True si node_modules existe, False sinon
        """
        return (path / 'node_modules').exists()
    
    def install(self, path: Path, timeout: int = 300) -> CommandResult:
        """
        Exécute npm install.
        
        Args:
            path: Répertoire du projet
            timeout: Timeout en secondes (5 minutes par défaut)
        
        Returns:
            Résultat de la commande
        """
        logger.info(f"Exécution de npm install dans {path}")
        return run_command('npm install', cwd=path, timeout=timeout)
    
    def install_packages(self, path: Path, packages: list[str], dev: bool = False, timeout: int = 180) -> CommandResult:
        """
        Installe des packages spécifiques.
        
        Args:
            path: Répertoire du projet
            packages: Liste des packages à installer
            dev: Installer en tant que devDependencies
            timeout: Timeout en secondes
        
        Returns:
            Résultat de la commande
        """
        flag = ' -D' if dev else ''
        packages_str = ' '.join(packages)
        
        logger.info(f"Installation de {packages_str}{' (dev)' if dev else ''} dans {path}")
        return run_command(f'npm install{flag} {packages_str}', cwd=path, timeout=timeout)
    
    def create_vue_project(self, path: Path, project_name: str = "vue-project-temp") -> CommandResult:
        """
        Crée un nouveau projet Vue.js.
        
        Args:
            path: Répertoire parent
            project_name: Nom du projet temporaire
        
        Returns:
            Résultat de la commande
        """
        logger.info(f"Création d'un projet Vue dans {path}")
        return run_command(
            f'npm create vue@latest {project_name} -- --default',
            cwd=path,
            timeout=180
        )
    
    def create_react_project(self, path: Path) -> CommandResult:
        """
        Crée un nouveau projet React avec Vite.
        
        Args:
            path: Répertoire où créer le projet
        
        Returns:
            Résultat de la commande
        """
        logger.info(f"Création d'un projet React dans {path}")
        # Utiliser des echo pour répondre automatiquement "No" aux prompts
        return run_command(
            'echo "No" | echo "No" | npm create --yes vite@latest . -- --template react --force',
            cwd=path,
            timeout=180
        )
    
    
    
    def run_prisma_generate(self, path: Path) -> CommandResult:
        """
        Génère le client Prisma.
        
        Args:
            path: Répertoire du projet backend
        
        Returns:
            Résultat de la commande
        """
        logger.info(f"Génération du client Prisma dans {path}")
        return run_command('npx prisma generate', cwd=path, timeout=120)
    
    def run_prisma_migrate(self, path: Path, name: str = "init") -> CommandResult:
        """
        Exécute une migration Prisma.
        
        Args:
            path: Répertoire du projet backend
            name: Nom de la migration
        
        Returns:
            Résultat de la commande
        """
        logger.info(f"Migration Prisma '{name}' dans {path}")
        return run_command(f'npx prisma migrate dev --name {name}', cwd=path, timeout=120)
    
    def init_prisma(self, path: Path, provider: str = "sqlite") -> CommandResult:
        """
        Initialise Prisma dans un projet.
        
        Args:
            path: Répertoire du projet
            provider: Provider de base de données (sqlite, postgresql, etc.)
        
        Returns:
            Résultat de la commande
        """
        logger.info(f"Initialisation de Prisma ({provider}) dans {path}")
        return run_command(
            f'npx --yes prisma init --datasource-provider {provider}',
            cwd=path,
            timeout=60
        )
    
    def install_tailwind_react(self, path) -> CommandResult:
        result = run_command(
            f'npm install -D tailwindcss @tailwindcss/vite',
            cwd=path
        )
        if result.returncode != 0:
                    print(f"[CRITIQUE] L'installation de Tailwind CSS a échoué: {result.stderr}")
                    raise Exception(f"Échec de l'installation de Tailwind CSS: {result.stderr}")
        
        print("Installation des dépendances npm pour le projet de dev...")
        result = run_command('npm install', cwd=str(path))
        if result.returncode != 0:
            print(f"[CRITIQUE] L'installation des dépendances npm pour le projet de dev a échoué: {result.stderr}")
            raise Exception(f"Échec de l'installation des dépendances npm pour le projet de dev: {result.stderr}")
        
        print("Initialisation de Tailwind CSS...")
        result = run_command('npx tailwindcss-cli@latest init --y', cwd=str(path))
        if result.returncode != 0:
            print(f"[CRITIQUE] L'initialisation de Tailwind CSS a échoué: {result.stderr}")
            raise Exception(f"Échec de l'initialisation de Tailwind CSS: {result.stderr}")
        
        # Remplacer tailwind.config.js par la version ESM
        tailwind_config_content = """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}"""
        with open(path / 'tailwind.config.js', 'w', encoding='utf-8') as f:
            f.write(tailwind_config_content)
        print("Fichier tailwind.config.js mis à jour pour la compatibilité ESM.")

        # Modifier vite.config.js pour inclure le plugin @tailwindcss/vite
        vite_config_path = path / 'vite.config.js'
        if not vite_config_path.exists():
            vite_config_path = path / 'vite.config.ts'
        
        if vite_config_path.exists():
            with open(vite_config_path, 'r', encoding='utf-8') as f:
                vite_config_content = f.read()
            
            if "import tailwindcss from '@tailwindcss/vite';" not in vite_config_content:
                vite_config_content = "import tailwindcss from '@tailwindcss/vite';\n" + vite_config_content
            
            if "tailwindcss()," not in vite_config_content:
                vite_config_content = vite_config_content.replace(
                    'plugins: [',
                    'plugins: [tailwindcss(), '
                )
            
            with open(vite_config_path, 'w', encoding='utf-8') as f:
                f.write(vite_config_content)
            print(f"Fichier {vite_config_path.name} mis à jour pour inclure le plugin @tailwindcss/vite.")
        else:
            print(f"[AVERTISSEMENT] Fichier vite.config.js ou vite.config.ts introuvable dans {path}. Le plugin Tailwind CSS n'a pas pu être configuré automatiquement.")


        # Mettre à jour src/index.css pour utiliser @import "tailwindcss";
        index_css_path = path / 'src' / 'index.css'
        if not index_css_path.parent.exists():
            index_css_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(index_css_path, 'w', encoding='utf-8') as f:
            f.write("""@import "tailwindcss";

/* Ajoutez votre CSS personnalisé ici */
""")
        print("Directives Tailwind mises à jour dans src/index.css.")
        return result
    
    def install_tailwind_vue(self, path: Path) -> CommandResult:
        """
        Installe et configure Tailwind CSS pour un projet Vue.js.
        
        Args:
            path: Répertoire du projet Vue
        
        Returns:
            Résultat de la dernière commande exécutée
        """
        logger.info(f"Installation de Tailwind CSS pour Vue dans {path}...")
        
        # 1. Installer les dépendances
        result = run_command('npm install -D tailwindcss @tailwindcss/vite',path)
        if result.failed:
            raise Exception(f"Échec de l'installation de Tailwind: {result.stderr}")
        
        # 2. Initialiser Tailwind (crée tailwind.config.js et postcss.config.js)
        result = run_command('npx tailwindcss-cli@latest init --y', cwd=path, timeout=60)
        if result.failed:
            raise Exception(f"Échec de l'initialisation de Tailwind: {result.stderr}")
        
        # 3. Configurer tailwind.config.js
        vite_config_path = path / 'vite.config.js'
        vite_config_content = """import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
"""
        try:
            vite_config_path.write_text(vite_config_content, encoding='utf-8')
            logger.info("tailwind.config.js configuré pour Vue.")
        except IOError as e:
            raise Exception(f"Impossible d'écrire dans vite.config.js: {e}")
        
        # 4. Ajouter les directives Tailwind au CSS principal
        style_css_path = path / 'src' / 'style.css'
        if not style_css_path.exists():
            # Si le fichier par défaut n'existe pas, on le crée dans src/style.css
            main_css_path = path / 'src' / 'style.css'
            logger.info("Fichier src/style.css non trouvé, création de src/style.css")
        
        tailwind_directives = """@import 'tailwindcss';"""
        try:
            if style_css_path.exists():
                content = style_css_path.read_text(encoding='utf-8')
                # Ajouter au début pour que les styles perso puissent surcharger
                style_css_path.write_text(tailwind_directives + content, encoding='utf-8')
            else:
                style_css_path.parent.mkdir(parents=True, exist_ok=True)
                style_css_path.write_text(tailwind_directives, encoding='utf-8')
            
            logger.info(f"Directives Tailwind ajoutées à {main_css_path}")
        except IOError as e:
            raise Exception(f"Impossible de modifier le fichier CSS principal: {e}")
            
        return result