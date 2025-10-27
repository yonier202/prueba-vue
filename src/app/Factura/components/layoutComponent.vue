<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../Auth/stores/authStore'

const authStore = useAuthStore()
const isOpen = ref(false)

const isAdmin = computed(() => authStore.user?.roles === 'admin')

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const logout = () => {
  authStore.logout()
}

onMounted(() => {
  isAdmin.value = authStore.user?.roles === 'admin'
})

</script>

<template>
  <header class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- LOGO -->
        <RouterLink
          :to="{ name: 'facturacion' }"
          class="flex items-center space-x-2 text-white font-bold text-2xl"
        >
          <div class="bg-white/20 rounded-full p-2 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke-width="2" stroke="currentColor" class="w-6 h-6 text-white">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 10h11M9 21V3m4 18h8m0-18h-8m8 9h-8" />
            </svg>
          </div>
          <span class="tracking-wide">Facturación</span>
        </RouterLink>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-8 text-white font-medium">
          <RouterLink
            :to="{ name: 'facturacion' }"
            class="hover:text-yellow-300 transition"
            active-class="text-yellow-300"
          >
            Facturación
          </RouterLink>

          <template v-if="isAdmin">
            <RouterLink
              :to="{ name: 'personas' }"
              class="hover:text-yellow-300 transition"
              active-class="text-yellow-300"
            >
              Personas
            </RouterLink>
          </template>

          <button
            @click="logout"
            class="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-lg transition font-semibold"
          >
            Cerrar sesión
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="toggleMenu"
          class="md:hidden text-white focus:outline-none"
        >
          <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 -translate-y-3"
    >
      <div
        v-if="isOpen"
        class="md:hidden bg-white/95 backdrop-blur-sm text-gray-800 shadow-lg rounded-b-2xl px-6 py-4 space-y-3"
      >
        <RouterLink
          :to="{ name: 'facturacion' }"
          class="block font-semibold hover:text-indigo-600 transition"
          @click="toggleMenu"
        >
          Facturación
        </RouterLink>

        <template v-if="isAdmin">
          <RouterLink
            :to="{ name: 'personas' }"
            class="block font-semibold hover:text-indigo-600 transition"
            @click="toggleMenu"
          >
            Personas
          </RouterLink>
        </template>

        <button
          @click="logout"
          class="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </transition>
  </header>
</template>
