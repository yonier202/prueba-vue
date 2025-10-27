<script setup>
import { ref, onMounted } from "vue";
import { usePersonaStore } from "../stores/personaStore";
import PersonaForm from "../components/PersonaForm.vue";
import PersonaTable from "../components/PersonaTable.vue";
import layoutComponent from "../../Factura/components/layoutComponent.vue";

const personaStore = usePersonaStore();
const showModal = ref(false);
const personaSeleccionada = ref(null);

onMounted(() => {
  personaStore.fetchPersonas();
});

const abrirModal = (persona = null) => {
  personaSeleccionada.value = persona;
  showModal.value = true;
};

const cerrarModal = async () => {
  showModal.value = false;
  personaSeleccionada.value = null;
  await personaStore.fetchPersonas();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <layoutComponent />

    <div class="max-w-7xl mx-auto p-6">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 class="text-3xl font-extrabold text-gray-800 tracking-tight">Gestión de Personas</h1>

        <button
          @click="abrirModal()"
          class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-transform hover:scale-105"
        >
          + Nueva Persona
        </button>
      </div>

      <PersonaTable @editar="abrirModal" />

      <!-- MODAL -->
      <Transition name="fade">
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
        >
          <Transition name="scale">
            <div
              v-if="showModal"
              class="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative"
            >
              <button
                @click="cerrarModal"
                class="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              >
                ✕
              </button>

              <PersonaForm
                :personaSeleccionada="personaSeleccionada"
                @guardado="cerrarModal"
              />
            </div>
          </Transition>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.scale-enter-active,
.scale-leave-active {
  transition: all 0.25s ease;
}
.scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
