<template>
    <span v-if="iconClass" style="font-size: 1rem; display: flex; justify-content: center; align-items: center;">
        <span :class="iconClass" />
    </span>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { evaluateIconClass } from '@/helper/iconClassEvaluator';

const props = defineProps({
    icon: {
        type: Number,
        required: false
    }
});

const iconNum = ref(props.icon);
const iconClass = ref(null);

onMounted(() => {
    iconClass.value = evaluateIconClass(iconNum.value);
});
</script>