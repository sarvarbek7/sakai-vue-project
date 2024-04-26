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
        <Card v-for="organization in organizations" :key="organization.id" style="width: 25rem; overflow: hidden">
            <template #header>
                <div class="flex justify-content-center pt-3">
                    <img height="200px" width="260px" style="object-fit: cover;" alt="user header"
                        src="/demo/images/galleria/galleria2.jpg">
                </div>
            </template>
            <template #title>
                <h3>{{ organization.title }}</h3>
            </template>
            <template #subtitle>
                <h6>{{ organization.physicalIdentity }}</h6>
                <Chip class="m-1">
                    Quyi tashkilotlar tomonidan topshirilgan hujjatlar soni {{
                        organization.documentsCountIncludeSubordinates - organization.documentsCount }} ta.
                </Chip>
            </template>
            <template #content>

                <p class="m-0">
                    {{ organization.details }}
                </p>
            </template>
            <template #footer>
                <div class="flex gap-3 mt-1">
                    <Button rounded class="w-full" disabled>
                        Quyi tashkilotlar: {{ organization.subordinatesCount }}
                    </Button>
                    <Button rounded class="w-full text-center" @click="openDocuments(organization.id)">
                        Hujjatlar soni: {{ organization.documentsCount }}
                    </Button>
                </div>
            </template>
        </Card>
    </div>
</template>