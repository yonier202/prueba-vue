<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { RouterLink, useRouter } from 'vue-router';

const nombre = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    authStore.error = "Las contraseñas no coinciden";
    return;
  }

  await authStore.register({
    name: nombre.value,
    email: email.value,
    password: password.value,
  });

  if (!authStore.error) {
    router.push({ name: 'facturacion' });
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">Crear Cuenta</h2>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label class="block text-gray-700 mb-1 font-medium">Nombre completo</label>
          <input
            v-model="nombre"
            type="text"
            placeholder="Tu nombre"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label class="block text-gray-700 mb-1 font-medium">Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            placeholder="tu@correo.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label class="block text-gray-700 mb-1 font-medium">Contraseña</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label class="block text-gray-700 mb-1 font-medium">Confirmar contraseña</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition duration-300"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? "Creando cuenta..." : "Registrarse" }}
        </button>

        <p v-if="authStore.error" class="text-center text-red-500 font-medium mt-2">
          {{ authStore.error }}
        </p>
      </form>

      <p class="text-center text-gray-600 mt-6">
        ¿Ya tienes una cuenta?
        <RouterLink :to="{ name: 'login' }" class="text-indigo-600 hover:underline">Inicia sesión</RouterLink>
      </p>
    </div>
  </div>
</template>
