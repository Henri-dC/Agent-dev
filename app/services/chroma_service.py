import chromadb
import os
import logging

class ChromaService:
    def __init__(self, project_name):
        try:
            # Le client persistant stockera les données sur le disque
            self.client = chromadb.PersistentClient(path=f"chroma_db/{project_name}")
            # La collection est l'endroit où nous stockerons les extraits de code
            self.collection = self.client.get_or_create_collection(name="project_files")
            logging.info(f"ChromaDB service initialized for project '{project_name}'.")
        except Exception as e:
            logging.error(f"Failed to initialize ChromaDB client: {e}")
            self.client = None
            self.collection = None

    def index_workspaces(self, workspace_paths: dict):
        """
        Scanne plusieurs répertoires de projet, lit les fichiers et les insère dans ChromaDB
        en une seule transaction.
        """
        if not self.collection:
            logging.error("Chroma collection not available.")
            return {"status": "error", "message": "Chroma collection not available."}

        all_documents, all_metadatas, all_ids = [], [], []
        
        for workspace_name, project_path in workspace_paths.items():
            if not os.path.exists(project_path):
                logging.warning(f"Le chemin pour '{workspace_name}' n'existe pas: {project_path}")
                continue
            
            logging.info(f"Scanning workspace '{workspace_name}' at: {project_path}")
            docs, metas, ids = self._scan_directory(project_path)
            all_documents.extend(docs)
            all_metadatas.extend(metas)
            all_ids.extend([f"{workspace_name}_{i}" for i in ids]) # Préfixer pour unicité

        if not all_documents:
            logging.warning("No documents found to index across all workspaces.")
            return {"status": "success", "count": 0}

        try:
            # Vider la collection avant d'ajouter de nouveaux documents
            existing_ids = self.collection.get()['ids']
            if existing_ids:
                self.collection.delete(ids=existing_ids)
            
            # Ajouter tous les documents en une seule fois
            self.collection.add(
                documents=all_documents,
                metadatas=all_metadatas,
                ids=all_ids
            )
            count = len(all_documents)
            logging.info(f"Successfully indexed {count} documents from all workspaces.")
            return {"status": "success", "count": count}
        except Exception as e:
            logging.error(f"Failed to add documents to Chroma collection: {e}")
            return {"status": "error", "message": f"Failed to add documents to Chroma: {e}"}

    def _scan_directory(self, project_path):
        """Scanne un seul répertoire et retourne ses fichiers."""
        allowed_extensions = ['.py', '.js', '.html', '.css', '.json', '.md', '.ts', '.tsx', '.jsx', '.env']
        documents, metadatas, ids = [], [], []
        doc_id = 1
        
        for root, _, files in os.walk(project_path):
            if '.git' in root or 'node_modules' in root or '__pycache__' in root:
                continue

            for file in files:
                if any(file.endswith(ext) for ext in allowed_extensions):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, project_path)
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            if content.strip():
                                documents.append(content)
                                metadatas.append({"source": relative_path})
                                ids.append(str(doc_id))
                                doc_id += 1
                    except Exception as e:
                        logging.warning(f"Could not read file {file_path}: {e}")
        return documents, metadatas, ids

    def query(self, text, n_results=5):
        """
        Interroge la collection pour trouver les extraits de code les plus pertinents.
        """
        if not self.collection:
            logging.error("Chroma collection not available.")
            return []
        try:
            results = self.collection.query(
                query_texts=[text],
                n_results=n_results
            )
            # Retourner les documents et leurs métadonnées (chemin du fichier)
            return list(zip(results['documents'][0], results['metadatas'][0]))
        except Exception as e:
            logging.error(f"Error querying Chroma collection: {e}")
            return []

# Initialisation globale du service (sera gérée par l'application)
chroma_service = None

def init_chroma_service(project_name):
    """Initialise le service ChromaDB pour un projet spécifique."""
    global chroma_service
    chroma_service = ChromaService(project_name)
    logging.info(f"ChromaService initialisé pour le projet : {project_name}")
    return chroma_service

def get_chroma_service():
    """Retourne l'instance actuelle du service ChromaDB."""
    return chroma_service
