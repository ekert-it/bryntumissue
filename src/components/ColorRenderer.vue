<!-- Vue renderer component
Displays a colored icon and text -->
-->
<template>
    <div :class="divClass" :style="dynamicStyle">
        <span v-if="iconClass" style="font-size: 1rem; display: flex; justify-content: center; align-items: center;">
            <span :class="iconClass" :style="dynamicStyle" />
        </span>
        {{ text }}
    </div>

</template>

<script>
import { onMounted, ref } from 'vue';
import { evaluateIconClass } from '@/helper/iconClassEvaluator';

export default {
    name: 'ColorRenderer',
    props: ['icon', 'useValueAsIcon', 'color', 'text', 'divClass', 'record', 'value'],

    setup(props) {
        const iconNum = ref(props.icon);
        if (props.useValueAsIcon) {
            iconNum.value = props.value;
        }
        const iconClass = ref(null);
        const dynamicStyle = ref({
            color: props.color
        });
        onMounted(() => {
            const cl = evaluateIconClass(iconNum.value);
            iconClass.value = cl ? cl + ' icon' : null;
        });

        return {
            dynamicStyle,
            iconClass
        };
    }
};

</script>
<style>
.icon {
    margin-right: 4px; /* Adjust the margin as needed */
}
</style>