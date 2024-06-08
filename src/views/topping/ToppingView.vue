<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field 
              v-model="toppingStore.searchQuery" 
              label="ค้นหาท็อปปิ้ง" 
              append-inner-icon="mdi-magnify"
              hide-details 
              dense 
              variant="solo"
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="3" class="d-flex justify-center align-center">
            <v-btn @click="openCreateDialog" style="background-color: #8ad879; color: white" block>
              <v-icon left>mdi-plus</v-icon>
              เพิ่มท็อปปิ้ง
            </v-btn>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <v-table class="text-center mt-5">
          <thead>
            <tr>
              <th style="text-align: center">#</th>
              <th style="text-align: center">Name</th>
              <th style="text-align: center">Price</th>
              <th style="text-align: center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(topping, index) in toppingStore.toppings" :key="topping.toppingId" style="text-align: center;">
              <td>{{ index + 1 }}</td>
              <td>{{ topping.toppingName }}</td>
              <td>{{ topping.toppingPrice }}</td>
              <td>
                <v-btn color="#FFDD83" icon="mdi-pencil" class="mr-2" @click="openUpdateDialog(topping)">
                </v-btn>
                <v-btn color="#F55050" icon="mdi-delete" @click="deleteTopping(topping.toppingId)">
                </v-btn>
              </td>
            </tr>
          </tbody>
          <tbody v-if="!toppingStore.toppings || toppingStore.toppings.length === 0">
            <tr>
              <td colspan="4" class="text-center">No data</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
    <CreateToppingDialog />
    <UpdateToppingDialog />
  </v-container>
</template>

<script lang="ts" setup>
import { useToppingStore } from '@/stores/topping.store';
import { onMounted, ref } from 'vue';
import Swal from 'sweetalert2';
import CreateToppingDialog from '@/components/toppings/CreateToppingDialog.vue';
import UpdateToppingDialog from '@/components/toppings/UpdateToppingDialog.vue';
import type { Topping } from '@/types/topping.type';

const toppingStore = useToppingStore();

const headers = ref([
  { text: 'Topping ID', value: 'toppingId', align: 'center' },
  { text: 'Topping Name', value: 'toppingName', align: 'center' },
  { text: 'Topping Price', value: 'toppingPrice', align: 'center' },
  { text: 'Actions', value: 'actions', align: 'center', sortable: false },
]);

onMounted(async () => {
  await toppingStore.getAllToppings();
});

const openCreateDialog = () => {
  toppingStore.topping = null;
  toppingStore.createToppingDialog = true;
};

const openUpdateDialog = (topping: Topping) => {
  toppingStore.topping = { ...topping };
  toppingStore.updateToppingDialog = true;
};

const deleteTopping = async (toppingId: number) => {
  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await toppingStore.deleteTopping(toppingId);
      Swal.fire('Deleted!', 'Topping has been deleted.', 'success');
    }
  } catch (error) {
    console.error('Error deleting topping:', error);
    Swal.fire('Error', 'An error occurred while deleting the topping.', 'error');
  }
};
</script>