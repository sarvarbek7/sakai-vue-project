<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { UserService } from '@/service/UserService';
import { OrganizationService } from '@/service/OrganizationService';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from "primevue/useconfirm";

const toast = useToast();
const confirm = useConfirm();

const requireConfirmation = (event, id) => {
    confirm.require({
        target: event.currentTarget,
        group: 'headless',
        message: 'Save your current process?',
        accept: () => {
            deleteRole(id);
        }
    });
}

const users = ref(null);
const pageSize = ref(null);
const pageToken = ref(null);
const totalUsersCount = ref(null);
const editingRows = ref([]);

const assignedUserRole = ref(null);
const userAssignedOrganizations = ref([]);
const dropdownOrganizations = ref([]);

const assignOrganizationDialog = ref(false);
const userDialog = ref(false);
const deleteUserDialog = ref(false);
const organizationsDialog = ref(false);
const user = ref({});
const selectedUsers = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);

const userService = new UserService();
const organizationService = new OrganizationService();

onBeforeMount(() => {
    initFilters();
});
onMounted(() => {
    userService.getUsers().then((data) => {
        users.value = data.users;
        pageSize.value = data.pageSize;
        pageToken.value = data.pageToken;
        totalUsersCount.value = data.total;
    });
});

const openNew = () => {
    user.value = {};
    submitted.value = false;
    userDialog.value = true;
};

const assignNewOrganization = () => {
    assignedUserRole.value = {};
    assignOrganizationDialog.value = true;
};

const hideDialog = () => {
    userDialog.value = false;
    submitted.value = false;
};

const showOrganizations = (id) => {
    userService.getUserAssignedOrganizationsById(id).then((data) => {
        userAssignedOrganizations.value = data.assignedOrganizations;

        dropdownOrganizations.value = data.assignedOrganizations.map((uAO) => ({
            id: uAO.organizationId,
            title: uAO.organizationTitle
        }));
    });

    user.value.id = id;
    organizationsDialog.value = true;
};

const saveUser = () => {
    submitted.value = true;
    if (user.value.firstName && user.value.lastName && user.value.physicalIdentity) {
        if (user.value.id) {
            userService
                .updateUser(user.value)
                .then((data) => {
                    users.value[findIndexById(user.value.id)] = data;
                    toast.add({ severity: 'success', summary: 'Muvaqqiyatli', detail: "Xodim ma'lumotlari muvaqqiyatli o'zgartirildi", life: 3000 });
                    userDialog.value = false;
                    user.value = {};
                })
                .catch(() => {
                    toast.add({ severity: 'error', summary: 'Xatolik', detail: "Xodim ma'lumotlarini saqlashda xatolik yuz berdi.", life: 3000 });
                });
        } else {
            userService
                .createUser(user.value)
                .then((data) => {
                    users.value.push(data);
                    toast.add({ severity: 'success', summary: 'Muvaqqiyatli', detail: "Xodim ma'lumotlari muvaqqiyatli yaratildi", life: 3000 });
                    userDialog.value = false;
                    user.value = {};
                })
                .catch(() => {
                    toast.add({ severity: 'error', summary: 'Xatolik', detail: "Xodim ma'lumotlarini saqlashda xatolik yuz berdi.", life: 3000 });
                });
        }
    }
};

const editProduct = (editProduct) => {
    user.value = { ...editProduct };
    userDialog.value = true;
};

const confirmDeleteProduct = (editProduct) => {
    user.value = editProduct;
    deleteUserDialog.value = true;
};

const deleteProduct = () => {
    userService
        .deleteUser(user.value.id)
        .then(() => {
            users.value = users.value.filter((val) => val.id !== user.value.id);
            deleteUserDialog.value = false;
            user.value = {};
            toast.add({ severity: 'success', summary: 'Muvaqqiyatli', detail: "Ma'lumotlar muvaqqiyatli o'chirildi", life: 3000 });
        })
        .catch(() => {
            toast.add({ severity: 'error', summary: 'Xatolik', detail: "Ma'lumotlarni o'chirishda xatolik yuz berdi.", life: 3000 });
        });
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < users.value.length; i++) {
        if (users.value[i].id === id) {
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

const filterDropdownOrganizations = (filterEvent) => {
    if (filterEvent.value.length >= 3) {
        organizationService
            .getOrganizations({
                title: filterEvent.value
            })
            .then((data) => {
                dropdownOrganizations.value = data.organizations.map((org) => ({
                    id: org.id,
                    title: org.title
                }));
            });
    }
};

const assignRole = () => {
    userService.assignRoleToUser(user.value.id, assignedUserRole.value)
        .then((data) => {
            data.organizationTitle =
                dropdownOrganizations.value.filter((org) => org.id === data.organizationId)[0].title;

            userAssignedOrganizations.value.push(data);
            assignOrganizationDialog.value = false;
        });
}

const deleteRole = (id) => {
    userService.unAssignRole(id)
        .then(() => {
            userAssignedOrganizations.value =
                userAssignedOrganizations.value.filter((org => org.id !== id));

            toast.add({ severity: 'success', summary: 'Muvaqqiyatli', detail: `Ma'lumot muvaqqiyatli o'chirildi`, life: 3000 });

        });
}

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    }
}

</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Xodim qo'shish" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="text/csv" :maxFileSize="1000000" label="Import"
                            chooseLabel="Import" class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="users" v-model:selection="selectedUsers" dataKey="id" :paginator="true"
                    :rows="10" :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} employees">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Xodimlarni boshqarish</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText class="w-full sm:w-auto" v-model="filters['global'].value"
                                    placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="min-width: 3rem; width: 5%"></Column>
                    <Column field="physicalIdentity" header="JSHIR" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">JSHIR</span>
                            {{ slotProps.data.physicalIdentity }}
                        </template>
                    </Column>
                    <Column field="lastName" header="Familiya" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Familiya</span>
                            {{ slotProps.data.lastName }}
                        </template>
                    </Column>
                    <Column field="firstName" header="Ism" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Ism</span>
                            {{ slotProps.data.firstName }}
                        </template>
                    </Column>
                    <Column field="jobPosition" header="Lavozim" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Lavozim</span>
                            {{ slotProps.data.jobPosition }}
                        </template>
                    </Column>
                    <Column header="Biriktirilgan korxonalar" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Korxonalar</span>
                            <Button label="Ko'rish" icon="pi pi-external-link"
                                @click="showOrganizations(slotProps.data.id)" />
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem; width: 10%">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded
                                @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="danger" rounded
                                @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="userDialog" :style="{ width: '450px' }" header="Xodim ma'lumotlari"
                    :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="physicalIdentity">JSHIR</label>
                        <InputText id="physicalIdentity" v-model="user.physicalIdentity" required="true" autofocus
                            :invalid="submitted && !user.physicalIdentity" />
                        <small class="p-invalid" v-if="submitted && !user.physicalIdentity">Xodim JSHIRini
                            kiriting</small>
                    </div>
                    <div class="field">
                        <label for="lastName">Familiya</label>
                        <InputText id="lastName" v-model="user.lastName" required="true" autofocus
                            :invalid="submitted && !user.lastName" />
                        <small class="p-invalid" v-if="submitted && !user.lastName">Xodim familiyasini kiriting</small>
                    </div>
                    <div class="field">
                        <label for="firstName">Ism</label>
                        <InputText id="firstName" v-model="user.firstName" required="true" autofocus
                            :invalid="submitted && !user.firstName" />
                        <small class="p-invalid" v-if="submitted && !user.firstName">Xodim ismini kiriting</small>
                    </div>
                    <div class="field">
                        <label for="jobPosition">Lavozim</label>
                        <InputText id="jobPosition" v-model="user.jobPosition" required="true" autofocus
                            :invalid="submitted && !user.jobPosition" />
                        <small class="p-invalid" v-if="submitted && !user.jobPosition">Xodim lavozimini kiriting</small>
                    </div>

                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" text="" @click="saveUser" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteUserDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="user">Haqiqatdan ham <b>{{ user.lastName }} {{ user.firstName }}</b> ma'lumotlarini
                            o'chirmoqchimisiz?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteUserDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="organizationsDialog" modal header="Xodim biriktirilgan tashkilotlar"
                    :style="{ height: '70vh', width: '80vw' }" :breakpoints="{ '1199px': '80vw', '575px': '90vw' }">
                    <Toolbar>
                        <template #start>
                            <div class="my-2">
                                <Button label="Tashkilot biriktirish" icon="pi pi-plus" class="mr-2" severity="success"
                                    @click="assignNewOrganization" />
                            </div>
                        </template>
                    </Toolbar>
                    <DataTable v-model:editingRows="editingRows" :value="userAssignedOrganizations" editMode="row" :pt="{
                        table: { style: 'width: 90%' },
                        column: {
                            bodycell: ({ state }) => ({
                                style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                            })
                        }
                    }">
                        <Column field="organizationId" header="Korxona">
                            <template #body="{ data }">
                                <span>{{ data.organizationTitle }}</span>
                            </template>
                            <template #editor="{ data, field }">
                                <Dropdown @filter="onAssignedOrganizationsFilter" @change="onAssignedOrganizationChange"
                                    v-model="data[field]" filter :options="dropdownOrganizations" optionLabel="title"
                                    optionValue="id" emptyMessage="Ma'lumot topilmadi" class="w-10rem"
                                    placeholder="Tashkilot nomidagi kamida 3ta harfni kiriting" />
                            </template>
                        </Column>
                        <Column field="login" header="Login">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" />
                            </template>
                        </Column>
                        <Column field="role" header="Rol">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" />
                            </template>
                        </Column>
                        <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center">
                        </Column>
                        <Column field="id" style="width: 20px; min-width: 20px;">
                            <template #body="{ data }">
                                <Button @click="requireConfirmation($event, data.id)" icon="pi pi-trash"
                                    severity="danger" rounded />
                            </template>
                        </Column>
                    </DataTable>
                </Dialog>

                <Dialog position="top" v-model:visible="assignOrganizationDialog" :style="{ width: '450px' }"
                    header="Tashkilot biriktirish" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="login">Login</label>
                        <InputText id="login" v-model="assignedUserRole.login" required="true" autofocus />

                    </div>
                    <div class="field">
                        <label for="password">Parol</label>
                        <Password :feedback="false" toggleMask id="password" v-model="assignedUserRole.password"
                            required="true" autofocus />

                    </div>
                    <div class="field">
                        <label for="role">Role</label>
                        <InputText id="role" v-model="assignedUserRole.role" required="true" autofocus />
                    </div>
                    <div class="field">
                        <label for="organization">Tashkilot</label>
                        <Dropdown v-model="assignedUserRole.organizationId" :options="dropdownOrganizations" filter
                            @filter="filterDropdownOrganizations" optionValue="id" optionLabel="title" id="organization"
                            placeholder="Tashlikot nomidagi kamida 3ta harfni kiriting"
                            emptyMessage="Ma'lumot topilmadi" />
                    </div>
                    <div></div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" text="" @click="assignRole" />
                    </template>
                </Dialog>

                <ConfirmPopup group="headless">
                    <template #container="{ message, acceptCallback, rejectCallback }">
                        <div class="border-round p-3">
                            <span>{{ message.message }}</span>
                            <div class="flex align-items-center gap-2 mt-3">
                                <Button label="O'chirish" @click="acceptCallback" size="small"></Button>
                                <Button label="Bekor qilish" outlined @click="rejectCallback" severity="secondary"
                                    size="small" text></Button>
                            </div>
                        </div>
                    </template>
                </ConfirmPopup>

            </div>
        </div>
    </div>
</template>
