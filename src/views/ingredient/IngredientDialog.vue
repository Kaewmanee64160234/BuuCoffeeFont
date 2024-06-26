<script lang="ts" setup>
import { useIngredientStore } from '@/stores/Ingredient.store';
import { ref } from "vue";
import Swal from 'sweetalert2';
import type { VForm } from "vuetify/components";

const form = ref<VForm | null>(null);

const IngredientStore = useIngredientStore();
async function save() {
  const { valid } = await form.value!.validate();
  if (valid) {
    try {
      await IngredientStore.saveIngredient();
      Swal.fire('สำเร็จ', 'วัตถุดิบถูกบันทึกเรียบร้อยแล้ว!', 'success');
      IngredientStore.dialog = false;
    } catch (error) {
      console.error('Error saving ingredient:', error);
      Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดขณะบันทึกวัตถุดิบ.', 'error');
    }
  }
}

function cancel() {
  Swal.fire({
    title: 'คุณแน่ใจหรือไม่?',
    text: 'คุณต้องการยกเลิกการเพิ่มวัตถุดิบหรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ใช่, ยกเลิก!',
    cancelButtonText: 'ไม่, กลับไป!',
  }).then((result) => {
    if (result.isConfirmed) {
      IngredientStore.dialog = false;
      Swal.fire('ยกเลิก', 'การเพิ่มวัตถุดิบถูกยกเลิก.', 'success');
    }
  });
}
</script>

<template>
  <v-dialog v-model="IngredientStore.dialog" persistent width="1024">
    <v-card class="rounded-card white-background">
      <v-card-title class="text-center">
        <span class="text-h5">เพิ่มวัตถุดิบ</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-file-input
                  v-model="IngredientStore.editedIngredient.imageFile"
                  label="รูปภาพวัตถุดิบ"
                  accept="image/*"
                ></v-file-input>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="ชื่อวัตถุดิบ"
                  required
                  v-model="IngredientStore.editedIngredient.ingredientName"
                  :rules="[
                    (v) => !!v || 'กรุณากรอกชื่อวัตถุดิบ',
                    (v) => v.length >= 3 || 'ความยาวต้องมากกว่า 3 ตัวอักษร',
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="ชื่อแบรนด์"
                  required
                  v-model="IngredientStore.editedIngredient.ingredientSupplier"
                  :rules="[(v) => !!v || 'กรุณากรอกชื่อแบรนด์']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="ปริมาณต่อหน่วย/ย่อย"
                  v-model.number="IngredientStore.editedIngredient.ingredientQuantityPerUnit"
                  :rules="[
                    (v) => !!v || 'กรุณากรอกปริมาณต่อหน่วย',
                    (v) => v > 0 || 'ปริมาณต้องมากกว่า 0',
                  ]"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="หน่วย"
                  v-model="IngredientStore.editedIngredient.ingredientUnit"
                  :rules="[(v) => /^[A-Za-zก-ฮะ-ูเ-์\s]+$/.test(v) || 'กรุณากรอกเฉพาะตัวอักษร']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="ขั้นต่ำ"
                  v-model.number="IngredientStore.editedIngredient.ingredientMinimun"
                  :rules="[
                    (v) => !!v || 'กรุณากรอกขั้นต่ำ',
                    (v) => v >= 0 || 'ขั้นต่ำต้องมากกว่า 0',
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="หน่วย/ย่อย"
                  v-model.number="IngredientStore.editedIngredient.ingredientQuantityPerSubUnit"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey"
              variant="elevated"
              style="font-weight: bold"
              @click="cancel"
            >
              ยกเลิก
            </v-btn>
            <v-btn
              color="orange"
              variant="elevated"
              style="font-weight: bold"
              @click="save"
            >
              บันทึก
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;400;500;600;700;800;900&display=swap');

* {
  font-family: 'Kanit', sans-serif;
}
</style>
