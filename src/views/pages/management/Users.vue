<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { UserService } from '@/service/UserService';
import { OrganizationService } from '@/service/OrganizationService';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from "primevue/useconfirm";
import { AuthService } from '@/service/AuthService'
import Swal from 'sweetalert2';


const toast = useToast();
const confirm = useConfirm();

const requireConfirmation = (event, id) => {
    confirm.require({
        target: event.currentTarget,
        group: 'headless',
        message: 'Xodimni tashkilot adminligidan o\'chirmoqchimisiz?',
        accept: () => {
            unAssignOrganization(id);
        }
    });
}

const users = ref(null);
const pageSize = ref(null);
const pageToken = ref(null);
const totalUsersCount = ref(null);
const roles = ref([
    {
        role: 'user',
        name: 'User'
    },
    {
        role: 'admin',
        name: 'Admin'
    },
    {
        role: 'superadmin',
        name: 'Super Admin'
    }
]);
const getRole = (roleName) => {
    const role =
        roles.value.find(rol => rol.role == roleName);

    if (role == undefined) {
        return `Noma'lum`;
    }
    return role.name;
}

const userCredentials = ref({
    login: '',
    password: '',
    id: 0
});

const userAssignedOrganizations = ref([]);
const dropdownOrganizations = ref([]);

const haveCredential = ref(false);
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
const authService = new AuthService();

const filterAssignedOrganization = (filterEvent) => {
    if (filterEvent.value.length >= 3) {
        organizationService
            .getOrganizations({
                title: filterEvent.value
            })
            .then((data) => {
                dropdownOrganizations.value = data.organizations;
            });
    }
}

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

const hideDialog = () => {
    userDialog.value = false;
    submitted.value = false;
};

const confirmationUserCred = (event) => {
    confirm.require({
        target: event.currentTarget,
        group: 'templating',
        message: `Login parolni saqlamoqchimisiz? (Parolni eslab qoling, oyna yopilgandan keyin parol qayta ko'rinmaydi.)`,
        icon: 'pi pi-exclamation-circle',
        acceptIcon: 'pi pi-check',
        rejectIcon: 'pi pi-times',
        acceptLabel: 'Saqlash',
        rejectLabel: 'Bekor qilish',
        rejectClass: 'p-button-outlined p-button-sm',
        acceptClass: 'p-button-sm',
        accept: () => {
            userCredentials.value.id = user.value.id;
            authService.updateCred(userCredentials.value)
                .then(() => {
                    Swal.fire({
                        title: "Login, parol muvaqqiyatli o'zgartirildi.",
                        icon: "success"
                    });
                })
        }
    });
}

const showOrganizations = (id) => {
    haveCredential.value = false;
    userCredentials.value.login = '';
    userAssignedOrganizations.value = [];
    newAssignedOrganization.value = {};

    userService.getUserByDetails(id).then((data) => {
        userAssignedOrganizations.value = data.organizations;

        if (data.login != null) {
            haveCredential.value = true;
            userCredentials.value.login = data.login
            userCredentials.value.password = '';
        }

        dropdownOrganizations.value = data.organizations.map((org) => ({
            id: org.organizationId,
            title: org.organizationTitle
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

const assignedOrganizationChange = (change) => {
    newAssignedOrganization.value.userId = user.value.id;
    newAssignedOrganization.value.organizationId = change.value;
    newAssignedOrganization.value.organizationTitle =
        dropdownOrganizations.value.find(org => org.id == newAssignedOrganization.value.organizationId)
            .title
}

const newAssignedOrganization = ref({});

const unAssignOrganization = (organizationId) => {
    userService.unAssignOrganization(user.value.id, organizationId)
        .then(() => {
            userAssignedOrganizations.value =
                userAssignedOrganizations.value.filter((org => org.organizationId !== organizationId));

            toast.add({ severity: 'success', summary: 'Muvaqqiyatli', detail: `Ma'lumot muvaqqiyatli o'chirildi`, life: 3000 });

        });
}

const assignOrganization = () => {
    const userId = newAssignedOrganization.value.userId;
    const assignedOrganizationIds = [newAssignedOrganization.value.organizationId]

    userService.assignOrganization(userId, assignedOrganizationIds)
        .then(() => {
            userAssignedOrganizations.value.push(
                {
                    userId: userId,
                    organizationId: newAssignedOrganization.value.organizationId,
                    organizationTitle: newAssignedOrganization.value.organizationTitle
                });

            toast.add({ severity: 'success', summary: 'Muvaqqiyatli', detail: `Ma'lumot muvaqqiyatli qo'shildi`, life: 3000 });
        })
        .catch(err => console.log(err));
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    }
}


const page = ref({
    limit: pageSize.value,
    page: 1
});

const sort = ref({
    field: '',
    ascending: true
});

const onSort = (event) => {
    if (event.sortField !== null) {
        sort.value.field = event.sortField;

        if (event.sortOrder < 0) {
            sort.value.ascending = false;
        }
        else {
            sort.value.ascending = true;
        }

        loadData(filterModel.value, sort.value, page.value);
    }
    else {
        sort.value.field = event.sortField;
        sort.value.ascending = true;
    }
}

const filterModel = ref({
    keyword: null,
});

const loadData = (filterOptions, sortOptions, pageOptions) => {
    const queryParams = {
        limit: pageOptions.limit,
        page: pageOptions.page
    };

    if (filterOptions.keyword !== null && filterOptions.keyword.length > 0) {
        queryParams.keyword = filterOptions.keyword;
    }

    if (sortOptions.field !== null && sortOptions.field.length > 0) {
        queryParams.orderBy = sortOptions.field;

        if (!sortOptions.ascending) {
            queryParams.isDescending = true;
        }
    }
    userService.getUsers(queryParams).then((data) => {
        users.value = data.users;
        pageSize.value = data.pageSize
        totalUsersCount.value = data.total
    });
}

const filterChange = (inputEvent) => {
    if (inputEvent.data === null) {
        loadData(filterModel.value, sort.value, page.value);
    }
    else if (inputEvent.target.value.length >= 3) {
        loadData(filterModel.value, sort.value, page.value);
        console.log(filterModel.value);
    }
}

const onPage = (event) => {
    page.value.limit = event.rows;
    page.value.page = event.page + 1;

    loadData(filterModel.value, sort.value, page.value);
}

const op = ref();
const auditInfo = ref(null);

const showAuditInfo = (event, id) => {
    if (auditInfo.value == null || auditInfo.value.id != id) {
        userService.getAuditDetailsById(id)
            .then(data => {
                auditInfo.value = data;
                auditInfo.value.id = id
            });
    }
    op.value.toggle(event);
}

const formatDateTime = (date) => {
    if (date != null) {
        let parts = date.split('T');

        return `${parts[0]} ${parts[1].substring(0, 8)}`;
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
                            <Button label="Xodim qo'shish" icon="pi pi-plus" class="mr-2" severity="success"
                                @click="openNew" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="text/csv" :maxFileSize="1000000" label="Import"
                            chooseLabel="Import" class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="users" v-model:selection="selectedUsers" dataKey="id" :paginator="true"
                    :rows="pageSize" lazy :total-records="totalUsersCount" @page="onPage($event)" @sort="onSort($event)"
                    removable-sort
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} employees">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Xodimlarni boshqarish</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText @input="filterChange($event)" class="w-full sm:w-auto"
                                    v-model="filterModel.keyword" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="min-width: 3rem; width: 5%"></Column>
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
                    <Column field="physicalIdentity" header="JSHIR" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">JSHIR</span>
                            {{ slotProps.data.physicalIdentity }}
                        </template>
                    </Column>
                    <Column field="jobPosition" header="Lavozim" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Lavozim</span>
                            {{ slotProps.data.jobPosition }}
                        </template>
                    </Column>
                    <Column field="role" header="Rol" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Rol</span>
                            {{ getRole(slotProps.data.role) }}
                        </template>
                    </Column>
                    <Column header="Ma'lumotlar" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Korxonalar</span>
                            <Button label="Ko'rish" icon="pi pi-external-link"
                                @click="showOrganizations(slotProps.data.id)" />
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem; width: 10%">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" severity="success" rounded
                                @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2 mx-1" severity="danger" rounded
                                @click="confirmDeleteProduct(slotProps.data)" />
                            <Button icon="pi pi-info-circle" class="mt-2" severity="info" rounded
                                @click="showAuditInfo($event, slotProps.data.id)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="userDialog" :style="{ width: '450px' }" header="Xodim ma'lumotlari"
                    :modal="true" class="p-fluid">

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
                        <label for="physicalIdentity">JSHIR</label>
                        <InputText id="physicalIdentity" v-model="user.physicalIdentity" required="true" autofocus
                            :invalid="submitted && !user.physicalIdentity" />
                        <small class="p-invalid" v-if="submitted && !user.physicalIdentity">Xodim JSHIRini
                            kiriting</small>
                    </div>
                    <div class="field">
                        <label for="jobPosition">Lavozim</label>
                        <InputText id="jobPosition" v-model="user.jobPosition" required="true" autofocus
                            :invalid="submitted && !user.jobPosition" />
                        <small class="p-invalid" v-if="submitted && !user.jobPosition">Xodim lavozimini kiriting</small>
                    </div>
                    <div class="field">
                        <label for="role">Rol</label>
                        <Dropdown id="role" :options="roles" optionLabel="name" optionValue="role" v-model="user.role"
                            required="true" autofocus :invalid="submitted && !user.role" />
                        <small class="p-invalid" v-if="submitted && !user.role">Xodim rolini kiriting</small>
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

                <Dialog v-model:visible="organizationsDialog" modal header="Login, parol va biriktirilgan tashkilotlar"
                    :breakpoints="{ '1199px': '80vw', '575px': '90vw' }">
                    <div class="">
                        <div class="field">
                            <label for="login">Login: </label>
                            <InputText id="login" v-model="userCredentials.login" required="true" autofocus
                                placeholder="Loginni kiriting" />
                        </div>
                        <div class="field">
                            <label for="password">Parol: </label>
                            <Password id="password" placeholder="Parolni kiriting." v-model="userCredentials.password"
                                required="true" autofocus toggleMask :feedback="false" />
                        </div>

                        <span @click=confirmationUserCred($event)>
                            <Button v-if="haveCredential" label="O'zgartirish" severity="warning" raised />
                            <Button v-else label="Yaratish" severity="primary" raised />
                        </span>
                    </div>
                    <div>
                        <DataTable :value="userAssignedOrganizations">
                            <Column field="organizationTitle" header="Biriktirilgan korxona" />
                            <Column field="id">
                                <template #body="slotProps">
                                    <Button @click="requireConfirmation($event, slotProps.data.organizationId)"
                                        class="ml-2" rounded severity="danger" icon="pi pi-trash" />
                                </template>
                            </Column>
                        </DataTable>
                        <Dropdown v-model="newAssignedOrganization.organizationId" :options="dropdownOrganizations"
                            optionValue="id" optionLabel="title" filter @filter="filterAssignedOrganization"
                            @change="assignedOrganizationChange" emptyMessage="Ma'lumot topilmadi"
                            placeholder="Tashkilotni tanlang" class="w-14rem mt-1"></Dropdown>
                        <Button @click="assignOrganization" class="ml-2" label="Qo'shish" />
                    </div>
                </Dialog>

                <ConfirmPopup group="headless">
                    <template #container="{ message, acceptCallback, rejectCallback }">
                        <div class="border-round p-3">
                            <span>{{ message.message }}</span>
                            <div class="flex align-items-center gap-2 mt-3">
                                <Button severity="danger" label="O'chirish" @click="acceptCallback"
                                    size="small"></Button>
                                <Button label="Bekor qilish" outlined @click="rejectCallback" severity="secondary"
                                    size="small" text></Button>
                            </div>
                        </div>
                    </template>
                </ConfirmPopup>

                <ConfirmPopup group="templating">
                    <template #message="slotProps">
                        <div
                            class="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border p-3 mb-3 pb-0">
                            <i :class="slotProps.message.icon" class="text-6xl text-primary-500"></i>
                            <p>{{ slotProps.message.message }}</p>
                        </div>
                    </template>
                </ConfirmPopup>

            </div>
        </div>
    </div>
    <OverlayPanel ref="op">
        <div class="flex flex-column">
            <span>Kim tomonidan yaratilgan: {{ auditInfo.createdByFullName ?? `Ma'lumot yo'q` }}</span>
            <span>Qachon yaratilgan: {{ formatDateTime(auditInfo.createdAt) }}</span>

            <template v-if="auditInfo.updatedAt != null">
                <span>Kim tomonidan o'zgartirilgan: {{ auditInfo.updatedByFullName ?? `Ma'lumot yo'q` }}</span>
                <span>Qachon o'zgartirilgan: {{ formatDateTime(auditInfo.updatedAt) }}</span>
            </template>
        </div>
    </OverlayPanel>
</template>
