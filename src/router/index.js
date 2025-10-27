import authRoutes from '../app/Auth/router'
import facturacionRoutes from '../app/Factura/routes'
import personaRoutes from '../app/Persona/routes'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    ...authRoutes,
    ...facturacionRoutes,
    ...personaRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * Guard de navegación que controla el acceso a las rutas
 * Verifica autenticación, redirige usuarios con sesión activa desde login,
 * y restringe acceso al módulo de personas solo para administradores
 */
router.beforeEach((to, from, next) => {
  const userData = localStorage.getItem('user')
  let user = null
  let token = null

  try {
    user = JSON.parse(userData)
    token = user?.token || null
  } catch (e) {
    token = null
  }

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login' })
  }

  if (to.name === 'login' && token) {
    return next({ name: 'facturacion' })
  }

  if (to.path.startsWith('/persona')) {
    const role = user?.roles
    const isAdmin = role === 'admin'

    if (!isAdmin) {
      return next({ name: 'facturacion' })
    }
  }

  next()
})

export default router