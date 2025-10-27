export default [
    {
        path: '/login',
        name: 'login',
        component: () => import('./pages/loginView.vue')
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('./pages/registerView.vue')
    },
    {
        path: '/:pathMatch(.*)*', 
        redirect: '/login'
    }
]