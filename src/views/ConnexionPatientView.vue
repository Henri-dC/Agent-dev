<template>
  <div class="container mx-auto px-4 py-10 bg-transparent min-h-[calc(100vh-180px)] text-center">
    <h2 class="text-2xl md:text-3xl font-bold text-primary-text mb-8">Espace Patient</h2>
    <p class="text-lg text-text-medium">Ceci est une page d'exemple pour l'Espace Patient du Dr. Clara Dubois.</p>
    <p class="text-text-dark mt-4">"L'application AIWordPlace pourrait générer des pages comme celle-ci !"</p>
    <form @submit.prevent="handleLogin" class="max-w-sm mx-auto bg-white p-8 rounded-lg shadow-md mt-8">
      <div class="mb-5">
        <label for="username" class="block mb-2 font-bold text-primary-text">Nom d'utilisateur:</label>
        <input type="text" id="username" v-model="credentials.username" required class="w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-secondary-accent">
      </div>
      <div class="mb-5">
        <label for="password" class="block mb-2 font-bold text-primary-text">Mot de passe:</label>
        <input type="password" id="password" v-model="credentials.password" required class="w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-secondary-accent">
      </div>
      <button type="submit" class="py-3 px-6 rounded-lg font-bold transition-all duration-300 ease-in-out bg-button-bg hover:bg-button-hover-bg text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 block w-auto mx-auto">Se connecter</button>
      <p v-if="loginMessage" :class="{'text-green-600': loginSuccess, 'text-red-600': !loginSuccess}" class="text-center mt-4">{{ loginMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const credentials = ref({
  username: '',
  password: ''
});
const loginMessage = ref('');
const loginSuccess = ref(false);

const handleLogin = () => {
  console.log('Tentative de connexion avec:', credentials.value);
  // Simulate a successful login
  if (credentials.value.username === 'patient' && credentials.value.password === 'password') { // Placeholder credentials
    loginSuccess.value = true;
    loginMessage.value = 'Connexion réussie ! Redirection...';
    setTimeout(() => {
      router.push('/prendre-rdv'); // Redirect to appointment page after login
    }, 1500);
  } else {
    loginSuccess.value = false;
    loginMessage.value = 'Nom d\'utilisateur ou mot de passe incorrect.';
  }
};
</script>

<style scoped>
/* Styles scoped si nécessaire */
</style>
