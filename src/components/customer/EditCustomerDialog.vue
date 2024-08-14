<template>
  <v-dialog v-model="dialog" max-width="800px">
    <v-card>
      <v-card-title>
        <span class="text-h5">แก้ไขข้อมูลลูกค้า</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form ref="form">
            <v-row>
              <v-col cols="12" md="12">
                <v-text-field v-model="customerName" label="ชื่อลูกค้า" variant="solo" required></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field v-model="customerPhone" label="เบอร์โทรศัพท์" variant="solo" required></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="closeDialog">ยกเลิก</v-btn>
        <v-btn color="orange" @click="saveCustomer">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import {  ref, watch } from 'vue';
import { useCustomerStore } from '@/stores/customer.store';
import type { VForm } from 'vuetify/components';
import Swal from 'sweetalert2';

const form = ref<VForm | null>(null);
  const customerStore = useCustomerStore();
const dialog = ref(customerStore.updateCustomerDialog);

const customerName = ref(customerStore.customer?.customerName || '');
const customerPhone = ref(customerStore.customer?.customerPhone || '');

watch(() => customerStore.updateCustomerDialog, (newVal) => {
  dialog.value = newVal;
});

watch(() => customerStore.customer, (newVal) => {
  customerName.value = newVal?.customerName || '';
  customerPhone.value = newVal?.customerPhone || '';
});

async function saveCustomer() {
  const { valid } = await form.value!.validate();
  if (valid) {
    const updatedCustomer = {
      customerId: customerStore.customer?.customerId || 0,
      customerName: customerName.value,
      customerPhone: customerPhone.value,
    };

    try {
      const response = await customerStore.updateCustomer(updatedCustomer.customerId, updatedCustomer!);
      if (response) {
        // Reset form and clear data after successful update
        customerName.value = '';
        customerPhone.value = '';
        form.value!.resetValidation(); // Reset form validation state
        dialog.value = false;
        customerStore.updateCustomerDialog = false;
        customerStore.customer = null;
        await customerStore.getAllCustomers(); // Refresh customer list

        Swal.fire({
          title: 'สำเร็จ!',
          text: 'ข้อมูลลูกค้าได้รับการแก้ไขเรียบร้อยแล้ว!',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        });
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถแก้ไขข้อมูลลูกค้าได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }
  dialog.value = false;
}

function closeDialog() {
  dialog.value = false;
  customerStore.updateCustomerDialog = false;
  customerName.value = '';
  customerPhone.value = '';
  form.value!.resetValidation(); // Reset form validation state
}

</script>

<style scoped>
</style>
