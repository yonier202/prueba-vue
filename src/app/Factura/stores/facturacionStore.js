import { defineStore } from 'pinia'
import { ref } from 'vue'
import FacturacionService from '../services/facturacionService'
import Swal from 'sweetalert2';

export const useFacturacionStore = defineStore('facturacion', () => {

  const facturas = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Obtiene todas las facturas desde el servidor
   * Actualiza el estado de facturas con los datos recibidos
   */
  async function fetchFacturas() {
    loading.value = true
    error.value = null
    try {
      const { data } = await FacturacionService.getAll()
      facturas.value = data.data ?? data
    } catch (err) {
      console.error('Error al obtener facturas:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  /**
   * Muestra una alerta usando SweetAlert2
   * @param {String} type - Título de la alerta
   * @param {String} msj - Mensaje a mostrar
   * @param {String} icon - Tipo de icono (success, error, etc.)
   */
  async function Alerta(type, msj, icon){
    Swal.fire({
        title: type,
        text:  msj,
        icon: icon,
        confirmButtonText: 'Aceptar'
      });
    }

  /**
   * Crea una nueva factura
   * Transforma el payload a FormData si es necesario y maneja los items especiales
   * @param {FormData|Object} payload - Datos de la factura a crear
   */
  async function crearFactura(payload) {
    try {
      loading.value = true
      error.value = null
      const formData = payload instanceof FormData ? payload : new FormData()

      if (!(payload instanceof FormData)) {
        for (const key in payload) {
          if (key === 'items') {
            payload[key].forEach((item, i) => {
              formData.append(`items[${i}][nombre]`, item.nombre)
              formData.append(`items[${i}][cantidad]`, item.cantidad)
              formData.append(`items[${i}][iva]`, item.iva)
              formData.append(`items[${i}][precio_unitario]`, item.precio_unitario)
            })
          } else {
            formData.append(key, payload[key])
          }
        }
      }
      await FacturacionService.create(formData)
      await fetchFacturas()
      await Alerta('Exito', 'Factura creada con exito', 'success');
    } catch (err) {
      console.error('Error al crear factura:', err)
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza una factura existente
   * @param {Number} id - ID de la factura a actualizar
   * @param {FormData} payload - Datos actualizados de la factura
   */
  async function actualizarFactura(id, payload) {
    try {
        payload.append("_method", "PUT");
        loading.value = true
        await FacturacionService.update(id, payload)
        await Alerta('Exito', 'Factura Actualizada con exito', 'success');
        await fetchFacturas()
    } catch (err) {
        console.error('Error al actualizar factura:', err)
        Alerta('Error', 'Error al actualizar la factura', 'error');
        error.value = err
        throw err
    } finally {
        loading.value = false
    }
  }

  /**
   * Elimina una factura y actualiza la lista local
   * @param {Number} id - ID de la factura a eliminar
   */
  async function eliminarFactura(id) {
    try {
      await FacturacionService.delete(id)
      facturas.value = facturas.value.filter(f => f.id !== id)
      Alerta('Exito', 'Factura Eliminada con exito', 'success');
    } catch (err) {
      console.error('Error al eliminar factura:', err)
      error.value = err
      throw err
    }
  }

  return {
    facturas,
    loading,
    error,
    fetchFacturas,
    crearFactura,
    actualizarFactura,
    eliminarFactura,
  }
})
