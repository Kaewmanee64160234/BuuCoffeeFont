<script setup lang="ts">
import { useCustomerStore } from '@/stores/customer.store';
import { computed, onMounted, ref } from 'vue';
const customerStore = useCustomerStore();

onMounted(() => {
  customerStore.getAllCustomers();
});

const filteredCustomers = computed(() => {
  if (!customerStore.searchQuery) {
    return customerStore.customers;
  }
  const query = customerStore.searchQuery.toLowerCase();
  return customerStore.customers.filter(customer =>
    customer.customerName.toLowerCase().includes(query) || customer.customerPhone.toLowerCase().includes(query)
  );
});
</script>

<template>
  <v-dialog persistent v-model="customerStore.openDialogFindCustomer" width="50%">
    <v-card height="500px" class="rounded-card">

      <v-card-text>
        <v-row class="d-flex align-center justify-space-between">

<v-card-title>
<v-icon>mdi-account-search</v-icon> 
ค้นหาสมาชิก
</v-card-title>
<v-card-actions class="card-actions">
  <v-btn color="red" dark fab @click="customerStore.openDialogFindCustomer = false">
    <v-icon>mdi-close</v-icon> 
  </v-btn>
</v-card-actions>

</v-row>
<v-row>
        <v-text-field 
          label="กรุณากรอกเบอร์โทรศัพท์" 
          hide-details="auto"   
          density="compact"
          variant="solo"
          v-model="customerStore.searchQuery"
          append-inner-icon="mdi-magnify"
        ></v-text-field>
      </v-row>
        <v-card class="mx-auto mt-4 rounded-card" height="45vh" style="overflow-y: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <v-list v-if="filteredCustomers.length > 0" dense>
            <v-list-item 
              v-for="item in filteredCustomers" 
              :key="item.customerId" 
              :title="item.customerName" 
              :subtitle="`${item.customerNumberOfStamp} Points`" 
              style="font-size: 15px"
              @click="customerStore.setCustomerInReceipt(item)"
            >
              <template v-slot:prepend>
                <v-icon left>mdi-account-star</v-icon>
              </template>
              <template v-slot:append>
                <v-btn 
                  variant="tonal"
                  color="teal-darken-1"
                >
                  เลือก
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-card-text>
 
    </v-card>
  </v-dialog>
</template>

<style>
.scroll {
  max-height: 45vh; /* สูงสุดสำหรับการมองเห็น */
  overflow: scroll; /* สำหรับการแสดงอุปกรณ์เลื่อน*/
}

.scroll::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.scroll::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 999px;
}
.rounded-card .v-card {
  border-radius: 30px; 
}
.card-actions {
  background-color: rgba(255, 255, 255, 0.9); /* กำหนดสีพื้นหลัง */
  backdrop-filter: blur(10px); /* ใช้ filter */
}

</style>
