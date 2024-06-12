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
    <v-card height="500px">
      <v-card-title>
        Find Member
      </v-card-title>
      <v-card-text>
        <v-text-field 
          label="Phone Number or Name" 
          height="20px" 
          hide-details="auto"   
          density="compact"
          variant="solo"
          v-model="customerStore.searchQuery"
          append-inner-icon="mdi-magnify"
        ></v-text-field>
        <v-card class="mx-auto" style="margin-top: 10px;">
          <div style="height: 45vh;" class="scroll">
            <v-list class="scroll" lines="two" v-if="filteredCustomers.length > 0">
              <v-list-item 
                v-for="item in filteredCustomers" 
                :value="item.customerId" 
                :key="item.customerId" 
                prepend-icon="mdi-account-star"
                :title="item.customerName" 
                :subtitle="`${item.customerNumberOfStamp} Points`" 
                style="font-size: 15px"
              >
                <template v-slot:append>
                  <v-btn 
                    variant="tonal"
                    color="teal-darken-1"
                    @click="customerStore.setCustomerInReceipt(item)"
                  >
                   เลือก
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-card>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" variant="text" @click="customerStore.openDialogFindCustomer = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style>
.scroll {
  max-height: 90vh;
  overflow: scroll;
}

.scroll::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.scroll::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 999px;
}
</style>
