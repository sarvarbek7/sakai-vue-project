<script setup>
import { ref } from "vue";

const data = ref({
    label: 'Uzrailways',
    children: [
        {
            label: 'Das Uty',
            children: [
                {
                    label: 'Enakl'
                },
                {
                    label: 'Exodim',
                    children: [
                        {
                            label: 'Das Uty',
                            children: [
                                {
                                    label: 'Enakl'
                                },
                                {
                                    label: 'Exodim',
                                    children: [
                                        {
                                            label: 'Janubiy'
                                        },
                                        {
                                            label: 'Shimoliy',

                                        }
                                    ]
                                }
                            ]
                        },]
                }
            ]
        },
        {
            label: 'Vokzallar',
            children: [
                {
                    label: 'Janubiy'
                },
                {
                    label: 'Shimoliy',

                }
            ]
        }
    ]
});
</script>


<template>
    <div class="card overflow-x-auto">
        <OrganizationChart :value="data">
            <template #default="slotProps">
                <span>{{ slotProps.node.label }}</span>
            </template>
        </OrganizationChart>
    </div>
</template>