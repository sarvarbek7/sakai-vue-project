<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { useConfirm } from 'primevue/useconfirm';

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
const authStore = useAuthStore();
const profileMenu = ref(null);
const confirm = useConfirm();

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

const onSignOutMenuButton = (event) => {
    
    confirm.require({
        target: event.target,
        group: 'templating',
        message: 'Haqiqatdan ham tizimdan chiqmoqchimisiz?',
        icon: 'pi pi-exclamation-circle',
        acceptIcon: 'pi pi-check',
        rejectIcon: 'pi pi-times',
        acceptLabel: 'Chiqish',
        rejectLabel: 'Bekor qilish',
        rejectClass: 'p-button-outlined p-button-sm',
        acceptClass: 'p-button-sm',
        accept: () => {
            authStore.logout();
        },
    });
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
            <button @click="onSignOutMenuButton($event)" class="p-link layout-topbar-button">
                <i class="pi pi-sign-out"></i>
                <span>Tizimdan chiqish</span>
            </button>
        </div>
    </div>
    <ConfirmPopup group="templating">
        <template #message="slotProps">
            <div class="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border p-3 mb-3 pb-0">
                <i :class="slotProps.message.icon" class="text-6xl text-primary-500"></i>
                <p>{{ slotProps.message.message }}</p>
            </div>
        </template>
    </ConfirmPopup>
</template>

<style lang="scss" scoped></style>
