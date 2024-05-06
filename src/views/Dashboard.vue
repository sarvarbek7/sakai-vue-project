<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import {useRouter} from 'vue-router';
import { DocumentService } from '@/service/DocumentService';
import { useLayout } from '@/layout/composables/layout';
import { StatisticsService } from '@/service/StatisticsService';

const now = new Date();
const router = useRouter();

const year = ref(now.getFullYear());
const years = ref([]);
const annualReport = ref(null);
const docTypes = ref([]);
const railwaySubordinates = ref([]);

const yearChanged = () => {
    statisticsService.getAnnualReport(year.value)
        .then(data => {
            annualReport.value = data;
            changeLineData(annualReport.value);
        })
}

for (let y = 2020; y <= now.getFullYear(); y++) {
    const option = {};
    option.year = y;
    option.presentation = y.toString();

    years.value.push(option);
}

const { isDarkTheme } = useLayout();
function getRandomColor() {
    // Generates a random integer between 0 and 255
    const randomHex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');

    // Concatenates three random hex numbers
    return `#${randomHex()}${randomHex()}${randomHex()}`;
}


const changeLineData = (report) => {
    lineData.datasets = [];
    docTypes.value.forEach(docType => {
        const data = [];
        for (let month = 1; month <= 12; month++) {
            const monthReport = report.find(entry => {
                return entry.monthOrder == month &&
                    entry.documentTypeId == docType.id;
            });

            if (monthReport !== undefined) {
                data.push(monthReport.count);
            } else {
                data.push(0);
            }
        }

        lineData.datasets.push(
            {
                label: docType.title,
                data: data,
                fill: false,
                backgroundColor: getRandomColor(),
                borderColor: getRandomColor(),
                tension: 0.4
            }
        )
    });
}

const lineData = reactive({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [
        // {
        //     label: 'First Dataset',
        //     data: [65, 59, 80, 81, 56, 55, 40, 59, 80, 81, 56, 55],
        //     fill: false,
        //     backgroundColor: '#2f4860',
        //     borderColor: '#2f4860',
        //     tension: 0.4
        // },
        // {
        //     label: 'Second Dataset',
        //     data: [28, 48, 40, 19, 86, 27, 80, 81, 56, 55, 40, 59],
        //     fill: false,
        //     backgroundColor: '#00bb7e',
        //     borderColor: '#00bb7e',
        //     tension: 0.4
        // }
    ]
});

const lineOptions = ref(null);
const documentService = new DocumentService();
const recentDocuments = ref([]);
const statisticsService = new StatisticsService();

const generalStat = ref({
    documentsCount: 0,
    organizationsCount: 0,
    downloadsCount: 0
});

onMounted(() => {
    documentService.getDocuments({
        limit: 10
    }).then((data) => {
        recentDocuments.value = data.documents;
    });

    documentService.getDocumentTypes()
        .then(data => {
            docTypes.value = data.documentTypes;
            statisticsService.getAnnualReport(year.value)
                .then(data => {
                    annualReport.value = data;
                    changeLineData(annualReport.value);
                })
        })

    statisticsService.getGeneralStatistics()
        .then(data => {
            generalStat.value = data;
        });
    const uzrailwaysId = 1;

    statisticsService.getOrganizationStatistics(uzrailwaysId)
        .then(data => {
            railwaySubordinates.value = data.subordinates;
            railwaySubordinates.value.forEach(sub => {
                sub.isExpanded = false;
                sub.isFetched = false;
            });
        });


});

const downloadDocumentLink = (id) => {
    return `${documentService.apiendpoint}/download?id=${id}`
}

const applyLightTheme = () => {
    lineOptions.value = {
        plugins: {
            legend: {
                labels: {
                    color: '#495057'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            },
            y: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            }
        }
    };
};

const applyDarkTheme = () => {
    lineOptions.value = {
        plugins: {
            legend: {
                labels: {
                    color: '#ebedef'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#ebedef'
                },
                grid: {
                    color: 'rgba(160, 167, 181, .3)'
                }
            },
            y: {
                ticks: {
                    color: '#ebedef'
                },
                grid: {
                    color: 'rgba(160, 167, 181, .3)'
                }
            }
        }
    };
};

watch(
    isDarkTheme,
    (val) => {
        if (val) {
            applyDarkTheme();
        } else {
            applyLightTheme();
        }
    },
    { immediate: true }
);

const expanded = (subordinate) => {
    if (subordinate.isExpanded) {
        subordinate.isExpanded = false;
    }
    else {
        if (!subordinate.isFetched) {
            statisticsService.getOrganizationStatistics(subordinate.id)
                .then(data => {
                    subordinate.subordinates = data.subordinates;
                    subordinate.subordinates.forEach(sub => {
                        sub.isExpanded = false;
                        sub.isFetched = false;
                    });
                });
            subordinate.isFetched = true;
        }
        subordinate.isExpanded = true;
    }
}
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-12 xl:col-4">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Hujjatlar</span>
                        <div class="text-900 font-medium text-3xl">{{ generalStat.documentsCount }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-file-word text-cyan-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-4">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Korxonalar</span>
                        <div class="text-900 font-medium text-3xl">{{ generalStat.organizationsCount }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-sitemap text-blue-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-4">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Yuklab olingan hujjatlar soni</span>
                        <div class="text-900 font-medium text-3xl">{{ generalStat.downloadsCount }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-download text-purple-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12">
            <div class="card">
                <h5 class="m-0">SOʻNGGI JOYLASHTIRILGAN HUJJATLAR</h5>
                <DataTable :value="recentDocuments">
                    <Column style="width: 40%; min-width: 12rem" field="title" header="Hujjat nomi">
                        <template #body="slotProps">
                            <div class="flex align-items-center gap-1" v-if="!slotProps.data.isPrivate">
                                <span style="width: 90%; word-break:break-all" class="text-xl">
                                    {{ !slotProps.data.isPrivate ? slotProps.data.title : 'Maxfiy' }}
                                </span>
                                <a v-if="!slotProps.data.isPrivate" style="color: rgb(16, 185, 129)" :href="downloadDocumentLink(slotProps.data.id)">
                                    <i class="pi pi-download" style="font-size: 1.5rem;"></i>
                                </a>
                            </div>
                            <div v-else>
                                <span style="color: red;" class="text-2xl">
                                    Maxfiy
                                </span>
                            </div>
                        </template>
                    </Column>
                    <Column style="width: 14%" field="registeredDate" header="Qabul qilingan sana"></Column>
                    <Column style="width: 14%" field="registeredNumber" header="Ro'yhatga olingan raqami"></Column>
                    <Column style="width: 14%" field="documentType.title" header="Hujjat turi"></Column>
                </DataTable>
                <div class="flex mt-2 justify-content-end">
                    <Button @click="router.push({name: 'documents'})" class="p-2 px-4 text-xl" label="Barchasi" />
                </div>
            </div>
        </div>
        <div class="col-12">
            <div class="card">
                <h4 class="m-0">Korxonalar kesimida</h4>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-primary">
                            <tr>
                                <th style="width: 60;">Korxona nomi</th>
                                <th v-for="docType in docTypes" :key="docType.id">
                                    {{ docType.title }}
                                </th>
                                <th style="border: 0;">Jami</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="subordinate in railwaySubordinates" :key="subordinate.id">
                                <tr class="outer">
                                    <td>
                                        <Button @click="expanded(subordinate)" class="p-0"
                                            style="width: 16px; border-radius: 0"
                                            :icon="!subordinate.isExpanded ? 'pi pi-plus' : 'pi pi-minus'"
                                            severity="secondary"></Button>
                                        {{ subordinate.title }}
                                    </td>
                                    <td v-for="docType in docTypes" :key="docType.id">
                                        {{ subordinate.countByDocType.find(t => t.documentTypeId == docType.id).count }}
                                    </td>
                                    <td>{{ subordinate.countByDocType.reduce((acc, item) => acc + item.count, 0) }}</td>
                                </tr>
                                <template v-if="subordinate.isExpanded">
                                    <template
                                        v-if="subordinate.subordinates !== undefined && subordinate.subordinates.length > 0">
                                        <template v-for="sub in subordinate.subordinates" :key="sub.id">
                                            <tr class="inner">
                                                <td>
                                                    <Button @click="expanded(sub)" class="ml-4 p-0"
                                                        style="width: 16px; border-radius: 0"
                                                        :icon="!sub.isExpanded ? 'pi pi-plus' : 'pi pi-minus'"
                                                        severity="secondary"></Button>
                                                    {{ sub.title }}
                                                </td>
                                                <td v-for="docType in docTypes" :key="docType.id">
                                                    {{ sub.countByDocType.find(t => t.documentTypeId ==
                                                        docType.id).count }}
                                                </td>
                                                <td>{{ sub.countByDocType.reduce((acc, item) => acc +
                                                    item.count, 0) }}</td>
                                            </tr>
                                            <template v-if="sub.isExpanded">
                                                <template
                                                    v-if="sub.subordinates !== undefined && sub.subordinates.length > 0">
                                                    <tr v-for="last of sub.subordinates" :key="last.id" 
                                                        class="last">
                                                        <td>
                                                            <span class="ml-8 p-0">{{ last.title }}</span>
                                                        </td>
                                                        <td v-for="docType in docTypes" :key="docType.id">
                                                            {{ last.countByDocType.find(t => t.documentTypeId ==
                                                                docType.id).count }}
                                                        </td>
                                                        <td>{{ last.countByDocType.reduce((acc, item) => acc +
                                                            item.count, 0) }}</td>
                                                    </tr>
                                                </template>
                                                <template v-else>
                                                    <span class="pl-8 p-2">Quyi korxona mavjud emas</span>
                                                </template>
                                            </template>
                                        </template>
                                    </template>
                                    <template v-else>
                                        <span class="pl-6 p-2">Quyi korxona mavjud emas</span>
                                    </template>
                                </template>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center gap-1">
                    <h5 class="m-0">Yillik hisobot</h5>
                    <Dropdown @change="yearChanged" v-model="year" :options="years" optionValue="year"
                        optionLabel="presentation"></Dropdown>
                </div>
                <Chart type="bar" :data="lineData" :options="lineOptions" />
            </div>
        </div>
    </div>
</template>

<style scoped>
table {
    border-collapse: collapse;
    font-size: large;
}

th {
    font-weight: 500;
    text-align: start;
    padding: 1.2rem 0.75rem;
    border-right: 1px solid grey;
}

td {
    padding: 1rem;
    border-right: 1px solid #ccc;
}

tr:nth-child(odd of .outer) {}

tr:nth-child(even of .outer) {
    background-color: #15ffee80;
}
</style>