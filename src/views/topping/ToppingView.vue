<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row style="padding: 20px;">
          <h3>ท้อปปิ้ง</h3>
          </v-row>
        <v-row>
          
          <v-col cols="12" md="3">
            <v-text-field 
              v-model="toppingStore.searchQuery" 
              label="ค้นหาท็อบปิ้ง" 
              append-inner-icon="mdi-magnify" 
              hide-details 
              dense 
              variant="solo"
              @input="toppingStore.getToppingsPaginate"
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="3" class="d-flex justify-center align-center">
            <v-btn @click="openCreateDialog" color="success">
              <v-icon left>mdi-plus</v-icon>
              เพิ่มท็อปปิ้งใหม่
            </v-btn>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <v-table class="text-center mt-5">
          <thead>
            <tr>
              <th style="text-align: center;font-weight: bold;">รหัสท็อปปิ้ง</th>
              <th style="text-align: center;font-weight: bold;">ชื่อท็อปปิ้ง</th>
              <th style="text-align: center;font-weight: bold;">ราคาท็อปปิ้ง</th>
              <th style="text-align: center;font-weight: bold;">การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(topping,index) in toppingStore.toppings" :key="topping.toppingId" style="text-align: center;">
              <td>{{index+1 }}</td>
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
              <td colspan="4" class="text-center">ไม่มีข้อมูล</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination 
          justify="center" 
          v-model="toppingStore.currentPage" 
          :length="Math.ceil(toppingStore.totalToppings / toppingStore.itemsPerPage)" 
          rounded="circle">
        </v-pagination>
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
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณจะไม่สามารถย้อนกลับได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ตกลง, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await toppingStore.deleteTopping(toppingId);
      Swal.fire({
        title: 'ลบแล้ว!',
        text: 'ท็อปปิ้งถูกลบเรียบร้อยแล้ว.',
        icon: 'success',
        confirmButtonText: 'ตกลง',
        customClass: {
          confirmButton: 'swal-button'
        }
      });
    }
  } catch (error) {
    console.error('Error deleting topping:', error);
    Swal.fire({
      title: 'เกิดข้อผิดพลาด',
      text: 'เกิดข้อผิดพลาดขณะลบท็อปปิ้ง.',
      icon: 'error',
      confirmButtonText: 'ตกลง',
      customClass: {
        confirmButton: 'swal-button'
      }
    });
  }
};
</script>

<style scoped>
.swal-button {
  font-size: 16px;
}
</style>
