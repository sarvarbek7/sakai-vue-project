<script setup>
import { ref, onMounted } from 'vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

import { DeletedEntitiesService } from '@/service/DeletedEntitiesService';
import { DocumentService } from '@/service/DocumentService';

onMounted(() => {
    documentService.getDocumentTypes()
        .then(docTypes => {
            documentTypes.value = docTypes.documentTypes;
            documentTypes.value.push({
                id: -1,
                title: 'Barchasi'
            });

            loadDocuments();
        });

    loadUserData(userFilterModel.value, userSort.value, userPage.value);
    loadOrganizationData(organizationFilterModel.value, organizationSort.value, organizationPage.value);
})

const confirm = useConfirm();
const toast = useToast();

const service = new DeletedEntitiesService();
const documentService = new DocumentService();
const documentTypes = ref([]);

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

const users = ref([]);
const userTablePageSize = ref(25);
const totalUsers = ref(0);

const userPage = ref({
    limit: userTablePageSize.value,
    page: 1
});

const userSort = ref({
    field: '',
    ascending: true
});

const onUserSort = (event) => {
    if (event.sortField !== null) {
        userSort.value.field = event.sortField;

        if (event.sortOrder < 0) {
            userSort.value.ascending = false;
        }
        else {
            userSort.value.ascending = true;
        }

        loadUserData(userFilterModel.value, userSort.value, userPage.value);
    }
    else {
        userSort.value.field = event.sortField;
        userSort.value.ascending = true;
    }
}

const userFilterModel = ref({
    keyword: null,
});

const loadUserData = (filterOptions, sortOptions, pageOptions) => {
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
    service.getAllDeletedUsers(queryParams).then((data) => {
        users.value = data.users;
        userTablePageSize.value = data.pageSize
        totalUsers.value = data.total
    });
}

const userFilterChange = (inputEvent) => {
    if (inputEvent.data === null) {
        loadUserData(userFilterModel.value, userSort.value, userPage.value);
    }
    else if (inputEvent.target.value.length >= 3) {
        loadUserData(userFilterModel.value, userSort.value, userPage.value);
        console.log(userFilterModel.value);
    }
}

const onUserPage = (event) => {
    userPage.value.limit = event.rows;
    userPage.value.page = event.page + 1;

    loadUserData(userFilterModel.value, userSort.value, userPage.value);
}

const organizations = ref([]);
const organizationTablePageSize = ref(25);
const totalOrganizations = ref(0);

const organizationPage = ref({
    limit: organizationTablePageSize.value,
    page: 1
});

const organizationSort = ref({
    field: '',
    ascending: true
});

const onOrganizationSort = (event) => {
    if (event.sortField !== null) {
        organizationSort.value.field = event.sortField;

        if (event.sortOrder < 0) {
            organizationSort.value.ascending = false;
        }
        else {
            organizationSort.value.ascending = true;
        }

        loadOrganizationData(organizationFilterModel.value, organizationSort.value, organizationPage.value);
    }
    else {
        organizationSort.value.field = event.sortField;
        organizationSort.value.ascending = true;
    }
}

const organizationFilterModel = ref({
    title: null,
});

const loadOrganizationData = (filterOptions, sortOptions, pageOptions) => {
    const queryParams = {
        limit: pageOptions.limit,
        page: pageOptions.page
    };

    if (filterOptions.title !== null && filterOptions.title.length > 0) {
        queryParams.title = filterOptions.title;
    }

    if (sortOptions.field !== null && sortOptions.field.length > 0) {
        queryParams.orderBy = sortOptions.field;

        if (!sortOptions.ascending) {
            queryParams.isDescending = true;
        }
    }
    service.getAllDeletedOrganizations(queryParams).then((data) => {
        organizations.value = data.organizations;
        organizationTablePageSize.value = data.pageSize
        totalOrganizations.value = data.total
    });
}

const organizationFilterChange = (inputEvent) => {
    if (inputEvent.data === null) {
        loadOrganizationData(organizationFilterModel.value, organizationSort.value, organizationPage.value);
    }
    else if (inputEvent.target.value.length >= 3) {
        loadOrganizationData(organizationFilterModel.value, organizationSort.value, organizationPage.value);
    }
}

const onOrganizationPage = (event) => {
    organizationPage.value.limit = event.rows;
    organizationPage.value.page = event.page + 1;

    loadOrganizationData(organizationFilterModel.value, organizationSort.value, organizationPage.value);
}


const documents = ref([]);
const documentTablePageSize = ref(25);
const totalDocuments = ref(0);

const documentFilterModel = ref({
    title: null,
    registeredNumber: null,
    documentTypeId: -1,
    dateinterval: null
});

const documentPage = ref({
    limit: documentTablePageSize.value,
    page: 1
});

const documentSort = ref({
    field: '',
    ascending: true
});

const now = new Date();

const formatDate = (date) => {
    try {
        const minutes = now.getTimezoneOffset();
        const fixed = date.getTime() - minutes * 60 * 1000;

        return new Date(fixed).toISOString().slice(0, 10);
    }
    catch {
        return date;
    }
}

const onDocumentSort = (event) => {
    if (event.sortField !== null) {
        documentSort.value.field = event.sortField;

        if (event.sortOrder < 0) {
            documentSort.value.ascending = false;
        }
        else {
            documentSort.value.ascending = true;
        }
        loadDocuments();
    }
    else {
        documentSort.value.field = event.sortField;
        documentSort.value.ascending = true;
    }
}

const onDocumentPage = (event) => {
    documentPage.value.limit = event.rows;
    documentPage.value.page = event.page + 1;

    loadDocuments();
}

const documentFilterChange = (inputEvent) => {
    if (inputEvent.data === null) {
        loadDocuments();
    }
    else if (inputEvent.target.value.length >= 3) {
        loadDocuments();
    }
}

const loadDocuments = () => {
    loadDocumentData(documentFilterModel.value, documentSort.value, documentPage.value);
}

const loadDocumentData = (filterOptions, sortOptions, pageOptions) => {
    const queryParams = {
        limit: pageOptions.limit,
        page: pageOptions.page
    };

    if (filterOptions.title !== null && filterOptions.title.length > 0) {
        queryParams.title = filterOptions.title;
    }

    if (filterOptions.registeredNumber !== null && filterOptions.registeredNumber.length > 0) {
        queryParams.registeredNumber = filterOptions.registeredNumber;
    }

    if (filterOptions.documentTypeId !== null && filterOptions.documentTypeId !== -1) {
        queryParams.documentTypeId = filterOptions.documentTypeId;
    }

    if (filterOptions.dateinterval !== null && filterOptions.dateinterval[0] !== null) {
        queryParams.startDate = formatDate(filterOptions.dateinterval[0])

        if (filterOptions.dateinterval[1] !== null) {
            queryParams.endDate = formatDate(filterOptions.dateinterval[1]);
        } else {
            queryParams.endDate = formatDate(now);
        }

    }

    if (sortOptions.field !== null && sortOptions.field.length > 0) {
        queryParams.orderBy = sortOptions.field;

        if (!sortOptions.ascending) {
            queryParams.isDescending = true;
        }
    }
    service.getAllDeletedDocuments(queryParams).then((data) => {
        documents.value = data.documents;
        documentTablePageSize.value = data.pageSize
        totalDocuments.value = data.total
    });
}


const op = ref();
const auditInfo = ref(null);

/**
 * 
 * @param {string} typeName 
 * @param id 
 */
const revert = (event, typeName, id) => {
    confirm.require({
        target: event.currentTarget,
        message: `Ma'lumotlarni tiklamoqchimisiz`,
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
        acceptClass: 'p-button-sm',
        rejectLabel: 'Bekor qilish',
        acceptLabel: 'Tiklash',
        accept: () => {
            if (typeName.includes('document')) {
                service.restoreDocument(id)
                    .then(() => {
                        documents.value = documents.value.filter((doc) => doc.id != id);

                        toast.add({ severity: 'success', summary: `Muvaqqiyatli`, detail: `Ma'lumotlar tiklandi`, life: 3000 });
                    });
            }

            if (typeName.includes('organization')) {
                service.restoreOrganization(id)
                    .then(() => {
                        organizations.value = organizations.value.filter((org) => org.id != id);

                        toast.add({ severity: 'success', summary: `Muvaqqiyatli`, detail: `Ma'lumotlar tiklandi`, life: 3000 });
                    });
            }

            if (typeName.includes('user')) {
                service.restoreUser(id)
                    .then(() => {
                        users.value = users.value.filter((user) => user.id != id);

                        toast.add({ severity: 'success', summary: `Muvaqqiyatli`, detail: `Ma'lumotlar tiklandi`, life: 3000 });
                    });
            }

        },

    });
}

const showAuditInfo = (event, typeName, id) => {
    if (auditInfo.value == null || auditInfo.value.id != id || auditInfo.value.type != typeName) {
        auditInfo.value = {
            type: typeName,
            id: id
        }

        if (typeName.includes('document')) {
            service.getDeletedDocumentAuditInfo(id)
                .then((data) => {
                    auditInfo.value.deletedBy = data.deletedBy;
                    auditInfo.value.deletedByFullName = data.deletedByFullName;
                    auditInfo.value.deletedAt = data.deletedAt;
                });
        }
        else if (typeName.includes('organization')) {
            service.getDeletedOrganizationAuditInfo(id)
                .then((data) => {
                    auditInfo.value.deletedBy = data.deletedBy;
                    auditInfo.value.deletedByFullName = data.deletedByFullName;
                    auditInfo.value.deletedAt = data.deletedAt;
                });
        }
        else if (typeName.includes('user')) {
            service.getDeletedUserAuditInfo(id)
                .then((data) => {
                    auditInfo.value.deletedBy = data.deletedBy;
                    auditInfo.value.deletedByFullName = data.deletedByFullName;
                    auditInfo.value.deletedAt = data.deletedAt;
                });
        }
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
                <h2>Korxonalar</h2>
                <DataTable ref="dt" :value="organizations" dataKey="id" :paginator="true"
                    :rows="organizationTablePageSize" :totalRecords="totalOrganizations" removableSort lazy
                    @page="onOrganizationPage($event)" @sort="onOrganizationSort($event)"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">O'chilgan ma'lumotlar</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText @input="organizationFilterChange($event)" class="w-full sm:w-auto"
                                    v-model="organizationFilterModel.title" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <Column field="title" header="Tashkilot nomi" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            {{ slotProps.data.title }}
                        </template>
                    </Column>
                    <Column field="physicalIdentity" header="Identifikatsiya" :sortable="true"
                        headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Identifikatsiya</span>
                            {{ slotProps.data.physicalIdentity }}
                        </template>
                    </Column>
                    <Column field="details" header="Qo'shimcha ma'lumot" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Qo'shimcha ma'lumot</span>
                            {{ slotProps.data.details ?? "Qo'shimcha ma'lumot yo'q" }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem; width: 10%">
                        <template #body="slotProps">
                            <Button icon="pi pi-undo" severity="primary" rounded
                                @click="revert($event, 'organization', slotProps.data.id)" />
                            <Button icon="pi pi-info-circle" class="mt-2 mx-1" severity="info" rounded
                                @click="showAuditInfo($event, 'organization', slotProps.data.id)" />

                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-12">
            <div class="card">
                <h2>Xodimlar</h2>
                <DataTable ref="dt" :value="users" dataKey="id" :paginator="true" :rows="userTablePageSize" lazy
                    :total-records="totalUsers" @page="onUserPage($event)" @sort="onUserSort($event)" removable-sort
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">O'chirilgan ma'lumotlar</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText @input="userFilterChange($event)" class="w-full sm:w-auto"
                                    v-model="userFilterModel.keyword" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

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

                    <Column headerStyle="min-width:8rem; width: 10%">
                        <template #body="slotProps">
                            <Button icon="pi pi-undo" class="mt-2" severity="primary" rounded
                                @click="revert($event, 'user', slotProps.data.id)" />
                            <Button icon="pi pi-info-circle" class="mt-2 mx-1" severity="info" rounded
                                @click="showAuditInfo($event, 'user', slotProps.data.id)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-12">
            <div class="card">
                <h2>Hujjatlar</h2>
                <DataTable removableSort :value="documents" dataKey="id" paginator lazy @page="onDocumentPage($event)"
                    @sort="onDocumentSort($event)" :rows="documentTablePageSize" :total-records="totalDocuments">
                    <template #empty>
                        <div class="p-3 lg:p-6">
                            <h1 class="md:text-center text-2xl lg:text-5xl">Hujjatlar topilmadi...</h1>
                        </div>
                    </template>
                    <template #loading>
                        Ma'lumotlar yuklanmoqda...
                    </template>
                    <Column field="title" sortable>
                        <template #header>
                            <div class="flex flex-column justify-content-end">
                                <span class="mb-1">
                                    Hujjat nomi
                                </span>
                                <InputText @input="documentFilterChange($event)" v-model="documentFilterModel.title"
                                    placeholder="Hujjat nomidagi 3ta harfni kiriting"></InputText>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <div class="flex align-items-center gap-1">
                                <span style="width: 85%; word-break:break-all" class="text-xl">
                                    {{ slotProps.data.title }}
                                </span>
                            </div>
                        </template>
                    </Column>
                    <Column sortable field="registeredNumber">
                        <template #header>
                            <div class="flex flex-column">
                                <span class="mb-1">
                                    Ro'yhatga olingan raqami
                                </span>
                                <InputText @input="documentFilterChange($event)"
                                    v-model="documentFilterModel.registeredNumber"
                                    placeholder="Hujjat raqamidagi 3ta harfni kiriting"></InputText>
                            </div>
                        </template>
                    </Column>
                    <Column style="min-width: 18rem;" sortable field="registeredDate">
                        <template #header>
                            <div class="flex flex-column">
                                <span class="mb-1">
                                    Qabul qilingan sana
                                </span>
                                <Calendar @hide="loadDocuments" v-model="documentFilterModel.dateinterval"
                                    :max-date="now" selectionMode="range" showButtonBar :manualInput="false"
                                    placeholder="Qabul qilingan sana oralig'i" />
                            </div>
                        </template>
                    </Column>
                    <Column style="min-width: 8rem;" field="documentTypeId">
                        <template #header>
                            <div class="flex flex-column">
                                <span class="mb-1">
                                    Hujjat turi
                                </span>
                                <Dropdown @change="loadDocuments" v-model="documentFilterModel.documentTypeId"
                                    :options="documentTypes" optionValue="id" optionLabel="title" />
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ documentTypes.find(docT => docT.id == slotProps.data.documentTypeId).title }}
                        </template>
                    </Column>
                    <Column>
                        <template #header>
                            <span>
                                Maxfiyligi
                            </span>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.isPrivate ? "Yashirin" : "Ochiq" }}
                        </template>
                    </Column>
                    <Column style="min-width: 100px" class="px-0">
                        <template #body="slotProps">
                            <Button icon="pi pi-undo" severity="primary" rounded
                                @click="revert($event, 'document', slotProps.data.id)" />
                            <Button icon="pi pi-info-circle" class="mx-1 mt-2" severity="info" rounded
                                @click="showAuditInfo($event, 'document', slotProps.data.id)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <OverlayPanel ref="op">
        <div class="flex flex-column">
            <span>Kim tominidan o'chirilgan: {{ auditInfo.deletedByFullName ?? `Ma'lumot yo'q` }}</span>
            <span>Qachon o'chirilgan: {{ formatDateTime(auditInfo.deletedAt) }}</span>
        </div>
    </OverlayPanel>
    <ConfirmPopup></ConfirmPopup>
</template>
