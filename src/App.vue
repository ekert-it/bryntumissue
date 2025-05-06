<script setup>
import Allgemein from './view/Allgemein.vue'
import {computed, onMounted, onUnmounted, provide, ref} from "vue";

function responsiveScrollHeight(offset = 0) {
  const height = ref(window.innerHeight);

  const updateHeight = () => {
    height.value = window.innerHeight;
  };

  onMounted(() => {
    window.addEventListener('resize', updateHeight);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateHeight);
  });

  return computed(() => {
    return `${height.value - offset}px`;
  });
}

provide('scrollHeight', responsiveScrollHeight(200));
</script>

<template>
  <Allgemein />
</template>
<style>
.p-treetable-toggler {
  height: 1rem; /* Set your desired height */
}
.p-treetable-tbody > tr > td {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.p-row-toggler {
  height: 1rem; /* Set your desired height */
}
.colorColumnBold {
  display: flex;
  font-weight: bold;
  white-space: nowrap;
  text-align: center;
}
.colorColumn {
  display: flex;
  font-weight: normal;
  white-space: nowrap;
}

.columnHeader {
  font-weight: normal;
  white-space: normal;
  text-overflow: ellipsis;
  text-transform: none;
}
.cellCenter {
  text-align: center;
}
.b-grid-header .b-grid-header-text {
  text-transform: none;
  white-space: normal;
  padding: 0.2rem 0;
}

.aggregateColumn {
  font-style: italic;
  font-weight: bold;
}
.aggregateColumnHidden {
  display: none;
}
</style>