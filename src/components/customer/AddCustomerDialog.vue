<script lang="ts" setup>
import { ref } from 'vue';
import { useCustomerStore } from '../../stores/customer.store';
import type { VForm } from 'vuetify/components';
import Swal from 'sweetalert2';

const form = ref<VForm | null>(null);

const customerName = ref('');
const customerPhone = ref('');
const customerStore = useCustomerStore();

const rules = {
  required: (value: string) => !!value || 'กรุณากรอกข้อมูล',
  alpha: (value: string) => /^[a-zA-Zก-๙\s]+$/.test(value) || 'กรุณากรอกชื่อเป็นตัวอักษรเท่านั้น',
  phoneNumber: (value: string) => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(value) || 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (ขึ้นต้นด้วย 0 และมี 10 หลัก)';
  }
};

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

      // Clear form data and close dialog
      customerName.value = '';
      customerPhone.value = '';
      form.value!.resetValidation(); // Reset form validation state
      close();

      Swal.fire({
        title: 'สำเร็จ!',
        text: 'ลูกค้าได้ถูกบันทึกแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });
    } catch (error) {
      console.error('Error saving customer:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาดขณะบันทึกลูกค้า',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }
}

</script>

<template>
  <v-dialog v-model="customerStore.openDialogRegisterCustomer" max-width="550px">
    <v-card>
      <v-card-title>
        <span class="text-h5">สมัครสมาชิก</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form ref="form">
            <v-row>
              <v-col cols="12" md="12">
                <v-text-field 
                  v-model="customerName" 
                  label="ชื่อลูกค้า" 
                  :rules="[rules.required, rules.alpha]" 
                  variant="solo"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field 
                  v-model="customerPhone" 
                  label="เบอร์โทรศัพท์" 
                  :rules="[rules.required, rules.phoneNumber]" 
                  variant="solo"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="close" style="font-size: 16px;">ยกเลิก</v-btn>
        <v-btn color="orange" @click="saveCustomer" style="font-size: 16px;">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>
