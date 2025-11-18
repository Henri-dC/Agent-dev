# interroger_chroma.py

import chromadb
import sys
import os

# --- Configuration ---
# Assurez-vous que ce chemin est correct pour votre base de données locale
CHROMA_PATH = "./claude" 
COLLECTION_NAME = "project_files"
N_RESULTS = 3

def interroger_db(requete: str):
    """Effectue une recherche dans la base de données Chroma."""
    try:
        # 1. Connexion à la base de données persistante
        client = chromadb.PersistentClient(path=CHROMA_PATH)
    except Exception as e:
        print(f"Erreur de connexion à ChromaDB: {e}")
        return

    try:
        # 2. Accès à la collection
        collection = client.get_collection(name=COLLECTION_NAME)
    except Exception as e:
        print(f"Erreur: La collection '{COLLECTION_NAME}' n'existe pas ou n'est pas accessible. {e}")
        return

    # 3. Effectuer la requête
    print(f"Interrogation de la collection '{COLLECTION_NAME}'...")
    resultats = collection.query(
        query_texts=[requete],
        n_results=N_RESULTS
    )

    # 4. Afficher les résultats
    print(f"\n--- Top {N_RESULTS} Résultats pour la requête : '{requete}' ---")
    
    # Extraction des données pour une seule requête
    documents = resultats.get('documents')[0]
    metadatas = resultats.get('metadatas')[0]
    distances = resultats.get('distances')[0]

    if not documents:
        print("Aucun résultat trouvé.")
        return

    for i, doc in enumerate(documents):
        source = metadatas[i].get('source', 'N/A')
        distance = distances[i]
        
        print(f"\n# {i+1} (Distance Cosinus: {distance:.4f} | Source: {source})")
        # Affiche le début du document trouvé
        print("Contenu: " + doc[:300].replace('\n', ' ') + "...") 

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"Usage: python {os.path.basename(sys.argv[0])} \"Votre question ici\"")
    else:
        # La requête est passée en argument de la ligne de commande
        user_query = " ".join(sys.argv[1:])
        interroger_db(user_query)