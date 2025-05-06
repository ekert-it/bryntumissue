<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { SearchFilter } from '@/helper/SearchFilter';
import { Log } from '@/helper/Logger';
import { MAX_SELECT } from '@/helper/apiConfig';
import {loadStore} from "@/helper/gridUtils.js";

const props = defineProps({
    grid: Object,
    gridConfig: Object,
    filterProperty: String,
    collapsable: Boolean,
    tooltip: String,
    minLength: Number,
    denyEmpty: Boolean,
    hideElements: Boolean,
    showErfassen: Boolean,
    allowUnpriviledgedDownload: Boolean,
    createButtonTitle: String,
    createButtonTooltip: String,
    dataType: String,
    permitButtonName: String,
    permitButtonTooltip: String,
    permitButtonViewIdentifier: String
});

const emit = defineEmits(['getValid']);
const minlen = ref(props.minLength ? props.minLength : 3);

const updateValid = () => {
    calcValid();
    emit('getValid', valid.value, suchfeld.value, 0);
    Log.logDebug('updateValid in ViewButtons', valid.value, suchfeld.value);
};

const calcValid = () => {
    const allowEmpty = (!suchfeld.value || suchfeld.value.length === 0) && !props.denyEmpty;
    const min = props.minLength ? props.minLength : 3;
    if (allowEmpty || (suchfeld.value && suchfeld.value.length >= min)) {
        valid.value = true;
        return true;
    }
    valid.value = false;
    return false;
};

const localGridReference = ref(null);
const localGridConfig = ref(props.gridConfig);

const toast = useToast();
const suchfeld = ref(null);
const suchFilter = ref(null);
const valid = ref(true);


watch(suchfeld, (newValue) => {
    calcValid();
    if (suchFilter.value && valid.value) {
        suchFilter.value.updateFilter(newValue);
    }
});

// expands all selected rows; gridReference is a ref to the grid instance
// returns false if no rows are selected
const expandSelected = (gridReference, removeSelection = true) => {
    if (!gridReference.value || !gridReference.value.instance || !gridReference.value.instance.value) {
        return;
    }
    const gr = gridReference.value.instance.value;
    const selected = gr.selectedRecords;
    if (selected.length === 0) {
        return false;
    }
    if (selected.length > MAX_SELECT) {
        toast.add({
            severity: 'error',
            summary: 'Die Auswahl ist zu groß.',
            detail: `Bitte wählen Sie ${MAX_SELECT} oder weniger Elemente aus, die Sie gleichzeitig öffnen.`,
            life: 10000
        });
        gr.selectedRecords = [];
        return true;
    }
    for (let i = 0; i < selected.length; i++) {
        gr.expand(selected[i]);
    }
    if (removeSelection) {
        gr.selectedRecords = [];
    }
    return true;
};

const collapseAll = (gridReference) => {
    if (!gridReference.value || !gridReference.value.instance || !gridReference.value.instance.value) {
        return;
    }
    const gr = gridReference.value.instance.value;
    gr.collapseAll();
};

watch(
    () => props.grid,
    (newVal) => {
        //the Bryntum grid in the parent component only later pushes in its value. so wee need to wait for this.
        //we store the grid reference in a local ref to be able to use it in the methods
        localGridReference.value = newVal;
        suchFilter.value = new SearchFilter(props.filterProperty, localGridConfig, suchfeld);
        suchFilter.value.initializeFilter(); // sync suchfeld with filter of store in  gridConfig[Allgemein]
        calcValid();
    }
);

const doRefresh = () => {
    if (suchFilter.value) {
        toast.add({
            severity: 'info',
            summary: 'Daten werden neu geladen',
            detail: 'Die Daten werden anhand des aktuellen Suchbegriffs neu geladen...',
            life: 2000
        });
      loadStore(localGridConfig, null, true);
    }
};

</script>

<template>
<p>Enter your search key here. With a short delay (500ms) our SearchFilter callback will fire an tell the Bryntum Store to send a filter request to the backend.<br /><br />
  @See <code>watch(suchfeld, (newValue)) </code>in component @/components/ViewButtons.<br />
  @See <code>updateFilter (newValue) </code>in @/helper/SearchFilter.js<br /></p>
  <div class="flex items-center space-x-4 mt-5 pb-2">
        <!-- Search Field -->
        <div class="flex-shrink-0 w-[20%]">
            <FloatLabel variant="on" class="w-full">
                <IconField iconPosition="left" class="mb-2">
                    <InputIcon class="pi pi-search p-0" />
                    <InputText id="searchfield" class="w-full" type="text" v-model="suchfeld" v-tooltip="tooltip" :invalid="valid === false" @input="updateValid" />
                </IconField>
                <label for="searchfield" v-if="!valid">
                    <span style="color: red !important">Mindestens {{ minlen }} Zeichen!</span>
                </label>
                <label for="searchfield" v-if="valid === true">Searchkey</label>
            </FloatLabel>
        </div>

        <!-- Buttons Group -->
        <div class="flex space-x-2">
          <Button icon="pi pi-refresh primary-500" outlined class="mb-2 mr-2" style="width: 231px;" title="Daten für die Ansicht neu laden." @click="doRefresh">Reload Store</Button>
        </div>

    </div>
</template>
<style scoped>
</style>
