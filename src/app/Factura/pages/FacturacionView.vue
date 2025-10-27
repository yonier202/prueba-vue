<script setup>
import { ref } from "vue";
import FacturaList from "../components/FacturaList.vue";
import FacturaForm from "../components/FacturaForm.vue";
import LayoutComponent from "../components/layoutComponent.vue";

const facturaSeleccionada = ref(null);

const seleccionarFactura = (factura) => {
  facturaSeleccionada.value = factura;
};

const cerrarFormulario = () => {
  facturaSeleccionada.value = null;
};
</script>

<template>
  <div>
    <LayoutComponent />
  </div>

  <div class="flex flex-col lg:flex-row">
    <div class="w-full lg:w-1/2 border-r border-gray-200">
      <FacturaList @editarFactura="seleccionarFactura" />
    </div>

    <div class="w-full lg:w-1/2">
      <FacturaForm
        :factura="facturaSeleccionada"
        @close="cerrarFormulario"
      />
    </div>
  </div>
</template>
