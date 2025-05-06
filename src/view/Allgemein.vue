<script setup>
import { inject, onMounted, ref, watch } from 'vue';
import { useGridConfigAllgemein } from '@/helper/ViewDataConfigWorktimesheet.js';
import {registerDblClick, reloadNode, setFontSize} from '@/helper/gridUtils.js';
import ViewButtons from '@/components/ViewButtons.vue';
import {Log} from "@/helper/Logger.js";
import {useToast} from "primevue/usetoast";
const toast = useToast();

const gridRefAllgemein = ref(null);
const localGridReference = ref(null);
const scrollHeight = inject('scrollHeight');
const gridConfigAllgemein = ref(useGridConfigAllgemein(scrollHeight));

const dblClickCallback = (record) => {
  Log.logDebug('DataEditor', 'callback', record.id);
  if (record && record.id) {
    reloadNode (gridConfigAllgemein, record.id)
  }
};

onMounted(() => {
  setFontSize(gridRefAllgemein, 14, 18); // set font size for grid
  localGridReference.value = gridRefAllgemein.value; // get a reference to the grid itself in order to allow to use it in child components
  registerDblClick(localGridReference, dblClickCallback);

});
</script>

<template>
  <h3>Bryntum Tree Node Issue</h3>
  <ViewButtons
      :grid="localGridReference"
      :gridConfig="gridConfigAllgemein"
      filter-property="nodeLabel"
      :collapsable="true"
      :showErfassen="false"
      :tooltip="'Suche in den Feldern Name, Personalnummer, Auftragsnummer und Team'"
      :allowUnpriviledgedDownload="false"
  />

  <div :style="{ height: scrollHeight }">
    <bryntum-grid ref="gridRefAllgemein" v-bind="gridConfigAllgemein" />
  </div>
</template>
