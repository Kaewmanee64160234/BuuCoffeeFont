<template>
  <v-dialog v-model="customerStore.openDialogRegisterCustomer" max-width="800px">
    <v-card>
      <v-card-title>
        <span class="text-h5">สมัครสมาชิก</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form ref="form">
            <v-row>
              <v-col cols="12" md="12">
                <v-text-field v-model="customerName" label="ชื่อลูกค้า" required></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field v-model="customerPhone" label="เบอร์โทรศัพท์" required></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="close">ยกเลิก</v-btn>
        <v-btn color="orange" @click="saveCustomer">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { defineProps, ref, watch } from 'vue';
import { useCustomerStore } from '../../stores/customer.store';
import type { VForm } from 'vuetify/components';


const form = ref<VForm | null>(null);


const customerName = ref('');
const customerPhone = ref('');
const customerStore = useCustomerStore();

// close Dialog 
function close() {
  customerStore.openDialogRegisterCustomer = false;
  // clear data
  customerName.value = '';
  customerPhone.value = '';
}

async function saveCustomer() {
  const { valid } = await form.value!.validate();
  if (valid) {
    try {
      await customerStore.createCustomer({
        customerId: 0,
        customerName: customerName.value,
        customerPhone: customerPhone.value,
        customerNumberOfStamp: 0, // New customer starts with 1 point
        createMemberDate: new Date(),
      });
      await customerStore.getAllCustomers(); // Refresh customer list
      close();

    } catch (error) {
      console.error('Error saving customer:', error);
    }
  }
}


</script>

<style scoped>
</style>
