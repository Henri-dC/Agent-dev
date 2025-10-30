<template>
  <main class="w-full">
    <!-- Hero Section -->
    <section class="flex flex-col items-center justify-center text-center py-16 sm:py-20 px-4 sm:px-6 min-h-[calc(100vh-80px)] bg-body-bg bg-opacity-90 w-full">
      <div class="max-w-4xl">
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-primary-text mb-4 sm:mb-6 leading-tight">
          Révolutionnez la <span class="text-secondary-accent">Création Web</span> avec l'IA
        </h1>
        <p class="text-base sm:text-xl md:text-2xl text-text-dark mb-8 sm:mb-10 max-w-2xl mx-auto">
          Transformez vos idées en sites Vue.js incroyables, conçus et optimisés par l'intelligence artificielle.
          Plus rapide, plus intelligent, plus intuitif.
        </p>
        <button class="px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl rounded-full bg-button-bg text-white font-semibold hover:bg-button-hover-bg transition-all duration-300 shadow-xl transform hover:scale-105">
          Découvrez la Magie <span class="ml-2">&#x27A1;</span>
        </button>
      </div>
    </section>

    <!-- About/Introduction Section -->
    <section class="w-full py-16 sm:py-20 px-4 sm:px-6 bg-section-bg bg-opacity-95 text-center">
      <div class="container mx-auto max-w-3xl">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-text mb-6 sm:mb-8">Votre Vision, Notre Intelligence</h2>
        <p class="text-base sm:text-lg text-text-medium leading-relaxed mb-6 sm:mb-8">
          Notre plateforme unique utilise la puissance de l'intelligence artificielle pour générer des applications Vue.js robustes et modernes.
          Décrivez simplement le site que vous imaginez, et laissez notre IA s'occuper du reste, de la structure du code au design réactif.
          Fini les tâches répétitives, place à la créativité et à l'efficacité.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12">
          <div class="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-card-border transform hover:scale-105 transition-transform duration-300">
            <h3 class="text-xl sm:text-2xl font-semibold text-text-dark mb-3 sm:mb-4">Développement Accéléré</h3>
            <p class="text-text-medium text-sm sm:text-base">Réduisez drastiquement le temps de développement de vos projets Vue.js. L'IA gère la complexité, vous vous concentrez sur l'innovation.</p>
          </div>
          <div class="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-card-border transform hover:scale-105 transition-transform duration-300">
            <h3 class="text-xl sm:text-2xl font-semibold text-text-dark mb-3 sm:mb-4">Qualité de Code Inégalée</h3>
            <p class="text-text-medium text-sm sm:text-base">Bénéficiez d'un code propre, optimisé et conforme aux meilleures pratiques de Vue.js, garanti par notre IA.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Product Categories Section -->
    <section class="w-full py-16 sm:py-20 px-4 sm:px-6 bg-body-bg bg-opacity-90 text-center">
      <div class="container mx-auto">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-text mb-8 sm:mb-12">Nos Catégories de Produits</h2>

        <div v-if="loadingCategories" class="text-center text-lg text-text-medium">Chargement des catégories...</div>
        <div v-else-if="errorCategories" class="text-center text-lg text-red-500">Erreur: {{ errorCategories }}</div>
        <div v-else-if="categories.length === 0" class="text-center text-lg text-text-medium">Aucune catégorie de produit trouvée avec des images.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div v-for="category in categories" :key="category.id"
               class="bg-white rounded-lg shadow-lg overflow-hidden border border-card-border
                      transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
            <router-link :to="{ name: 'products', query: { category_id: category.id } }">
              <img :src="category.image.src" :alt="category.name" class="w-full h-48 sm:h-56 md:h-64 object-cover">
              <div class="p-4 sm:p-6">
                <h3 class="text-xl sm:text-2xl font-semibold text-text-dark mb-2">{{ category.name }}</h3>
                <p class="text-text-medium text-sm sm:text-base">{{ category.count }} produits</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="w-full py-16 sm:py-20 px-4 sm:px-6 bg-body-bg bg-opacity-90 text-center">
      <div class="container mx-auto">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-text mb-8 sm:mb-12">Fonctionnalités Clés</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
          <div class="feature-card p-6 sm:p-8 rounded-lg shadow-xl border border-card-border bg-white transform hover:translate-y-[-5px] transition-transform duration-300">
            <div class="text-3xl sm:text-4xl md:text-5xl text-secondary-accent mb-3 sm:mb-4">💡</div>
            <h3 class="text-xl sm:text-2xl font-semibold text-text-dark mb-2 sm:mb-3">Génération Intelligente</h3>
            <p class="text-text-medium text-sm sm:text-base">Décrivez vos besoins, l'IA écrit le code Vue.js pour vous.</p>
          </div>
          <div class="feature-card p-6 sm:p-8 rounded-lg shadow-xl border border-card-border bg-white transform hover:translate-y-[-5px] transition-transform duration-300">
            <div class="text-3xl sm:text-4xl md:text-5xl text-secondary-accent mb-3 sm:mb-4">⚡</div>
            <h3 class="text-xl sm:text-2xl font-semibold text-text-dark mb-2 sm:mb-3">Optimisation en Temps Réel</h3>
            <p class="text-text-medium text-sm sm:text-base">Des performances maximales grâce à l'optimisation continue de l'IA.</p>
          </div>
          <div class="feature-card p-6 sm:p-8 rounded-lg shadow-xl border border-card-border bg-white transform hover:translate-y-[-5px] transition-transform duration-300">
            <div class="text-3xl sm:text-4xl md:text-5xl text-secondary-accent mb-3 sm:mb-4">🎨</div>
            <h3 class="text-xl sm:text-2xl font-semibold text-text-dark mb-2 sm:mb-3">Design Adaptatif</h3>
            <p class="text-text-medium text-sm sm:text-base">Des interfaces élégantes et réactives, parfaitement adaptées à tous les écrans.</p>
          </div>
          <div class="feature-card p-6 sm:p-8 rounded-lg shadow-xl border border-card-border bg-white transform hover:translate-y-[-5px] transition-transform duration-300">
            <div class="text-3xl sm:text-4xl md:text-5xl text-secondary-accent mb-3 sm:mb-4">🚀</div>
            <h3 class="text-xl sm:text-2xl font-semibold text-text-dark mb-2 sm:mb-3">Déploiement Simplifié</h3>
            <p class="text-text-medium text-sm sm:text-base">Mettez votre site en ligne en quelques clics, sans tracas techniques.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="w-full py-16 sm:py-20 px-4 sm:px-6 bg-section-bg bg-opacity-95 text-center">
      <div class="container mx-auto max-w-4xl">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-text mb-8 sm:mb-12">Comment ça Marche ?</h2>
        <div class="grid grid-cols-1 gap-8 sm:gap-12 text-left">
          <div class="flex flex-col md:flex-row items-center bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-card-border group transform hover:scale-102 transition-transform duration-300">
            <div class="flex-shrink-0 text-4xl sm:text-5xl md:text-6xl text-button-bg font-extrabold mr-4 md:mr-8 opacity-75 group-hover:opacity-100 transition-opacity duration-300 mb-4 md:mb-0">1.</div>
            <div>
              <h3 class="text-xl sm:text-2xl md:text-3xl font-semibold text-text-dark mb-2 sm:mb-3">Décrivez Votre Projet</h3>
              <p class="text-base sm:text-lg text-text-medium">Utilisez notre interface intuitive pour décrire les fonctionnalités et le style de votre site Vue.js. L'IA écoute attentivement vos besoins.</p>
            </div>
          </div>
          <div class="flex flex-col md:flex-row items-center bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-card-border group transform hover:scale-102 transition-transform duration-300">
            <div class="flex-shrink-0 text-4xl sm:text-5xl md:text-6xl text-button-bg font-extrabold mr-4 md:mr-8 opacity-75 group-hover:opacity-100 transition-opacity duration-300 mb-4 md:mb-0">2.</div>
            <div>
              <h3 class="text-xl sm:text-2xl md:text-3xl font-semibold text-text-dark mb-2 sm:mb-3">L'IA Génère le Code</h3>
              <p class="text-base sm:text-lg text-text-medium">En quelques instants, notre IA génère un code Vue.js propre, optimisé et prêt à l'emploi, basé sur vos spécifications.</p>
            </div>
          </div>
          <div class="flex flex-col md:flex-row items-center bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-card-border group transform hover:scale-102 transition-transform duration-300">
            <div class="flex-shrink-0 text-4xl sm:text-5xl md:text-6xl text-button-bg font-extrabold mr-4 md:mr-8 opacity-75 group-hover:opacity-100 transition-opacity duration-300 mb-4 md:mb-0">3.</div>
            <div>
              <h3 class="text-xl sm:text-2xl md:text-3xl font-semibold text-text-dark mb-2 sm:mb-3">Personnalisez & Affinez</h3>
              <p class="text-base sm:text-lg text-text-medium">Accédez à notre éditeur visuel pour peaufiner le design, ajouter du contenu et ajuster les détails. L'IA vous assiste à chaque étape.</p>
            </div>
          </div>
          <div class="flex flex-col md:flex-row items-center bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-card-border group transform hover:scale-102 transition-transform duration-300">
            <div class="flex-shrink-0 text-4xl sm:text-5xl md:text-6xl text-button-bg font-extrabold mr-4 md:mr-8 opacity-75 group-hover:opacity-100 transition-opacity duration-300 mb-4 md:mb-0">4.</div>
            <div>
              <h3 class="text-xl sm:text-2xl md:text-3xl font-semibold text-text-dark mb-2 sm:mb-3">Lancez Votre Site !</h3>
              <p class="text-base sm:text-lg text-text-medium">Votre site est prêt à être publié ! Bénéficiez d'un déploiement rapide et sécurisé pour que vos clients puissent l'admirer.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final Call to Action Section -->
    <section id="cta" class="w-full py-16 sm:py-20 px-4 sm:px-6 bg-body-bg bg-opacity-90 text-center">
      <div class="container mx-auto max-w-3xl">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-text mb-6 sm:mb-8">Prêt à Transformer vos Idées en Réalité ?</h2>
        <p class="text-base sm:text-lg text-text-dark mb-8 sm:mb-10">
          N'attendez plus ! Libérez le potentiel de l'IA pour créer des expériences web uniques et performantes.
        </p>
        <button class="px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl md:text-2xl rounded-full bg-secondary-accent text-white font-bold hover:bg-button-hover-bg transition-all duration-300 shadow-xl transform hover:scale-105">
          Contactez-nous pour une Démo Personnalisée
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'; // Added watch import

const categories = ref([]);
const loadingCategories = ref(true);
const errorCategories = ref(null);

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/product-categories?per_page=6'); // Fetch a few categories
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Filter categories that have an image and a non-zero count
    categories.value = data.filter(cat => cat.image && cat.image.src && cat.count > 0);
  } catch (e) {
    console.error("Error fetching product categories:", e);
    errorCategories.value = e.message;
  } finally {
    loadingCategories.value = false;
  }
});
</script>

<style scoped>
/* Aucun style spécifique nécessaire car Tailwind CSS est utilisé */
</style>
