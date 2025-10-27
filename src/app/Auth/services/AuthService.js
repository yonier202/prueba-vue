import api from '../../../lib/axios';

export default {
    login(credenciales){
        return api.post('/login', credenciales);
    },
    register(datos) {
        return api.post('/register', datos);
    },
    logout() {
        return api.post('/logout');
    }
    
}
