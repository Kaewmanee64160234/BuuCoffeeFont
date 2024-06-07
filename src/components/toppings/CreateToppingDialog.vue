<template>
    <v-dialog v-model="toppingStore.createToppingDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Create Topping</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid">
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="toppingName" label="Topping Name" required></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="toppingPrice" label="Topping Price" type="number" required></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="toppingStore.createToppingDialog = false">Close</v-btn>
          <v-btn color="blue darken-1" @click="submitForm" :disabled="!valid">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue';
  import { useToppingStore } from '@/stores/topping.store';
  import type { Topping } from '@/types/topping.type';
  
  const toppingStore = useToppingStore();
  const form = ref(null);
  const valid = ref(false);
  const toppingName = ref('');
  const toppingPrice = ref(0);
  
  const submitForm = async () => {
    if (!form.value?.validate()) return;
  
    const newTopping: Topping = {
      toppingId: 0,
      toppingName: toppingName.value,
      toppingPrice: toppingPrice.value,
    };
  
    try {
      await toppingStore.createTopping(newTopping);
      toppingStore.createToppingDialog = false;
      Swal.fire('Success', 'Topping created successfully!', 'success');
    } catch (error) {
      console.error('Error creating topping:', error);
      Swal.fire('Error', 'An error occurred while creating the topping.', 'error');
    }
  };
  </script>
  