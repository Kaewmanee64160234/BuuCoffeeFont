<template>
  <v-dialog v-model="toppingStore.updateToppingDialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">Update Topping</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="toppingStore.topping!.toppingName" label="Topping Name" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="toppingStore.topping!.toppingPrice" label="Topping Price" type="number"
                  required></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="toppingStore.updateToppingDialog = false">Close</v-btn>
        <v-btn color="blue darken-1" @click="submitForm" :disabled="!valid">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useToppingStore } from '@/stores/topping.store';
import type { Topping } from '@/types/topping.type';
import Swal from 'sweetalert2';

const toppingStore = useToppingStore();
const form = ref(null);
const valid = ref(false);
const toppingName = ref('');
const toppingPrice = ref(0);


const submitForm = async () => {
  if (!form.value?.validate()) return;

  const updatedTopping: Topping = {
    toppingId: toppingStore.topping!.toppingId,
    toppingName: toppingName.value,
    toppingPrice: toppingPrice.value,
  };

  try {
    await toppingStore.updateTopping(updatedTopping.toppingId, updatedTopping);
    toppingStore.updateToppingDialog = false;
    Swal.fire('Success', 'Topping updated successfully!', 'success');
  } catch (error) {
    console.error('Error updating topping:', error);
    Swal.fire('Error', 'An error occurred while updating the topping.', 'error');
  }
};
</script>