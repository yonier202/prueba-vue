<script setup>
import { ref, reactive, computed, watch, nextTick } from "vue";
import { usePersonaStore } from "../../Persona/stores/personaStore";
import { useFacturacionStore } from "../stores/facturacionStore";

const personaStore = usePersonaStore();
const facturaStore = useFacturacionStore();

const props = defineProps({
  factura: { type: Object, default: null },
});
const emit = defineEmits(["close"]);

const tipo_documento = ref("CC");
const numero_documento = ref("");
const cargando = ref(false);

const form = reactive({
  id: null,
  persona_id: null,
  numero_factura: "",
  descripcion: "",
  fecha_emision: "",
  fecha_vencimiento: "",
  estado: "pendiente",
  archivo_adjunto: null,
  items: [{ nombre: "", cantidad: '', iva: '', precio_unitario: '' }],
});

/**
 * Resetea el formulario a sus valores iniciales
 * Limpia todos los campos y reestablece la persona encontrada
 */
const resetForm = () => {
  Object.assign(form, {
    id: null,
    persona_id: null,
    numero_factura: "",
    descripcion: "",
    fecha_emision: "",
    fecha_vencimiento: "",
    estado: "pendiente",
    archivo_adjunto: null,
    items: [{ nombre: "", cantidad: '', iva: '', precio_unitario: '' }],
  });
  tipo_documento.value = "CC";
  numero_documento.value = "";
  personaStore.personaEncontrada = null;
};

/**
 * Observa cambios en la factura recibida por props
 * Carga los datos de la factura en el formulario cuando se edita
 * @param {Object} factura - La factura a editar o null para nuevo formulario
 */
watch(
  () => props.factura,
  async (factura) => {
    await nextTick(); // evita que dispare guardar antes de tiempo
    if (factura) {
      form.id = factura.id;
      form.persona_id = factura.persona_id;
      form.numero_factura = factura.numero_factura;
      form.descripcion = factura.descripcion;
      form.fecha_emision = factura.fecha_emision;
      form.fecha_vencimiento = factura.fecha_vencimiento;
      form.estado = factura.estado;
      form.items = factura.items?.length
        ? factura.items.map((i) => ({
            nombre: i.nombre,
            cantidad: i.cantidad,
            iva: i.iva,
            precio_unitario: i.precio_unitario,
          }))
        : [{ nombre: "", cantidad: 1, iva: 19, precio_unitario: 0 }];

      personaStore.personaEncontrada = factura.persona || null;
      tipo_documento.value = factura.persona?.tipo_documento || "CC";
      numero_documento.value = factura.persona?.numero_documento || "";
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

/**
 * Calcula el monto total de la factura
 * Suma todos los ítems con sus respectivos IVAs
 * @returns {Number} Monto total de la factura
 */
const monto_total = computed(() =>
  form.items.reduce((total, item) => {
    const subtotal = item.cantidad * item.precio_unitario;
    const iva = subtotal * (item.iva / 100);
    return total + subtotal + iva;
  }, 0)
);

const onFileChange = (e) => {
  form.archivo_adjunto = e.target.files[0];
};

const addItem = () => {
  form.items.push({ nombre: "", cantidad: 1, iva: 19, precio_unitario: 0 });
};

const eliminarItem = (index) => {
  form.items.splice(index, 1);
};

/**
 * Busca una persona por tipo y número de documento
 * Actualiza el formulario con los datos de la persona encontrada
 */
const buscarPersona = async () => {
  await personaStore.buscarPersona(tipo_documento.value, numero_documento.value);
  if (personaStore.personaEncontrada) {
    form.persona_id = personaStore.personaEncontrada.id;
  }
};

/**
 * Guarda o actualiza la factura según corresponda
 * Valida que exista una persona asociada, prepara el FormData con todos los datos
 * incluyendo items y archivo adjunto, y gestiona los errores de validación
 */
const guardarFactura = async () => {
  if (!form.persona_id) {
    alert("Primero debes buscar y seleccionar una persona.");
    return;
  }

  cargando.value = true;

  const formData = new FormData();

  if (form.id) {
    formData.append("_method", "PUT");
  }

  formData.append("persona_id", form.persona_id ?? "");
  formData.append("numero_factura", form.numero_factura ?? "");
  formData.append("descripcion", form.descripcion ?? "");
  formData.append("fecha_emision", form.fecha_emision ?? "");
  formData.append("fecha_vencimiento", form.fecha_vencimiento ?? "");
  formData.append("estado", form.estado ?? "pendiente");
  formData.append("monto_total", monto_total.value ?? 0);

  if (form.archivo_adjunto instanceof File) {
    formData.append("archivo_adjunto", form.archivo_adjunto);
  }

  form.items.forEach((item, i) => {
    formData.append(`items[${i}][nombre]`, item.nombre ?? "");
    formData.append(`items[${i}][cantidad]`, item.cantidad ?? 1);
    formData.append(`items[${i}][iva]`, item.iva ?? 0);
    formData.append(`items[${i}][precio_unitario]`, item.precio_unitario ?? 0);
  });

  try {
    if (form.id) {
      await facturaStore.actualizarFactura(form.id, formData);
    } else {
      await facturaStore.crearFactura(formData);
    }

    emit("close");
    resetForm();
  } catch (error) {
    console.error("Error al guardar factura:", error);
    if (error.response?.data?.errors) {
      const campos = Object.keys(error.response.data.errors);
      alert(`Campos faltantes o inválidos: ${campos.join(", ")}`);
    }
  } finally {
    cargando.value = false;
  }
};

</script>


<template>
  <div class=" min-h-screen flex flex-col items-center py-10">
    <div class="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-8 w-full max-w-4xl space-y-6 border border-white/30">
      <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        {{ form.id ? "Editar Factura" : "Crear Factura" }}
      </h2>

      <!-- Búsqueda de persona -->
      <div class="grid grid-cols-3 gap-3 items-end">
        <div>
          <label class="label">Tipo Documento</label>
          <select v-model="tipo_documento" class="input">
            <option value="CC">Cédula</option>
            <option value="TI">Tarjeta Identidad</option>
          </select>
        </div>
        <div>
          <label class="label">Número Documento</label>
          <input v-model="numero_documento" placeholder="Número Documento" class="input" />
        </div>
        <button
          @click="buscarPersona"
          class="btn-primary"
        >
          Buscar Persona
        </button>
      </div>

      <!-- Persona encontrada -->
      <div
        v-if="personaStore.personaEncontrada"
        class="bg-gradient-to-r from-green-50 to-green-100 border border-green-300 p-4 rounded-lg shadow-inner"
      >
        <p class="text-gray-800">
          <strong>Cliente:</strong> {{ personaStore.personaEncontrada.nombres }} {{ personaStore.personaEncontrada.apellidos }}
        </p>
        <p class="text-gray-800"><strong>Email:</strong> {{ personaStore.personaEncontrada.email }}</p>
      </div>

      <!-- Formulario -->
      <form
        v-if="personaStore.personaEncontrada"
        @submit.prevent="guardarFactura"
        class="space-y-5"
      >
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Número de Factura</label>
            <input v-model="form.numero_factura" placeholder="Número de Factura" class="input" />
          </div>
          <div>
            <label class="label">Estado</label>
            <select v-model="form.estado" class="input">
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="vencida">Vencida</option>
            </select>
          </div>
        </div>

        <div>
          <label class="label">Descripción</label>
          <textarea v-model="form.descripcion" placeholder="Descripción de la factura" class="input h-24"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Fecha de Emisión</label>
            <input type="date" v-model="form.fecha_emision" class="input" />
          </div>
          <div>
            <label class="label">Fecha de Vencimiento</label>
            <input type="date" v-model="form.fecha_vencimiento" class="input" />
          </div>
        </div>

        <div>
          <label class="label">Archivo Adjunto</label>
          <input type="file" @change="onFileChange" class="input" />
          <div v-if="props.factura?.archivo_adjunto" class="mt-2">
            <a
              :href="props.factura.archivo_adjunto"
              target="_blank"
              class="text-indigo-600 underline"
            >
              Ver archivo actual
            </a>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="font-semibold text-lg text-gray-800 mb-2">Ítems</h3>
          <div
            v-for="(item, index) in form.items"
            :key="index"
            class="grid grid-cols-5 gap-3 mb-2 bg-white/70 p-3 rounded-lg border border-gray-200"
          >
            <input v-model="item.nombre" placeholder="Nombre" class="input" />
            <input v-model="item.cantidad" type="number" min="1" placeholder="Cantidad" class="input" />
            <input v-model="item.precio_unitario" type="number" min="0" placeholder="Precio" class="input" />
            <input v-model="item.iva" type="number" min="0" placeholder="IVA (%)" class="input" />
            <button
              type="button"
              @click="eliminarItem(index)"
              class="bg-gradient-to-r from-red-400 to-red-500 text-white font-semibold rounded-lg text-sm shadow-md"
            >
              ✕
            </button>
          </div>

          <button
            @click.prevent="addItem"
            class="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 hover:from-indigo-200 hover:to-pink-200 text-gray-800 rounded-lg px-4 py-1 font-medium shadow-sm"
          >
            + Añadir Ítem
          </button>
        </div>

        <div class="text-right mt-4">
          <p class="text-lg font-semibold text-gray-800">
            Total: <span class="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700">${{ monto_total.toFixed(2) }}</span>
          </p>
        </div>

        <div class="text-center">
          <button
            type="submit"
            class="btn-primary"
          >
            {{ form.id ? "Actualizar Factura" : "Guardar Factura" }}
          </button>
        </div>
      </form>
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

.label {
  font-weight: 500; 
  font-size: 0.875rem; 
  color: #374151; 
}

.btn-primary {
  background: linear-gradient(to right, #4f46e5, #9333ea, #ec4899); 
  color: #fff; 
  font-weight: 600; 
  border-radius: 0.5rem; 
  padding: 0.5rem 1.25rem; 
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -4px rgba(0, 0, 0, 0.1); 
  transition: opacity 0.2s ease-in-out; 
}

.btn-primary:hover {
  opacity: 0.9; 
}

</style>
