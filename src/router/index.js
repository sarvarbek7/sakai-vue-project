import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/auth';


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: 'management',
                    meta: {
                        requiresAuth: true,
                        requiredRole: 'superadmin'
                    },
                    children: [
                        {
                            path: 'users',
                            name: 'users-management',
                            component: () => import('@/views/pages/management/Users.vue')
                        },
                        {
                            path: 'organizations',
                            name: 'organizations-management',
                            component: () => import('@/views/pages/management/Organizations.vue')
                        },
                        {
                            path: 'documents',
                            name: 'documents-management',
                            component: () => import('@/views/pages/management/Documents.vue')
                        },
                        {
                            path: 'statistics',
                            name: 'statistics-management',
                            component: () => import('@/views/pages/management/Statistics.vue')
                        }
                    ]
                },
                {
                    path: 'admin',
                    meta: {
                        requiresAuth: true,
                        requiredRole: 'admin'
                    },
                    children: [
                        {
                            path: 'organizations/:id/documents',
                            name: 'documents-admin',
                            component: () => import('@/views/pages/admin/SubmitDocument.vue')
                        },
                        {
                            path: 'organizations',
                            name: 'organizations-admin',
                            component: () => import('@/views/pages/admin/AdminOrganizations.vue')
                        }
                    ]
                },
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/blocks',
                    name: 'blocks',
                    component: () => import('@/views/utilities/Blocks.vue')
                },
                {
                    path: '/utilities/icons',
                    name: 'icons',
                    component: () => import('@/views/utilities/Icons.vue')
                },
                {
                    path: '/pages/timeline',
                    name: 'timeline',
                    component: () => import('@/views/pages/Timeline.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/utilities/Documentation.vue')
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },
    ]
});

router.beforeEach((to) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth) {
        if (authStore.role === null
            || authStore.role.toString() !== to.meta.requiredRole) {
            router.push({ name: 'accessDenied' })
        }
    }
})

export default router;
