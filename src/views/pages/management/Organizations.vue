<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { OrganizationService } from '@/service/OrganizationService';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const organizations = ref(null);
const pageSize = ref(25);
const pageToken = ref(1);
const totalOrganizationsCount = ref(null);
const dropdownOrganizations = ref([]);
const selectedOrganization = ref(null);

const deleteOrganizationsDialog = ref(false);
const organizationDialog = ref(false);
const deleteOrganizationDialog = ref(false);
const organization = ref({});
const selectedOrganizations = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const organizationService = new OrganizationService();

onBeforeMount(() => {
    initFilters();
});
onMounted(() => {
    organizationService.getOrganizations().then((data) => {
        organizations.value = data.organizations;
        pageSize.value = data.pageSize;
        pageToken.value = data.pageToken;
        totalOrganizationsCount.value = data.total;
    });
});

const openNew = () => {
    organization.value = {};
    submitted.value = false;
    organizationDialog.value = true;
};

const hideDialog = () => {
    organizationDialog.value = false;
    submitted.value = false;
    dropdownOrganizations.value = [];
};

const saveOrganization = () => {
    submitted.value = true;
    if (organization.value.title) {
        if (organization.value.id) {

            organizationService
                .updateOrganization(organization.value)
                .then((data) => {
                    data.primaryOrganizationTitle = selectedOrganization.value.title;
                    organizations.value[findIndexById(organization.value.id)] = data;
                    toast.add({ severity: 'success', summary: 'Muvaqqiyatli', detail: "Tashkilot ma'lumotlari muvaqqiyatli o'zgartirildi", life: 3000 });
                    organizationDialog.value = false;
                    organization.value = {};
                    dropdownOrganizations.value = [];
                    selectedOrganization.value = null;
                })
                .catch((e) => {
                    console.log(e);
                    toast.add({ severity: 'error', summary: 'Xatolik', detail: "Tashkilot ma'lumotlarini saqlashda xatolik yuz berdi.", life: 3000 });
                });
        } else {
            organizationService
                .createOrganization(organization.value)
                .then((data) => {
                    data.primaryOrganizationTitle = selectedOrganization.value.title;

                    organizations.value.push(data);
                    toast.add({ severity: 'success', summary: 'Muvaqqiyatli', detail: "Tashkilot ma'lumotlari muvaqqiyatli yaratildi", life: 3000 });
                    organizationDialog.value = false;
                    organization.value = {};
                    dropdownOrganizations.value = [];
                    selectedOrganization.value = null;
                })
                .catch((e) => {
                    console.log(e);
                    toast.add({ severity: 'error', summary: 'Xatolik', detail: "Tashkilot ma'lumotlarini saqlashda xatolik yuz berdi.", life: 3000 });
                });
        }
    }
};

const editOrganization = (editOrganization) => {
    dropdownOrganizations.value = [{
        id: editOrganization.primaryOrganizationId,
        title: editOrganization.primaryOrganizationTitle
    }];

    organization.value = { ...editOrganization };
    organizationDialog.value = true;
};

const confirmDeleteProduct = (editProduct) => {
    organization.value = editProduct;
    deleteOrganizationDialog.value = true;
};

const removePrimaryOrganization = () =>{
    organization.value.primaryOrganizationId = 0;
}

const confirmDeletePrimaryOrganization = () => {

};

const deleteSelectedOrganizations = () => {
    organizations.value = organizations.value.filter((val) => !selectedOrganizations.value.includes(val));
    deleteOrganizationsDialog.value = false;
    selectedOrganizations.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Tashkilotlar o\'chirildi', life: 3000 });
};

const deleteOrganization = () => {
    organizationService
        .deleteOrganization(organization.value.id)
        .then(() => {
            organizations.value = organizations.value.filter((val) => val.id !== organization.value.id);
            deleteOrganizationDialog.value = false;
            organization.value = {};
            toast.add({ severity: 'success', summary: 'Muvaqqiyatli', detail: "Ma'lumotlar muvaqqiyatli o'chirildi", life: 3000 });
        })
        .catch(() => {
            toast.add({ severity: 'error', summary: 'Xatolik', detail: "Ma'lumotlarni o'chirishda xatolik yuz berdi.", life: 3000 });
        });
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < organizations.value.length; i++) {
        if (organizations.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const exportCSV = () => {
    dt.value.exportCSV({
        selectionOnly: true
    });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const onPrimaryOrganizationsFilter = (filterEvent) => {
    if (filterEvent.value.length >= 3) {
        organizationService
            .getOrganizations({
                title: filterEvent.value
            })
            .then((data) => {
                dropdownOrganizations.value = data.organizations;
            });
    }
};

const onPrimaryOrganizationChange = (e) => {
    selectedOrganization.value =
        dropdownOrganizations.value.filter(org => org.id === e.value)[0];
}

</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Tashkilot qo'shish" icon="pi pi-plus" class="mr-2" severity="success"
                                @click="openNew" />
                            <!-- <Button label="O'chirish" icon="pi pi-trash" severity="danger"
                                @click="confirmDeleteSelected"
                                :disabled="!selectedOrganizations || !selectedOrganizations.length" /> -->

                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="text/csv" :maxFileSize="1000000" label="Import"
                            chooseLabel="Import" class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="organizations" v-model:selection="selectedOrganizations" dataKey="id"
                    :paginator="true" :rows="pageSize" :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} employees">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Tashkilotlarni boshqarish</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText class="w-full sm:w-auto" v-model="filters['global'].value"
                                    placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="min-width: 3rem; width: 5%"></Column>
                    <Column field="title" header="Tashkilot nomi" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            {{ slotProps.data.title }}
                        </template>
                    </Column>
                    <Column field="primaryOrganizationTitle" header="Yuqori tashkilot" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Yuqori Tashkilot</span>
                            {{ slotProps.data.primaryOrganizationTitle ?? 'Yuqori tashkilot mavjud emas' }}
                        </template>
                    </Column>
                    <Column field="physicalIdentity" header="Identifikatsiya" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Identifikatsiya</span>
                            {{ slotProps.data.physicalIdentity }}
                        </template>
                    </Column>
                    <Column field="details" header="Qo'shimcha ma'lumot" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Qo'shimcha ma'lumot</span>
                            {{ slotProps.data.details ?? "Qo'shimcha ma'lumot yo'q" }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem; width: 10%">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded
                                @click="editOrganization(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="danger" rounded
                                @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="organizationDialog" header="Tashkilot ma'lumotlari" :modal="true"
                    class="p-fluid w-full max-w-30rem">
                    <div class="field">
                        <label for="title">Tashkilot nomi</label>
                        <InputText id="title" v-model="organization.title" required="true" autofocus
                            :invalid="submitted && !organization.title" />
                        <small class="p-invalid" v-if="submitted && !organization.title">Tashkilot nomi kiritilishi
                            shart</small>
                    </div>
                    <div class="field">
                        <label for="primaryOrg">Yuqori tashkilot</label>
                        <div class="flex align-items-center">
                            <Dropdown @filter="onPrimaryOrganizationsFilter" @change="onPrimaryOrganizationChange"
                                v-model="organization.primaryOrganizationId" filter :options="dropdownOrganizations"
                                optionLabel="title" optionValue="id" emptyMessage="Ma'lumot topilmadi"
                                class="w-18rem md:w-18rem"
                                placeholder="Tashkilot nomidagi kamida 3ta harfni kiriting" />
                            <Button @click="removePrimaryOrganization" severity="danger" icon="pi pi-trash" rounded class="mx-1" />
                        </div>

                    </div>
                    <div class="field">
                        <label for="title">Tashkilot identifikatsiya ma'lumoti</label>
                        <InputText id="title" v-model="organization.physicalIdentity" required="true" autofocus
                            :invalid="submitted && !organization.physicalIdentity" />
                        <small class="p-invalid" v-if="submitted && !organization.physicalIdentity">Tashkilot
                            identifikatsiya ma'lumoti
                            kiritilishi shart</small>
                    </div>
                    <div class="field">
                        <label for="details">Qo'shimcha ma'lumot</label>
                        <Textarea d="details" v-model="organization.details" required="true" autofocus />
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" text="" @click="saveOrganization" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteOrganizationDialog" :style="{ width: '450px' }" header="Tasdiqlash"
                    :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="organization">Haqiqatdan ham <b>{{ organization.lastName }} {{
                            organization.firstName }}</b>
                            ma'lumotlarini o'chirmoqchimisiz?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteOrganizationDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteOrganization" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteOrganizationsDialog" :style="{ width: '450px' }" header="Tasdiqlash"
                    :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="organization">Haqiqatdan ham tanlangan ma'lumotlarni o'chirmoqchimisiz?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteOrganizationsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedOrganizations" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
