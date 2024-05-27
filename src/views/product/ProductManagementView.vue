
<script setup lang="ts" >

import { onMounted } from 'vue';
import  { useProductStore } from '../../stores/product.store';

const productStore = useProductStore()
onMounted(() => {
    console.log('Component is mounted')
    productStore.getAllProducts();
})

</script>
<template >
    <div>
        {{productStore.products}}
    </div>
</template>

<style >
    
</style>