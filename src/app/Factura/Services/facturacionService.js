import api from '../../../lib/axios'

export default {

    getAll() {
        return api.get('/facturas');
    },
    create(data) {
    console.log('creando factura con data:', data);
    return api.post('/facturas', data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    },
    update(id, data) {
        return api.post(`/facturas/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        });
    },
    delete(id) {
        return api.delete(`/facturas/${id}`);
    },


}
