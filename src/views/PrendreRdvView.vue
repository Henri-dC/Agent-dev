<template>
  <div class="page-content container mx-auto px-4 py-10 bg-body-bg min-h-[calc(100vh-180px)]">
    <h2 class="text-2xl md:text-3xl font-bold text-primary-text mb-8 text-center">Prendre Rendez-vous</h2>
    <p class="text-lg text-text-medium text-center max-w-3xl mx-auto mb-10">Utilisez le formulaire ci-dessous pour choisir une date et une heure pour votre consultation.</p>

    <form @submit.prevent="handleSubmit" class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mb-12">
      <div class="mb-5">
        <label for="rdv-date" class="block mb-2 font-bold text-primary-text">Date souhaitée :</label>
        <input type="date" id="rdv-date" v-model="formData.date" required class="w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-secondary-accent">
      </div>
      <div class="mb-5">
        <label for="rdv-time" class="block mb-2 font-bold text-primary-text">Heure souhaitée :</label>
        <input type="time" id="rdv-time" v-model="formData.time" required class="w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-secondary-accent">
      </div>
      <div class="mb-5">
        <label for="rdv-reason" class="block mb-2 font-bold text-primary-text">Motif du rendez-vous :</label>
        <textarea id="rdv-reason" v-model="formData.reason" rows="4" placeholder="Ex: Première consultation, suivi, anxiété, etc." required class="w-full p-3 border border-gray-300 rounded-md text-base resize-y focus:outline-none focus:ring-2 focus:ring-secondary-accent"></textarea>
      </div>
      <button type="submit" class="py-3 px-6 rounded-lg font-bold transition-all duration-300 ease-in-out bg-button-bg hover:bg-button-hover-bg text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 block w-auto mx-auto">Confirmer le rendez-vous</button>
      <p v-if="message" :class="{'text-green-600': isSuccess, 'text-red-600': !isSuccess}" class="text-center mt-4">{{ message }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({
  date: '',
  time: '',
  reason: ''
});
const message = ref('');
const isSuccess = ref(false);

const handleSubmit = () => {
  // Logic to send appointment data to backend (e.g., via fetch or axios)
  console.log('Rendez-vous soumis:', formData.value);
  isSuccess.value = true;
  message.value = 'Votre demande de rendez-vous a été envoyée. Nous vous recontacterons bientôt pour confirmer.';
  // Simulate API call
  setTimeout(() => {
    formData.value.date = '';
    formData.value.time = '';
    formData.value.reason = '';
    // message.value = ''; // Optionally clear message after some time
  }, 3000);
};
</script>

<style scoped>
/* Aucun style spécifique nécessaire car Tailwind CSS est utilisé */
</style>