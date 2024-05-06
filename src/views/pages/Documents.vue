<script setup>
import { ref, onMounted } from 'vue';
import { DocumentService } from '@/service/DocumentService';

onMounted(() => {
    documentService.getDocumentTypes()
        .then(docTypes => {
            documentTypes.value = docTypes.documentTypes;
        });

    documentService.getDocuments({
        limit: pageSize.value
    })
        .then(data => {
            storedDocuments.value = data.documents;
            pageSize.value = data.pageSize
            totalRecords.value = data.total
        });
});

const documentService = new DocumentService();
const now = new Date();
const storedDocuments = ref([])
const documentTypes = ref([]);
const pageSize = ref(25);
const totalRecords = ref(0);

const onPage = (event) => {
    page.value.limit = event.rows;
    page.value.page = event.page + 1;

    documentService.getDocuments({
        limit: event.rows,
        page: event.page + 1
    })
        .then(data => {
            storedDocuments.value = data.documents;
            pageSize.value = data.pageSize
            totalRecords.value = data.total
        });
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
    title: null,
    registeredNumber: null,
    documentTypeId: null,
    dateinterval: null,
});

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

    if (filterOptions.documentTypeId !== null) {
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
        storedDocuments.value = data.documents;
        pageSize.value = data.pageSize
        totalRecords.value = data.total
    });
}

const loadDocuments = () => {
    loadData(filterModel.value, sort.value, page.value);
}

const filterChange = (inputEvent) => {
    if (inputEvent.data === null) {
        loadDocuments();
    }
    else if (inputEvent.target.value.length >= 3) {
        loadDocuments();
    }
}

const downloadDocumentLink = (id) => {
    return `${documentService.apiendpoint}/download?id=${id}`
}

</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h2>Hujjatlar</h2>
                <DataTable removableSort :value="storedDocuments" dataKey="id" paginator lazy @page="onPage($event)"
                    @sort="onSort($event)" :rows="pageSize" :total-records="totalRecords"
                    paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{first} to {last} of {totalRecords}">
                    <template #empty>
                        <div class="p-6">
                            <h1 class="text-center">Hujjatlar topilmadi...</h1>
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
                                    {{ slotProps.data.isPrivate ? 'Maxfiy' : slotProps.data.title }}
                                </span>
                                <a v-if="!slotProps.data.isPrivate" style="color: rgb(16, 185, 129)"
                                    :href="downloadDocumentLink(slotProps.data.id)">
                                    <i class="pi pi-download" style="font-size: 1.5rem;"></i>
                                </a>
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
                    <Column field="downloadCount" header="Yuklab olingan">
                    </Column>

                </DataTable>
            </div>
        </div>
    </div>
</template>