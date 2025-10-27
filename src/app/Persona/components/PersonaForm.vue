<script setup>
import { reactive, watch, computed } from "vue";
import { usePersonaStore } from "../stores/personaStore";

const props = defineProps({
  personaSeleccionada: { type: Object, default: null },
});
const emit = defineEmits(["guardado"]);

const personaStore = usePersonaStore();

const form = reactive({
  id: null,
  nombres: "",
  apellidos: "",
  tipo_documento: "CC",
  documento: "",
  email: "",
  telefono: "",
});

const limpiarFormulario = () => {
  Object.assign(form, {
    id: null,
    nombres: "",
    apellidos: "",
    tipo_documento: "CC",
    documento: "",
    email: "",
    telefono: "",
  });
};

watch(
  () => props.personaSeleccionada,
  (persona) => {
    if (persona) Object.assign(form, persona);
    else limpiarFormulario();
  },
  { immediate: true }
);

const editMode = computed(() => !!form.id);

const guardar = async () => {
  if (editMode.value) {
    await personaStore.actualizarPersona(form.id, form);
  } else {
    await personaStore.crearPersona(form);
  }
  emit("guardado");
};
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">
      {{ editMode ? "Editar Persona" : "Nueva Persona" }}
    </h2>

    <form @submit.prevent="guardar" class="grid grid-cols-2 gap-4">
      <input v-model="form.nombres" placeholder="Nombres" class="input" />
      <input v-model="form.apellidos" placeholder="Apellidos" class="input" />
      <select v-model="form.tipo_documento" class="input">
        <option value="CC">Cédula</option>
        <option value="TI">Tarjeta Identidad</option>
      </select>
      <input v-model="form.documento" placeholder="Documento" class="input" />
      <input v-model="form.email" placeholder="Email" class="input" />
      <input v-model="form.telefono" placeholder="Teléfono" class="input" />

      <div class="col-span-2 flex justify-end gap-3 mt-3">
        <button
          type="button"
          @click="$emit('guardado')"
          class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-5 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:opacity-90 transition font-semibold"
        >
          {{ editMode ? "Actualizar" : "Guardar" }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.input {
  border: 1px solid #d1d5db; 
  border-radius: 0.5rem; 
  padding: 0.5rem; 
  width: 100%; 
  outline: none;
}

.input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #6366f1; 
}

</style>
