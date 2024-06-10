<template>
    <v-card>
      <v-card-title>Selected Items</v-card-title>
      <v-list>
        <v-list-item v-for="(item, index) in selectedItems" :key="index">
          <v-list-item-content>{{ item.name }}</v-list-item-content>
          <v-list-item-content>{{ item.quantity }}</v-list-item-content>
          <v-list-item-content>{{ item.price }}</v-list-item-content>
          <v-btn @click="removeItem(index)">Remove</v-btn>
        </v-list-item>
      </v-list>
      <v-card-subtitle>Total: {{ totalPrice }}</v-card-subtitle>
    </v-card>
  </template>
  
  <script lang="ts" setup>
  import { computed, defineProps, defineEmits } from 'vue';
  
  interface SelectedItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }
  
  const props = defineProps<{ selectedItems: SelectedItem[] }>();
  const emit = defineEmits(['remove-item']);
  
  const totalPrice = computed(() => {
    return props.selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  });
  
  function removeItem(index: number) {
    emit('remove-item', index);
  }
  </script>
  