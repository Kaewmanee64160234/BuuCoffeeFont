<template>
  <v-card class="product-card">
    <v-img class="product-image"
      :src="`http://localhost:3000/ingredients/${props.subInventory.ingredient.ingredientId}/image`"
      :lazy-src="`http://localhost:3000/ingredients/${props.subInventory.ingredient.ingredientId}/image`" />

    <v-card-title class="text-center">
      {{ props.subInventory.ingredient.ingredientName }}
    </v-card-title>


    <v-card-actions style="width: 100%;">
      <v-btn variant="elevated" color="#FF9642" rounded="xl" style="width: 100%;" @click="confirmSelection">
        ยืนยัน
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { useSubIngredientStore } from '@/stores/ingredientSubInventory.store';
import type { SubInventoriesCoffee } from '@/types/subinventoriescoffee.type';
import { ref } from 'vue';
const subInventoryStore = useSubIngredientStore();
const props = defineProps<{ subInventory: SubInventoriesCoffee, type: string }>();

const confirmSelection = () => {
  if (props.type == 'coffee') {
    subInventoryStore.addSubIngredientsCoffeeCatering(props.subInventory);
  }
  else {
    subInventoryStore.addSubIngredientsRiceCatering(props.subInventory);
    console.log('Selected sub-inventory:', props.subInventory);
  }
  // Handle the selection confirmation here
  console.log('Selected sub-inventory:', props.subInventory);
};
</script>

<style scoped>
.product-card {
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  padding: 10px;
  margin: 10px;
}

.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
}
</style>