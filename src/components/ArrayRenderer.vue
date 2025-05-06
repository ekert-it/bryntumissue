<!-- Bold - Vue renderer component -->
<template>
    <div :class="divclass">
        <div v-if="title">{{ title }}:</div>
        <ul :style="ulstyle">
            <li :style="listyle" v-for="item in arr" :key="item">{{ item }}</li>
        </ul>
    </div>
</template>

<script>
export default {
    name  : 'ArrayRenderer',
    props : ['arr', 'title', 'divclass', 'ulstyle', 'listyle']
};
</script>
