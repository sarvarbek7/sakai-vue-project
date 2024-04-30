<script setup>
import { ref, onMounted } from 'vue';
import { usePrimeVue } from 'primevue/config';
import { DocumentService } from '@/service/DocumentService';
import { useRouter } from 'vue-router';
import { useConfirm } from "primevue/useconfirm";
import { OrganizationService } from '@/service/OrganizationService'
import Swal from 'sweetalert2';
import Column from 'primevue/column';


const $primevue = usePrimeVue();
const router = useRouter();
const organizationId = ref(router.currentRoute.value.params.id);
const organization = ref({});

const documentService = new DocumentService();
const organizationService = new OrganizationService();

const storedDocuments = ref([]);
const pageSize = ref(25);
const totalRecords = ref(0);
const confirm = useConfirm();

const documentVisibilities = ref(
    [
        {
            val: 0,
            label: "Ochiq"
        },
        {
            val: 1,
            label: "Maxfiy"
        }
    ]);

onMounted(() => {
    documentService.getDocumentTypes()
        .then(docTypes => {
            documentTypes.value = docTypes.documentTypes;
        });

    organizationService.getOrganizationById(organizationId.value)
        .then((data) => {
            organization.value = data.organization;
        })
});

const totalSize = ref(0);
const totalSizePercent = ref(0);
const files = ref([]);
const documents = ref([])
const documentTypes = ref([]);
const now = new Date();
const maxDate = ref(new Date());

const getFileNameWithoutExtionsion = (fileName) => {
    const lastIndex =
        fileName.lastIndexOf('.');

    return fileName.substr(0, lastIndex);
}

const iconLocationByExtention = (fileName) => {
    const parts = fileName.split('.');
    const ext = parts[parts.length - 1];

    switch (ext) {
        case 'docx':
        case 'doc':
            return '/icons/word-icon.svg';
        case 'pdf':
            return '/icons/pdf-icon.svg';
        case 'excel':
            return '/icons/excel-icon.svg';
        case 'ppt':
            return '/icons/ppt-icon.svg';
        case 'zip':
            return '/icons/zip-icon.svg';
        default:
            return '/icons/txt-icon.svg'
    }
}

const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
    removeFileCallback(index);
    totalSize.value -= parseInt(formatSize(file.size));
    totalSizePercent.value = totalSize.value / 10;
    documents.value = documents.value.filter((doc, ind) => ind !== index);
};

const onClearTemplatingUpload = (clear) => {
    clear();
    totalSize.value = 0;
    totalSizePercent.value = 0;
    documents.value = [];
};

const onSelectedFiles = (event) => {
    files.value = event.files;
    files.value.forEach((file) => {
        totalSize.value += parseInt(formatSize(file.size));

        console.log(now);
        documents.value.push({
            documentTypeId: documentTypes.value[0].id,
            title: getFileNameWithoutExtionsion(file.name),
            registeredDate: now,
            registeredNumber: '',
            isPrivate: false
        });
    });
};

const uploadEvent = (callback) => {
    totalSizePercent.value = totalSize.value / 10;

    documents.value.forEach(doc => {
        doc.registeredDate = formatDate(doc.registeredDate);
    })

    const request = {
        userId: JSON.parse(localStorage.getItem('user')).id,
        organizationId: organizationId.value,
        documents: documents.value,
        files: files.value
    };

    documentService.uploadDocuments(request)
        .then(() => {
            Swal.fire({ title: "Hujjatlar yuklandi.", icon: "success" })
            callback();
            totalSize.value = 0;
            totalSizePercent.value = 0;
            documents.value = [];
        }).catch(() => {
            Swal.fire({ title: "Hujjatlar yuklashda xatolik sodir bo'ldi.", icon: "error" })
        })
};

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


const formatSize = (bytes) => {
    const k = 1024;
    const dm = 3;
    const sizes = $primevue.config.locale.fileSizeTypes;

    if (bytes === 0) {
        return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
};

const showDocumentsTableDialog = ref(false);

const openDocumentsTable = () => {
    showDocumentsTableDialog.value = true;
    selectedDocument.value = null;

    documentService.getOrganizationDocuments(organizationId.value, {
        limit: pageSize.value
    })
        .then(data => {
            storedDocuments.value = data.documents;
            pageSize.value = data.pageSize
            totalRecords.value = data.total
        });

    filterModel.value = {
        title: null,
        registeredNumber: null,
        documentTypeId: null,
        dateinterval: null,
    };
}

const documentEditDialog = ref(false);
const selectedDocument = ref(null);

const showdocumentEditDialog = (id) => {
    documentService.getDocumentById(id)
        .then((data) => {
            selectedDocument.value = data;
            documentEditDialog.value = true;
        });
}

const documentEdit = (event) => {
    confirm.require({
        target: event.target,
        message: `Hujjatni o'zgartirmoqchimisiz?`,
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
        acceptClass: 'p-button-sm',
        rejectLabel: 'Bekor qilish',
        acceptLabel: "O'zgartirish",
        accept: () => {
            selectedDocument.value.registeredDate =
                formatDate(selectedDocument.value.registeredDate);

            documentService.editDocument(selectedDocument.value)
                .then((data) => {
                    Swal.fire({
                        icon: 'success',
                        title: `${data.title} muvaqqiyatli o'zgartirildi`
                    });
                    documentEditDialog.value = false;

                    const index =
                        storedDocuments.value.findIndex(doc => doc.id == data.id);

                    storedDocuments.value[index] = data;
                })
        }
    });
}

const documentDelete = (id) => {
    confirm.require({
        target: event.currentTarget,
        message: `Haqiqatdan ham hujjatni o'chirmoqchimisiz?`,
        icon: 'pi pi-info-circle',
        rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
        acceptClass: 'p-button-danger p-button-sm',
        rejectLabel: 'Bekor qilish',
        acceptLabel: `O'chirish`,
        accept: () => {
            documentService.deleteDocumentById(id)
                .then((data) => {
                    storedDocuments.value =
                        storedDocuments.value.filter(doc => doc.id !== id);
                    Swal.fire(
                        {

                            icon: 'success',
                            text: `${data.title} muvaqqiyatli o'chirildi.`
                        }
                    )
                })
        }
    });
}

const onPage = (event) => {
    page.value.limit = event.rows;
    page.value.page = event.page + 1;

    documentService.getOrganizationDocuments(organizationId.value, {
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

    if (sortOptions.field !== null) {
        queryParams.orderBy = sortOptions.field;

        if (!sortOptions.ascending) {
            queryParams.isDescending = true;
        }
    }
    documentService.getOrganizationDocuments(organizationId.value,
        queryParams).then((data) => {
            storedDocuments.value = data.documents;
            pageSize.value = data.pageSize
            totalRecords.value = data.total
        });
}

const loadDocuments = () => {
    loadData(filterModel.value, sort.value, page.value);
}

const filterChange = (text) => {
    if (text.length > 0) {
        loadDocuments();
    }
}

</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmPopup></ConfirmPopup>
        <FileUpload name="documents[]" :multiple="true" @select="onSelectedFiles" customUpload>
            <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
                <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                    <div class="flex gap-2">
                        <Button @click="chooseCallback()" icon="pi pi-file-pdf" rounded outlined></Button>
                        <Button @click="uploadEvent(uploadCallback)" icon="pi pi-cloud-upload" rounded outlined
                            severity="success" :disabled="!files || files.length === 0"></Button>
                        <Button @click="onClearTemplatingUpload(clearCallback)" icon="pi pi-times" rounded outlined
                            severity="danger" :disabled="!files || files.length === 0"></Button>
                    </div>
                </div>
            </template>
            <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
                <div v-if="files.length > 0">
                    <h5>Pending</h5>
                    <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                        <div v-for="(file, index) of files" :key="file.name + file.type + file.size"
                            class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-2">
                            <div>
                                <img role="presentation" :alt="file.name" :src="iconLocationByExtention(file.name)"
                                    width="100" height="50" />
                            </div>
                            <div class="flex-auto">
                                <label for="title">Hujjat nomi: </label>
                                <InputText class="font-bold" id="title" v-model="documents[index].title" />
                            </div>
                            <div>{{ formatSize(file.size) }}</div>
                            <div class="flex-auto">
                                <label for="registeredDate">Qabul qilingan sana: </label>
                                <Calendar :maxDate="maxDate" id="registeredDate"
                                    v-model="documents[index].registeredDate"
                                    placeholder="Qabul qilingan sanani kiriting" showButtonBar />
                            </div>
                            <div class="flex-auto">
                                <label for="documentType">
                                    Hujjat turi:
                                </label>
                                <Dropdown v-model="documents[index].documentTypeId" :options="documentTypes"
                                    optionValue="id" optionLabel="title" :highlightOnSelect="false"
                                    class="md:w-14rem" />
                            </div>
                            <div class="flex-auto">
                                <label for="registeredNumber">Hujjat raqami: </label>
                                <InputText id="registeredNumber" v-model="documents[index].registeredNumber"
                                    placeholder="Hujjat raqamini kiriting" />
                            </div>
                            <div class="flex-auto">
                                <label for="doc_visib">Maxfiy hujjat uchun katakchani belgilang: </label>
                                <Checkbox id="docVisib" v-model="documents[index].isPrivate" :binary="true" />
                            </div>
                            <Badge value="Pending" severity="warning" />
                            <Button icon="pi pi-times" @click="onRemoveTemplatingFile(file, removeFileCallback, index)"
                                outlined rounded severity="danger" />
                        </div>
                    </div>
                </div>

                <div v-if="uploadedFiles.length > 0">
                    <h5>Completed</h5>
                    <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                        <div v-for="(file, index) of uploadedFiles" :key="file.name + file.type + file.size"
                            class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-3">
                            <div>
                                <img role="presentation" :alt="file.name" :src="iconLocationByExtention(file.name)"
                                    width="100" height="50" />
                            </div>
                            <span class="font-semibold">{{ file.name }}</span>
                            <div>{{ formatSize(file.size) }}</div>
                            <Badge value="Completed" class="mt-3" severity="success" />
                            <Button icon="pi pi-times" @click="removeUploadedFileCallback(index)" outlined rounded
                                severity="danger" />
                        </div>
                    </div>
                </div>
            </template>
            <template #empty>
                <div class="flex align-items-center justify-content-center flex-column">
                    <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                    <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
                </div>
            </template>
        </FileUpload>
    </div>

    <div class="card">
        <div class="flex align-items-center justify-content-center">
            <Button @click="openDocumentsTable" rounded class="p-3 text-2xl">Hujjatlarni ko'rish</Button>
        </div>
    </div>

    <Dialog style="max-width: 1200px" class="w-full" v-model:visible="showDocumentsTableDialog" modal :pt='{
    }'>
        <DataTable removableSort :value="storedDocuments" dataKey="id" paginator lazy @page="onPage($event)"
            @sort="onSort($event)" :rows="pageSize" :total-records="totalRecords">
            <template #empty>
                <div class="p-6">
                    <h1 class="text-center">Hujjatlar topilmadi...</h1>
                </div>
            </template>
            <template #loading>
                Ma'lumotlar yuklanmoqda...
            </template>
            <template #header>
                <h2>{{ organization.title }}</h2>

            </template>
            <Column field="title" sortable>
                <template #header>
                    <div class="flex flex-column justify-content-end">
                        <span class="mb-1">
                            Hujjat nomi
                        </span>
                        <InputText @update:model-value="filterChange" v-model="filterModel.title"
                            placeholder="Hujjat nomidagi 3ta harfni kiriting"></InputText>
                    </div>
                </template>
                <template #body="slotProps">
                    {{ !slotProps.data.isPrivate ? slotProps.data.title : 'Maxfiy' }}
                </template>
            </Column>
            <Column sortable field="registeredNumber">
                <template #header>
                    <div class="flex flex-column">
                        <span class="mb-1">
                            Ro'yhatga olingan raqami
                        </span>
                        <InputText @update:model-value="filterChange" v-model="filterModel.registeredNumber"
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
                        <Dropdown @change="loadDocuments" v-model="filterModel.documentTypeId" :options="documentTypes"
                            optionValue="id" optionLabel="title" />
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
                    <Button @click="showdocumentEditDialog(slotProps.data.id)" rounded icon="pi pi-pencil"
                        severity="primary" />
                    <Button @click="documentDelete(slotProps.data.id)" class="ml-1" rounded icon="pi pi-trash"
                        severity="danger" />
                </template>
            </Column>
        </DataTable>
    </Dialog>

    <Dialog v-model:visible="documentEditDialog" modal>
        <div class="flex flex-column">
            <div class="field">
                <label for="doc_title">Hujjat nomi: </label>
                <InputText class="ml-1" v-model="selectedDocument.title" id="doc_title"></InputText>
            </div>
            <div class="field">
                <label for="doc_number">Ro'yhatga olingan raqami: </label>
                <InputText class="ml-1" v-model="selectedDocument.registeredNumber" id="doc_title"></InputText>
            </div>
            <div class="field">
                <label for="doc_date">
                    Qabul qilingan sana:
                </label>
                <Calendar class="ml-1" dateFormat="yy-mm-dd" v-model="selectedDocument.registeredDate"
                    :max-date="maxDate" placeholder="Qabul qilingan sanani kiriting" showButtonBar />
            </div>
            <div class="field">
                <label for="doc_type">
                    Hujjat turi
                </label>
                <Dropdown class="ml-1" v-model="selectedDocument.documentTypeId" :options="documentTypes"
                    optionValue="id" optionLabel="title">
                </Dropdown>
            </div>
            <div class="field flex">
                <label class="text-lg" for="doc_visiblity">
                    Maxfiy hujjat uchun katakchani belgilang
                </label>
                <Checkbox binary="true" class="ml-1" v-model="selectedDocument.isPrivate" />
            </div>
        </div>
        <Button @click=documentEdit($event) label="O'zgartirish" />
    </Dialog>
</template>
