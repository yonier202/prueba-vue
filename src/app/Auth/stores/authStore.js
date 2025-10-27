import { defineStore } from "pinia";
import { reactive, ref, watch, onMounted } from "vue";
import AuthService from "../services/AuthService";
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

export const useAuthStore = defineStore('auth', () => {
    const user = reactive({
        data: null,
        token: '',
        roles: null
    });

    const loading = ref(false);
    const error = ref(null);
    const router = useRouter();

    /**
     * Inicia sesión con las credenciales proporcionadas
     * Almacena los datos del usuario, token y rol en el estado
     * @param {Object} credenciales - Email y contraseña del usuario
     */
    async function login(credenciales) {
        loading.value = true;
        error.value = null;
        try {
            const {data}  = await AuthService.login(credenciales);
            console.log(data);
            user.data = data.data;
            user.token = data.token;

            // Obtener el rol
            user.roles = data.data.roles[0]?.name || null;
        } catch (err) {
            error.value = err.response?.data?.message || "Error al iniciar sesión";
        } finally {
            loading.value = false;
        }
    }

    /**
     * Registra un nuevo usuario en el sistema
     * @param {Object} datos - Datos del usuario a registrar
     */
    async function register(datos) {
        loading.value = true;
        error.value = null;
        try {
            const { data } = await AuthService.register(datos);
            user.data = data.data;
            user.token = data.token;

            // Obtener el rol
            user.roles = data.data.roles[0]?.name || null;
            
        } catch (err) {
            console.log(err);
            error.value = err.response?.data?.message || "Error al registrarse";
        } finally {
            loading.value = false;
        }
    }

    /**
     * Cierra la sesión del usuario
     * Limpia los datos del usuario, token y redirige al login
     */
    async function logout() {
        try {
            await AuthService.logout()
            user.data = null;
            user.token = '';
            user.roles = null;
            localStorage.removeItem('user')
            router.push('/login')
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error al cerrar sesión',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
        
    }

    /**
     * Carga los datos del usuario desde el localStorage
     * Restaura la sesión del usuario si existe
     */
    function cargarLocalStorage() {
        const userData = localStorage.getItem('user')
        if (userData) {
            const data = JSON.parse(userData);

            //actualizamos las propiedades del usuario
            user.data = data.data;
            user.token = data.token;
            user.roles = data.roles;
        }
    }
    
    /**
     * Observa cambios en el estado del usuario
     * Sincroniza automáticamente los datos del usuario con el localStorage
     */
    watch(user, (newUser) => {
        if (newUser && newUser.token) {
            localStorage.setItem('user', JSON.stringify(newUser))
        } else {
            localStorage.removeItem('user')
        }
    }, { deep: true })

    onMounted(() => {
        cargarLocalStorage()
        if (user.token) {
            router.push('/facturacion')
        }
    })

    return{
        user,
        loading,
        error,
        login,
        register,
        logout,
        cargarLocalStorage
    }

});