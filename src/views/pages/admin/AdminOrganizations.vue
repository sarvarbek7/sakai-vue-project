<script setup>
import {UserService} from '@/service/UserService'
import {onMounted, ref} from 'vue'
import {useAuthStore} from '@/stores/auth';

const userService = new UserService();
const authStore = useAuthStore();
const organizations = ref([]);

onMounted(() =>{
    userService.getUserByDetails(authStore.user.id)
        .then(data => {
            organizations.value = data.organizations;
        });
}); 

</script>


<template>
    <div class="grid gap-4">
        <Card v-for="organization in organizations" :key="organization.id" style="width: 25rem; overflow: hidden">
                <template #header>
                    <div class="flex justify-content-center pt-3">
                        <img height="200px" width="260px" style="object-fit: cover;" alt="user header" src="/demo/images/galleria/galleria2.jpg"> 
                    </div>
                </template>
                <template #title>{{organization.organizationTitle}}</template>
                <template #subtitle>Card subtitle</template>
                <template #content>
                    <p class="m-0">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error
                        repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione
                        quam perferendis esse, cupiditate neque
                        quas!
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-3 mt-1">
                        <Button label="Cancel" severity="secondary" outlined class="w-full" />
                        <Button label="Save" class="w-full" />
                    </div>
                </template>
            </Card>
    </div>
</template>