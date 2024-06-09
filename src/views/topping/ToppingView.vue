<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9">
            Toppings
          </v-col>
          <v-col cols="3">
            <v-text-field 
              v-model="toppingStore.searchQuery" 
              label="Search" 
              append-inner-icon="mdi-magnify" 
              hide-details 
              dense 
              variant="solo"
              @input="toppingStore.getToppingsPaginate"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-btn @click="openCreateDialog" color="success">
              <v-icon left>mdi-plus</v-icon>
              Add New Topping
            </v-btn>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <v-table class="text-center mt-5">
          <thead>
            <tr>
              <th style="text-align: center;">Topping ID</th>
              <th style="text-align: center;">Topping Name</th>
              <th style="text-align: center;">Topping Price</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="topping in toppingStore.toppings" :key="topping.toppingId" style="text-align: center;">
              <td>{{ topping.toppingId }}</td>
              <td>{{ topping.toppingName }}</td>
              <td>{{ topping.toppingPrice }}</td>
              <td>
                <v-btn color="#FFDD83" class="mr-5" icon="mdi-pencil" @click="openUpdateDialog(topping)"></v-btn>
                <v-btn color="#F55050" class="mr-5" icon="mdi-delete" @click="deleteTopping(topping.toppingId)"></v-btn>
              </td>
            </tr>
          </tbody>
          <tbody v-if="!toppingStore.toppings || toppingStore.toppings.length === 0">
            <tr>
              <td colspan="4" class="text-center">No data</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination justify="center" v-model="toppingStore.currentPage" :length="Math.ceil(toppingStore.totalToppings / toppingStore.itemsPerPage)" 
        rounded="circle"></v-pagination>
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
  await toppingStore.getToppingsPaginate()
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