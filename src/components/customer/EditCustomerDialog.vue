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
        <v-btn @click="closeDialog">ยกเลิก</v-btn>
        <v-btn color="orange" @click="saveCustomer">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { defineProps, ref, watch } from 'vue';
import { useCustomerStore } from '@/stores/customer.store';
import type { VForm } from 'vuetify/components';
import type { Customer } from '@/types/customer.type';

const props = defineProps<{ dialog: boolean, customer: Customer | null }>();
const form = ref<VForm | null>(null);
const dialog = ref(props.dialog);
const customerStore = useCustomerStore();

const customerName = ref(props.customer?.customerName || '');
const customerPhone = ref(props.customer?.customerPhone || '');

watch(() => props.dialog, (newVal) => {
  dialog.value = newVal;
});

watch(() => props.customer, (newVal) => {
  customerName.value = newVal?.customerName || '';
  customerPhone.value = newVal?.customerPhone || '';
});

async function saveCustomer() {
  const { valid } = await form.value!.validate();
  if (valid) {
    const updatedCustomer = {
      customerId: props.customer?.customerId || 0,
      customerName: customerName.value,
      customerPhone: customerPhone.value,
    };

    try {
      const response = await customerStore.updateCustomer(updatedCustomer.customerId, updatedCustomer);
      if (response) {
        dialog.value = false;
        customerStore.updateCustomerDialog = false;
        await customerStore.getAllCustomers();
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  }
  dialog.value = false;
}

function closeDialog() {
  dialog.value = false;
  customerStore.updateCustomerDialog = false;
}
</script>


<style scoped>
</style>
