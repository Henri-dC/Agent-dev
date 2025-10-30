<template>
  <div class="page-content container mx-auto px-4 py-10 bg-transparent min-h-[calc(100vh-180px)]">
    <h2 class="text-2xl md:text-3xl font-bold text-primary-text mb-8 text-center">Mes Services et Accompagnements</h2>
    <p class="text-lg text-text-medium text-center max-w-3xl mx-auto mb-10">Je propose un accompagnement psychothérapeutique personnalisé pour les adultes et les adolescents, adapté à vos besoins et à votre situation.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
      <div class="bg-white border border-card-border rounded-lg p-8 shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl">
        <h3 class="text-xl font-semibold text-primary-text mb-4">Thérapie Individuelle</h3>
        <p class="text-text-medium mb-4">Espace de parole confidentiel pour explorer vos difficultés, développer une meilleure connaissance de soi et trouver des solutions.</p>
        <ul class="list-none p-0 m-0 space-y-2">
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Gestion de l'anxiété et du stress</li>
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Dépression, burn-out</li>
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Estime de soi et confiance en soi</li>
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Gestion des émotions</li>
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Traumatismes, deuil</li>
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Transition de vie, questionnement existentiel</li>
        </ul>
      </div>
      <div class="bg-white border border-card-border rounded-lg p-8 shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl">
        <h3 class="text-xl font-semibold text-primary-text mb-4">Thérapie de Couple</h3>
        <p class="text-text-medium mb-4">Accompagnement des couples traversant des difficultés relationnelles pour améliorer la communication et renforcer le lien.</p>
        <ul class="list-none p-0 m-0 space-y-2">
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Problèmes de communication</li>
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Conflits récurrents</li>
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Crises conjugales (infidélité, jalousie)</li>
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Problématiques sexuelles</li>
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Accompagnement à la séparation</li>
        </ul>
      </div>
      <div class="bg-white border border-card-border rounded-lg p-8 shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl">
        <h3 class="text-xl font-semibold text-primary-text mb-4">Thérapie Familiale</h3>
        <p class="text-text-medium mb-4">Soutien aux familles pour mieux comprendre les dynamiques interpersonnelles et apaiser les tensions.</p>
        <ul class="list-none p-0 m-0 space-y-2">
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Conflits parents-enfants/adolescents</li>
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Difficultés de communication familiale</li>
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Gestion des crises familiales</li>
          <li class="flex items-center text-text-dark before:content-[''] before:w-4 before:h-4 before:bg-button-bg before:rounded-full before:inline-block before:mr-2">Familles recomposées</li>
        </ul>
      </div>
    </div>

    <div class="bg-section-bg text-center p-12 rounded-lg mt-12">
      <h2 class="text-2xl md:text-3xl font-bold text-primary-text mb-4">Des questions sur le type de thérapie adapté à votre situation ?</h2>
      <router-link to="/contact-doc" class="py-3 px-6 rounded-lg font-bold transition-all duration-300 ease-in-out bg-button-bg hover:bg-button-hover-bg text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 inline-block">Contactez-moi</router-link>
    </div>
  </div>
</template>

<script setup>
// Pas de logique spécifique nécessaire pour cette vue Services
</script>

<style scoped>
/* Aucun style spécifique nécessaire car Tailwind CSS est utilisé */
</style>
