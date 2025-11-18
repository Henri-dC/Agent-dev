import chromadb
import os

# --- Configuration ---
# Assurez-vous que ce chemin est correct (le dossier qui contient les fichiers binaires)
CHROMA_PATH = "./claude" 

def lister_collections():
    """Se connecte à la base de données ChromaDB et liste toutes les collections."""
    print(f"Tentative de connexion à la base de données à l'emplacement: {CHROMA_PATH}")

    if not os.path.exists(CHROMA_PATH):
        print(f"⚠️ Erreur: Le dossier '{CHROMA_PATH}' n'existe pas ou le chemin est incorrect.")
        return

    try:
        # 1. Connexion au client
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        
        # 2. Liste de toutes les collections
        collections = client.list_collections()
        
        # 3. Affichage des résultats
        print("\n✅ Collections trouvées :")
        if collections:
            for i, collection in enumerate(collections):
                # Chaque élément est un objet Collection
                print(f"   {i+1}. Nom: **{collection.name}**")
        else:
            print("   Aucune collection trouvée dans cette base de données.")
            
    except Exception as e:
        print(f"❌ Une erreur s'est produite lors de la connexion ou de la liste des collections : {e}")

if __name__ == "__main__":
    lister_collections()