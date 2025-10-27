import { defineStore } from "pinia";
import personaService from "../services/personaService";
import Swal from 'sweetalert2';

export const usePersonaStore = defineStore("persona", {
  state: () => ({
    personas: [],
    personaEncontrada: null,
    loading: false,
  }),

  actions: {
    /**
     * Obtiene todas las personas desde el servidor
     */
    async fetchPersonas() {
      this.loading = true;
      try {
        const { data } = await personaService.getAll();
        this.personas = data.data ?? data;
      } finally {
        this.loading = false;
      }
    },

    Alerta(type, msj, icon){
        Swal.fire({
            title: type,
            text:  msj,
            icon: icon,
            confirmButtonText: 'Aceptar'
        });
    },

    /**
     * Busca una persona por tipo y número de documento
     * Almacena el resultado en personaEncontrada
     * @param {String} tipo_documento - Tipo de documento (CC, TI)
     * @param {String} documento - Número de documento
     */
    async buscarPersona(tipo_documento, documento) {
      this.loading = true;
      try {
        const { data } = await personaService.buscarPorDocumento(tipo_documento, documento);
        this.personaEncontrada = data;
      } catch (error) {
        this.Alerta('Error', 'No se pudo encontrar la persona', 'error');
        console.error(error);
        this.personaEncontrada = null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crea una nueva persona en el sistema
     * @param {Object} data - Datos de la persona a crear
     */
    async crearPersona(data) {
      try {
        await personaService.create(data);
        await this.fetchPersonas();
        this.Alerta('Exito', 'Persona creada con exito', 'success');
      } catch (error) {
        this.Alerta('Error', 'No se pudo crear la persona', 'error');
      }
    },

    /**
     * Actualiza los datos de una persona existente
     * @param {Number} id - ID de la persona a actualizar
     * @param {Object} payload - Nuevos datos de la persona
     */
    async actualizarPersona(id, payload) {
        try {
            await personaService.update(id, payload);
            await this.fetchPersonas();
            this.Alerta('Exito', 'Persona Actulizada con exito', 'success');
        } catch (error) {
            this.Alerta('Error', 'No se pudo actualizar la persona', 'error');
        }
    },

    /**
     * Elimina una persona del sistema
     * @param {Number} id - ID de la persona a eliminar
     */
    async eliminarPersona(id) {
      await personaService.delete(id);
      this.personas = this.personas.filter((p) => p.id !== id);
      this.Alerta('Exito', 'Persona Eliminada con exito', 'success');
    },
  },
});
