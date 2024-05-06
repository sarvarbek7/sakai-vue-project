<script setup>
import { DocumentService } from '@/service/DocumentService';
import { ref, onMounted } from 'vue'

onMounted(() => {
    documentService.getDocumentTypes()
        .then(docTypes => {
            documentTypes.value = docTypes.documentTypes;
            documentTypes.value.push({
                id: -1,
                title: 'Barchasi'
            })
        });

    loadDocuments();
})

const documents = ref([]);
const documentTypes = ref([]);
const pageSize = ref(25);
const totalRecords = ref(0);
const documentService = new DocumentService();

const filterModel = ref({
    title: null,
    registeredNumber: null,
    documentTypeId: -1,
    dateinterval: null
});

const page = ref({
    limit: pageSize.value,
    page: 1
});

const sort = ref({
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

const onSort = (event) => {
    if (event.sortField !== null) {
        sort.value.field = event.sortField;

        if (event.sortOrder < 0) {
            sort.value.ascending = false;
        }
        else {
            sort.value.ascending = true;
        }
        loadDocuments();
    }
    else {
        sort.value.field = event.sortField;
        sort.value.ascending = true;
    }
}

const onPage = (event) => {
    page.value.limit = event.rows;
    page.value.page = event.page + 1;

    loadDocuments();
}

const filterChange = (inputEvent) => {
    if (inputEvent.data === null) {
        loadDocuments();
    }
    else if (inputEvent.target.value.length >= 3) {
        loadDocuments();
    }
}

const loadDocuments = () => {
    loadData(filterModel.value, sort.value, page.value);
}

const loadData = (filterOptions, sortOptions, pageOptions) => {
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
    documentService.getDocuments(queryParams).then((data) => {
        documents.value = data.documents;
        pageSize.value = data.pageSize
        totalRecords.value = data.total
    });
}

const op = ref();
const auditInfo = ref(null);

const showAuditInfo = (event, id) => {
    if (auditInfo.value == null || auditInfo.value.id != id) {
        documentService.getAuditDetailsById(id)
            .then(data => {
                auditInfo.value = data;
                auditInfo.value.id = id;
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
                <DataTable removableSort :value="documents" dataKey="id" paginator lazy @page="onPage($event)"
                    @sort="onSort($event)" :rows="pageSize" :total-records="totalRecords">
                    <template #empty>
                        <div class="p-6">
                            <h1 class="lg:text-center text-2xl lg:text-5xl">Hujjatlar topilmadi...</h1>
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
                                <InputText @input="filterChange($event)" v-model="filterModel.title"
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
                                <InputText @input="filterChange($event)" v-model="filterModel.registeredNumber"
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
                                <Calendar @hide="loadDocuments" v-model="filterModel.dateinterval" :max-date="now"
                                    selectionMode="range" showButtonBar :manualInput="false"
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
                                <Dropdown @change="loadDocuments" v-model="filterModel.documentTypeId"
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
                            <Button icon="pi pi-info-circle" class="ml-1 mt-2" severity="info" rounded
                                @click="showAuditInfo($event, slotProps.data.id)" />
                        </template>
                    </Column>
                </DataTable>
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
