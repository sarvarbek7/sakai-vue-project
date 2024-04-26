<script setup>
import { ref, onMounted } from 'vue';
import { usePrimeVue } from 'primevue/config';
import { useToast } from "primevue/usetoast";
import { DocumentService } from '@/service/DocumentService';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';


const $primevue = usePrimeVue();
const toast = useToast();
const router = useRouter();
const organizationId = ref(router.currentRoute.value.params.id);

const documentService = new DocumentService();
const storedDocuments = ref([]);
const pageSize = ref(25);
const totalRecords = ref(0);
const filters = ref({
    'name': {value: '', matchMode: 'contains'},
    'country.name': {value: '', matchMode: 'contains'},
    'company': {value: '', matchMode: 'contains'},
    'representative.name': {value: '', matchMode: 'contains'},
});

onMounted(() => {
    documentService.getDocumentTypes()
        .then(docTypes => {
            documentTypes.value = docTypes.documentTypes;
        });

    documentService.getOrganizationDocuments(organizationId.value, {
        limit: pageSize.value
    })
        .then(data => {
            storedDocuments.value = data.documents;
            pageSize.value = data.pageSize
            totalRecords.value = data.total
        }
        );
});

const totalSize = ref(0);
const totalSizePercent = ref(0);
const files = ref([]);
const documents = ref([])
const documentTypes = ref([]);
const now = new Date();
const todayDateOnlyAsString = `${now.getFullYear().toString()}-${now.getMonth().toString().padStart(2, 0)}-${now.getDay().toString().padStart(2, 0)}`;
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

        documents.value.push({
            documentTypeId: documentTypes.value[0].id,
            title: getFileNameWithoutExtionsion(file.name),
            registeredDate: todayDateOnlyAsString,
            registeredNumber: ''
        });
    });
};

const uploadEvent = (callback) => {
    totalSizePercent.value = totalSize.value / 10;

    const request = {
        userId: JSON.parse(localStorage.getItem('user')).id,
        organizationId: organizationId.value,
        documents: documents.value,
        files: files.value
    };

    documentService.uploadDocuments(request)
        .then(() => {
            Swal.fire({title: "Hujjatlar yuklandi.", icon: "success"})
            callback();
            totalSize.value = 0;
            totalSizePercent.value = 0;
            documents.value = [];
        });
};



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
</script>

<template>
    <div class="card">
        <Toast />
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
                    <ProgressBar :value="totalSizePercent" :showValue="false"
                        :class="['md:w-20rem h-1rem w-full md:ml-auto', { 'exceeded-progress-bar': totalSizePercent > 100 }]">
                        <span class="white-space-nowrap">{{ totalSize }}B / 1Mb</span>
                    </ProgressBar>
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
                                    v-model="documents[index].registeredDate" />
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
</template>
