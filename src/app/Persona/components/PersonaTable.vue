<script setup>
import { ref, computed } from "vue";
import { usePersonaStore } from "../stores/personaStore";

const emit = defineEmits(["editar"]);
const personaStore = usePersonaStore();

const search = ref("");
const filtered = computed(() =>
  personaStore.personas.filter((p) =>
    `${p.nombres} ${p.apellidos} ${p.email} ${p.documento}`
      .toLowerCase()
      .includes(search.value.toLowerCase())
  )
);
</script>

<template>
  <div class="bg-white rounded-2xl shadow-md p-5">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-800">Lista de Personas</h2>
      <input
        v-model="search"
        type="text"
        placeholder="Buscar..."
        class="border rounded-lg p-2 w-64 focus:ring-2 focus:ring-indigo-500"
      />
    </div>

    <div v-if="personaStore.loading" class="text-center py-6 text-gray-500">
      Cargando personas...
    </div>

    <table v-else class="w-full border-collapse text-sm sm:text-base">
      <thead class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
        <tr>
          <th class="text-left p-3">Nombre</th>
          <th class="text-left p-3">Documento</th>
          <th class="text-left p-3">Email</th>
          <th class="text-left p-3">Teléfono</th>
          <th class="text-center p-3">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="p in filtered"
          :key="p.id"
          class="border-b hover:bg-gray-50 transition"
        >
          <td class="p-3">{{ p.nombres }} {{ p.apellidos }}</td>
          <td class="p-3">{{ p.tipo_documento }} {{ p.documento }}</td>
          <td class="p-3">{{ p.email }}</td>
          <td class="p-3">{{ p.telefono }}</td>
          <td class="p-3 text-center space-x-2">
            <button
              class="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-md hover:bg-indigo-200 transition"
              @click="emit('editar', p)"
            >
              Editar
            </button>
            <button
              class="bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-200 transition"
              @click="personaStore.eliminarPersona(p.id)"
            >
              Eliminar
            </button>
          </td>
        </tr>

        <tr v-if="!filtered.length">
          <td colspan="5" class="text-center p-4 text-gray-500">
            No hay resultados
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
