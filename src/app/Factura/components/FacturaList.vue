<script setup>
import { ref, computed, onMounted } from "vue";
import { useFacturacionStore } from "../stores/facturacionStore";
import Swal from "sweetalert2";

const facturaStore = useFacturacionStore();
const emit = defineEmits(["editarFactura"]);

const buscar = ref("");
const pagina = ref(1);
const porPagina = 5;

onMounted(() => {
  facturaStore.fetchFacturas();
});

/**
 * Filtra las facturas según el término de búsqueda
 * Busca en número de factura, descripción y nombre del cliente
 */
const facturasFiltradas = computed(() => {
  const query = buscar.value.toLowerCase();
  return facturaStore.facturas.filter(
    (f) =>
      f.numero_factura.toLowerCase().includes(query) ||
      f.descripcion.toLowerCase().includes(query) ||
      (f.persona?.nombres?.toLowerCase() || "").includes(query)
  );
});

/**
 * Calcula el total de páginas necesarias para mostrar todas las facturas filtradas
 */
const totalPaginas = computed(() =>
  Math.ceil(facturasFiltradas.value.length / porPagina)
);

/**
 * Obtiene solo las facturas correspondientes a la página actual
 * Implementa paginación del lado del cliente
 */
const facturasPaginadas = computed(() => {
  const start = (pagina.value - 1) * porPagina;
  return facturasFiltradas.value.slice(start, start + porPagina);
});

const cambiarPagina = (nueva) => {
  if (nueva >= 1 && nueva <= totalPaginas.value) pagina.value = nueva;
};

/**
 * Elimina una factura con confirmación
 * Muestra un diálogo de confirmación antes de proceder con la eliminación
 * @param {Number} id - ID de la factura a eliminar
 */
const eliminarFactura = async (id) => {

  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará la factura permanentemente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
  });

  if (result.isConfirmed) {
    await facturaStore.eliminarFactura(id);
  }
};

const editarFactura = (factura) => {
  emit("editarFactura", factura);
};
</script>

<template>
  <div class="p-6 min-h-screen">
    <div class="bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">Facturas</h2>
      </div>

      <div class="mb-4">
        <input
          v-model="buscar"
          type="text"
          placeholder="Buscar por número, descripción o cliente..."
          class="input"
        />
      </div>

      <div v-if="facturaStore.loading" class="text-center py-6 text-gray-700">
        Cargando facturas...
      </div>

      <div v-else-if="facturasPaginadas.length > 0" class="overflow-x-auto">
        <table class="min-w-full text-sm text-left border border-gray-200 rounded-lg">
          <thead class="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 text-gray-700 uppercase text-xs">
            <tr>
              <th class="p-3">#</th>
              <th class="p-3">Cliente</th>
              <th class="p-3">N° Factura</th>
              <th class="p-3">Descripción</th>
              <th class="p-3">Monto Total</th>
              <th class="p-3">Estado</th>
              <th class="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(factura, i) in facturasPaginadas"
              :key="factura.id"
              class="border-t hover:bg-gradient-to-r hover:from-indigo-50 hover:via-purple-50 hover:to-pink-50 transition"
            >
              <td class="p-3">{{ (pagina - 1) * porPagina + i + 1 }}</td>
              <td class="p-3">{{ factura.persona?.nombres }} {{ factura.persona?.apellidos }}</td>
              <td class="p-3 font-medium text-gray-800">{{ factura.numero_factura }}</td>
              <td class="p-3 text-gray-600 truncate">{{ factura.descripcion }}</td>
              <td class="p-3 font-semibold text-green-600">${{ factura.monto_total }}</td>
              <td class="p-3">
                <span
                  :class="{
                    'bg-yellow-100 text-yellow-800 px-2 py-1 rounded': factura.estado === 'pendiente',
                    'bg-green-100 text-green-800 px-2 py-1 rounded': factura.estado === 'pagada',
                    'bg-red-100 text-red-800 px-2 py-1 rounded': factura.estado === 'vencida',
                  }"
                >
                  {{ factura.estado }}
                </span>
              </td>
              <td class="p-3 flex gap-2 justify-center">
                <button @click="editarFactura(factura)" class="btn-secondary">Editar</button>
                <button @click="eliminarFactura(factura.id)" class="btn-danger">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-6 text-gray-700">No se encontraron facturas.</div>

      <!-- Paginación -->
      <div v-if="totalPaginas > 1" class="flex justify-center items-center mt-6 gap-2">
        <button @click="cambiarPagina(pagina - 1)" :disabled="pagina === 1" class="btn-pagination">◀</button>
        <span class="text-gray-700 text-sm">Página {{ pagina }} de {{ totalPaginas }}</span>
        <button @click="cambiarPagina(pagina + 1)" :disabled="pagina === totalPaginas" class="btn-pagination">▶</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input {
  border: 1px solid #d1d5db; 
  border-radius: 0.5rem; 
  padding: 0.5rem; 
  width: 100%; 
  background-color: rgba(255, 255, 255, 0.9); 
  outline: none; 
  transition: all 0.2s ease-in-out; 
}

.input:focus {
  box-shadow: 0 0 0 2px #f472b6; 
}

/* Botón secundario */
.btn-secondary {
  background: linear-gradient(to right, #e0e7ff, #f3e8ff, #fce7f3); 
  color: #4338ca; 
  font-weight: 500; 
  padding: 0.25rem 0.75rem; 
  border-radius: 0.375rem; 
  transition: opacity 0.2s ease-in-out; 
}

.btn-secondary:hover {
  opacity: 0.8; 
}

.btn-danger {
  background: linear-gradient(to right, #fee2e2, #fbcfe8, #ffe4e6); 
  font-weight: 500; 
  padding: 0.25rem 0.75rem; 
  border-radius: 0.375rem; 
  transition: opacity 0.2s ease-in-out; 
}

.btn-danger:hover {
  opacity: 0.8; 
}


.btn-pagination {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem; 
  border: 1px solid #d1d5db; 
  background-color: rgba(255, 255, 255, 0.7); 
  color: #374151; 
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); 
  transition: all 0.2s ease-in-out; 
}

.btn-pagination:hover {
  background-color: #ffffff; 
}

.btn-pagination:disabled {
  opacity: 0.5; 
  cursor: not-allowed;
}

</style>

