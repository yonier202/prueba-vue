export default [
  {
    path: '/personas',
    name: 'personas',
    component: () => import('../Persona/pages/PersonaView.vue'),
    meta: { requiresAuth: true }
  }
]
