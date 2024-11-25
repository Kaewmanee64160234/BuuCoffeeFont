<script lang="ts" setup>
import { useCustomerStore } from '../../stores/customer.store';
import { computed, onMounted, ref } from 'vue';
import AddCustomerDialog from '@/components/customer/AddCustomerDialog.vue';
import EditCustomerDialog from '@/components/customer/EditCustomerDialog.vue';
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
  let filtered = customerStore.customers;

  if (customerStore.searchQuery) {
    filtered = filtered.filter(customer =>
      customer.customerName.toLowerCase().includes(customerStore.searchQuery.toLowerCase())
    );
  }

  const start = (customerStore.currentPage - 1) * customerStore.itemsPerPage;
  const end = start + customerStore.itemsPerPage;

  return filtered.slice(start, end);
});

const openEditCustomerDialog = (customer: Customer) => {
  customerStore.setCustomerForEdit(customer);
  customerStore.updateCustomerDialog = true;
};

function openCreateCustomerDialog() {
  customerStore.openDialogRegisterCustomer = true;
}

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
      Swal.fire({
        title: 'ลบเสร็จสิ้น!',
        text: 'ลบลูกค้าเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดขณะลบลูกค้า', 'error');
  }
};
</script>

<template>
  <AddCustomerDialog v-model:dialog="addCustomerDialog"></AddCustomerDialog>
  <EditCustomerDialog></EditCustomerDialog>

  <v-container>
    <v-card class="fit-content">
      <v-card-title>
        <v-row>
          <v-col cols="12" style="padding: 20px;">
            <h3>จัดการลูกค้า</h3>
          </v-col>
          
          <v-row class="mt-4 ml-2 mb-2">
            <v-col class="pa-2 mr-8" cols="12" sm="6" md="3">
              <v-text-field
                v-model="customerStore.searchQuery"
                label="ค้นหาลูกค้า"
                append-inner-icon="mdi-magnify"
                dense hide-details variant="solo"
                outlined
                @keydown="handleSearchKeydown"
              ></v-text-field>
            </v-col>
            
            <v-spacer></v-spacer>
            <v-col class="mt-4" cols="12" sm="6" md="3">
              <v-btn color="success" @click="openCreateCustomerDialog" style="font-size: 16px;">
                <v-icon left>mdi-plus</v-icon>
                เพิ่มลูกค้าใหม่
              </v-btn>
            </v-col>
          </v-row>
        </v-row>
        
        <v-spacer></v-spacer>
      </v-card-title>

      <v-responsive>
        <v-table class="mx-auto" style="width: 97%;">
          <thead>
            <tr>
              <th class="text-center font-weight: bold;" style="font-size: 16px;font-weight: bold;">รหัสลูกค้า</th>
              <th class="text-center font-weight: bold;" style="font-size: 16px;font-weight: bold;">ชื่อลูกค้า</th>
              <th class="text-center font-weight: bold;" style="font-size: 16px;font-weight: bold;">เบอร์โทร</th>
              <th class="text-center font-weight: bold;" style="font-size: 16px;font-weight: bold;">แต้มสะสม</th>
              <th class="text-center font-weight: bold;" style="font-size: 16px;font-weight: bold;">การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredCustomers" :key="index">
              <td class="text-center" style="font-size: 16px;">{{ index + 1 + (customerStore.currentPage - 1) * customerStore.itemsPerPage }}</td>
              <td class="text-center" style="font-size: 16px;">{{ item.customerName }}</td>
              <td class="text-center" style="font-size: 16px;">{{ item.customerPhone }}</td>
              <td class="text-center" style="font-size: 16px;">{{ item.customerNumberOfStamp }}</td>
              <td class="text-center" style="font-size: 16px;">
                <v-btn color="#FFDD83" icon="mdi-pencil" class="mr-2" @click="openEditCustomerDialog(item)">
                </v-btn>
                <v-btn color="#F55050" icon="mdi-delete" @click="deleteCustomer(item.customerId)">
                </v-btn>
              </td>
            </tr>
            <tr v-if="!filteredCustomers.length">
              <td colspan="5" class="text-center" style="font-size: 16px;">ไม่มีข้อมูล</td>
            </tr>
          </tbody>
        </v-table>
      </v-responsive>

      <v-pagination
        justify="center"
        v-model="customerStore.currentPage"
        :length="Math.ceil(customerStore.totalCustomers / customerStore.itemsPerPage)"
        rounded="circle"
      ></v-pagination>
    </v-card>
  </v-container>
</template>

<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
}

@media (max-width: 768px) {
  .fit-content {
    width: 100%;
    overflow-x: auto;
  }

  v-table {
    font-size: 0.8rem;
  }

  v-btn {
    min-width: 32px;
    height: 32px;
  }

  h3 {
    font-size: 1.2rem;
  }
}
</style>
