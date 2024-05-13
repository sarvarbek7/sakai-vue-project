<script setup>
import { UserService } from '@/service/UserService'
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';


const userService = new UserService();
const authStore = useAuthStore();
const organizations = ref([]);

onMounted(() => {
    userService.getUserOrganizations(authStore.user.id)
        .then(data => {
            organizations.value = data.organizations;
        });
});

const router = useRouter();

const openDocuments = (organizationId) => {
    router.push({ name: 'documents-admin', params: { id: organizationId } })
}

</script>


<template>
    <div class="grid gap-4">
        <div class="card flex flex-column bg-yellow-100 justify-content-between" v-for="organization in organizations" :key="organization.id"
            style="width: 25rem; overflow: hidden">
            <div class="card-header">
                <div class="flex justify-content-center pt-3">
                    <img height="200px" width="260px" style="object-fit: cover;" alt="user header"
                        src="/demo/images/galleria/galleria2.jpg">
                </div>
            </div>
            <div class="card-title">
                <h3>{{ organization.title }}</h3>
            </div>
            <div class="card-subtitle">
                <h6>{{ organization.physicalIdentity }}</h6>
                <Chip class="m-1">
                    Quyi tashkilotlar tomonidan topshirilgan hujjatlar soni {{
                        organization.documentsCountIncludeSubordinates - organization.documentsCount }} ta.
                </Chip>
            </div>
            <div class="card-content">
                <p class="m-0 bg-black-alpha">
                    {{ organization.details }}
                </p>
            </div>
            <div class="pt-2">
                <div class="flex gap-3 mt-1">
                    <Button rounded class="w-full" disabled>
                        Quyi tashkilotlar: {{ organization.subordinatesCount }}
                    </Button>
                    <Button rounded class="w-full text-center" @click="openDocuments(organization.id)">
                        Hujjatlar soni: {{ organization.documentsCount }}
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>