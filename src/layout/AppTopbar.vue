<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

const { onMenuToggle } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
const authStore = useAuthStore();
const profileMenu = ref(null);

const profileMenuItems = computed(() => {
    return authStore.isSuperAdmin ? [
        {
            label: 'Korxonalar',
            icon: 'pi pi-briefcase',
            command: () => {
                router.push({
                    name: 'organizations-management'
                });
            }
        },
        {
            label: 'Xodimlar',
            icon: 'pi pi-user-edit',
            command: () => {
                router.push({
                    name: 'users-management'
                });
            }
        },
        {
            label: 'Hujjatlar',
            icon: 'pi pi-folder-open',
            command: () => {
                router.push({
                    name: 'documents-management'
                });
            }
        },
        {
            label: 'Statistika',
            icon: 'pi pi-chart-line',
            command: () => {
                router.push({
                    name: 'statistics-management'
                });
            }
        }
    ] : [
        {
            label: 'Korxonlarim',
            icon: 'pi pi-briefcase',
            command: () => {
                router.push({
                    name: 'organizations-admin'
                });
            }
        },
        {
            label: 'Hujjatlar',
            icon: 'pi pi-folder-open',
            command: () => {
                router.push({
                    name: 'documents-admin'
                });
            }
        }
    ]
});

onMounted(() => {
    bindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const logoUrl = ref("/layout/images/logo.webp");

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};

const onSignInMenuButton = () => {
    router.push({ name: 'login' });
};

const onSignOutMenuButton = () => {
    authStore.logout();
};

const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const toggleProfileMenu = (event) => {
    profileMenu.value.toggle(event);
};

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
</script>

<template>
    <div class="layout-topbar">
        <router-link to="/" class="layout-topbar-logo">
            <img :src="logoUrl" alt="logo" />
            <span>Uzrailways</span>
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v"></i>
        </button>

        <div v-if="!authStore.isLogged" class="layout-topbar-menu" :class="topbarMenuClasses">
            <button @click="onSignInMenuButton()" class="p-link layout-topbar-button">
                <i class="pi pi-sign-in"></i>
                <span>Tizimga kirish</span>
            </button>
        </div>
        <div v-else class="layout-topbar-menu" :class="topbarMenuClasses">
            <button @click="toggleProfileMenu" class="p-link layout-topbar-button">
                <i class="pi pi-user"></i>
                <span>Profile</span>
            </button>
            <Menu class="text-2xl" ref="profileMenu" :model="profileMenuItems" :popup="true" />
            <button @click="onSignOutMenuButton()" class="p-link layout-topbar-button">
                <i class="pi pi-sign-out"></i>
                <span>Tizimdan chiqish</span>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
