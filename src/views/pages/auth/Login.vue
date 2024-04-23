<script setup>
import { ref, computed } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useAuthStore } from '@/stores/auth'

const username = ref('');
const password = ref('');

const authStore = useAuthStore();
const login = () => {
    if(username.value !== '' && password.value !== ''){
        authStore.login({
        login: username.value,
        password: password.value
    });
    }
}

const logoUrl = computed(() => {
    return `/layout/images/logo.webp`;
});
</script>

<template>
    <div
        class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img :src="logoUrl" alt="Uzrailways logo" class="mb-5 w-6rem flex-shrink-0" />
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Xush kelibsiz!</div>
                        <span class="text-600 font-medium">Davom etish uchun login va parolni kiriting</span>
                    </div>
                    <div>
                        <label for="username" class="block text-900 text-xl font-medium mb-2">Username</label>
                        <InputText v-on:keyup.enter="login" id="username" type="text" placeholder="Usernameni kiriting"
                            class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="username" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Parol</label>
                        <Password v-on:keyup.enter="login" id="password1" v-model="password" placeholder="Parolni kiriting" :toggleMask="true"
                            :feedback="false" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }">
                        </Password>


                        <Button @click="login()" label="Tizimga kirish" class="w-full p-3 text-xl"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
