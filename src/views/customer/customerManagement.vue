<script lang="ts" setup>
import { useCustomerStore } from '../../stores/customer.store';
import { computed, onMounted, ref } from 'vue';
import AddCustomerDialog from '@/components/customer/AddCustomerDialog.vue';
import EditCustomerDialog from '@/components/customer/EditCustomerDialog.vue'; // Ensure this path is correct
import type { Customer } from '../../types/customer.type';
import Swal from 'sweetalert2';

const customerStore = useCustomerStore();
const addCustomerDialog = ref(false);

onMounted(async () => {
  await customerStore.getAllCustomers();
});

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    // Optionally, you could trigger search here if needed
  }
};

const filteredCustomers = computed(() => {
  if (!customerStore.searchQuery) {
    return customerStore.customers;
  }
  return customerStore.customers.filter(customer =>
    customer.customerName.toLowerCase().includes(customerStore.searchQuery.toLowerCase())
  );
});

const openEditCustomerDialog = (customer: Customer) => {
  customerStore.setCustomerForEdit(customer);
  customerStore.updateCustomerDialog = true;
};

const deleteCustomer = async (customerId: number) => {
  try {
    const result = await Swal.fire({
      title: 'คุณแน่ใจไหม?',
      text: "คุณจะไม่สามารถย้อนกลับมาแก้ไขได้อีกแล้วนะ!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await customerStore.deleteCustomer(customerId);
      Swal.fire('ลบเสร็จสิ้น!', 'ลูกค้าได้ถูกลบแล้ว', 'success');
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดขณะลบลูกค้า', 'error');
  }
};
</script>

<template>
  <AddCustomerDialog v-model:dialog="addCustomerDialog"></AddCustomerDialog>
  <EditCustomerDialog v-model:dialog="customerStore.updateCustomerDialog" :customer="customerStore.customer"></EditCustomerDialog>

  <v-container>
    <v-card class="flex-container">
      <v-card-title>
        <v-row>
          <v-col cols="9" style="font-size: 35px;">
            จัดการลูกค้า
          </v-col>
          
          <v-row style="margin-left: 6%;">
            <v-col class="pa-2 ma-2" cols="3">
              <v-text-field
                v-model="customerStore.searchQuery"
                label="ค้นหาลูกค้า"
                append-inner-icon="mdi-magnify"
                hide-details
                dense
                @keydown="handleSearchKeydown"
              ></v-text-field>
            </v-col>
            
            <v-spacer></v-spacer>
            <v-col class="mt-4" cols="3" width="30%">
              <v-btn color="success" @click="addCustomerDialog = true">
                <v-icon left>mdi-plus</v-icon>
                เพิ่มลูกค้าใหม่
              </v-btn>
            </v-col>
          </v-row>
          
        </v-row>
        
        <v-spacer> </v-spacer>
      </v-card-title>
      <v-card width="90%" style="margin-left: 5%; margin-top: 3%;">
        <v-table class="text-center">
          <thead>
            <tr>
              <th class="text-center"></th>
              <th class="text-center">ชื่อลูกค้า</th>
              <th class="text-center">เบอร์โทร</th>
              <th class="text-center">แต้มสะสม</th>
              <th class="text-center">การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredCustomers" :key="index">
              <td class="text-center">{{ index + 1 }}</td>
              <td class="text-center">{{ item.customerName }}</td>
              <td class="text-center">{{ item.customerPhone }}</td>
              <td class="text-center">{{ item.customerNumberOfStamp }}</td>
              <td class="text-center">
                <v-btn color="#FFDD83" icon="mdi-pencil" class="mr-2" @click="openEditCustomerDialog(item)">
                </v-btn>
                <v-btn color="#F55050" icon="mdi-delete" @click="deleteCustomer(item.customerId)">
                </v-btn>
              </td>
            </tr>
          </tbody>
          <tbody v-if="!filteredCustomers.length">
            <tr>
              <td colspan="6" class="text-center">ไม่มีข้อมูล</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-card>
  </v-container>
</template>

<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
}
</style>
