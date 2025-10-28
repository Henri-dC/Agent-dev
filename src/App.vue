<script setup></script>

<template>
  <header>
    <nav class="main-nav">
      <ul>
        <li><router-link to="/">Accueil</router-link></li>
        <li><router-link to="/chaussures">Chaussures</router-link></li>
        <li><router-link to="/vetements">Vêtements</router-link></li>
        <li><router-link to="/tapis">Tapis</router-link></li>
      </ul>
    </nav>
  </header>

  <router-view />
</template>

<style scoped>
.main-nav {
  background-color: #333;
  padding: 10px 0;
}

.main-nav ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
}

.main-nav li a {
  color: white;
  padding: 10px 15px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
  display: block; /* Make the whole area clickable */
}

.main-nav li a:hover,
.main-nav li a.router-link-exact-active {
  background-color: #575757;
  border-radius: 5px;
}
</style>
