<script lang="ts" setup>
import { useIngredientStore } from '@/stores/Ingredient.store';
import { ref, watch } from "vue";
import Swal from 'sweetalert2';
import type { VForm } from "vuetify/components";

const form = ref<VForm | null>(null);
const ingredientStore = useIngredientStore();
const imagePreview = ref<string | null>(null);

watch(() => ingredientStore.editedIngredient.file, (newFile) => {
  if (newFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(newFile);
  } else {
    imagePreview.value = null;
  }
});

async function save() {
  const { valid } = await form.value!.validate();
  if (valid) {
    try {
      console.log(ingredientStore.editedIngredient.file);
      await ingredientStore.saveIngredient();
      Swal.fire({
        title: 'สำเร็จ',
        text: 'วัตถุดิบถูกบันทึกเรียบร้อยแล้ว!',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });
      ingredientStore.dialog = false;
      imagePreview.value = null;
    } catch (error) {
      console.error('Error saving ingredient:', error);
      Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดขณะบันทึกวัตถุดิบ.', 'error');
    }
  }
}

function cancel() {
  ingredientStore.dialog = false;
  imagePreview.value = null;
}
</script>
<template>
  <v-dialog v-model="ingredientStore.dialog" persistent width="1024">
    <v-card class="rounded-card white-background">
      <v-card-title class="text-center">
        <span class="text-h5">เพิ่มวัตถุดิบ</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form">
          <v-container>
            <v-row>
              <v-col cols="12" sm="12" class="d-flex justify-center align-center">
                <v-img v-if="imagePreview" :src="imagePreview" width="200" height="200" class="rounded-card"></v-img>
                <v-img v-else-if="ingredientStore.editedIngredient.ingredientId"
                  :src="`http://localhost:3000/ingredients/${ingredientStore.editedIngredient.ingredientId}/image`" width="200" height="200"
                  class="rounded-card"></v-img>
                <v-img v-else src="https://via.placeholder.com/200" width="200" height="200"
                  class="rounded-card"></v-img>
              </v-col>

            </v-row>
            <v-row>
              <v-col cols="12">
                <v-file-input v-model="ingredientStore.editedIngredient.file" label="รูปภาพวัตถุดิบ"
                  accept="image/*"></v-file-input>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field label="ชื่อวัตถุดิบ" required v-model="ingredientStore.editedIngredient.ingredientName"
                  :rules="[
                    (v) => !!v || 'กรุณากรอกชื่อวัตถุดิบ',
                    (v) => v.length >= 3 || 'ความยาวต้องมากกว่า 3 ตัวอักษร',
                  ]"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field label="ชื่อแบรนด์" required v-model="ingredientStore.editedIngredient.ingredientSupplier"
                  :rules="[(v) => !!v || 'กรุณากรอกชื่อแบรนด์']"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field label="ปริมาณต่อหน่วย/ย่อย"
                  v-model.number="ingredientStore.editedIngredient.ingredientQuantityPerUnit" :rules="[
                    (v) => !!v || 'กรุณากรอกปริมาณต่อหน่วย',
                    (v) => v > 0 || 'ปริมาณต้องมากกว่า 0',
                  ]"></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-text-field label="หน่วย" v-model="ingredientStore.editedIngredient.ingredientUnit"
                  :rules="[(v) => /^[A-Za-zก-ฮะ-ูเ-์\s]+$/.test(v) || 'กรุณากรอกเฉพาะตัวอักษร']"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field label="ขั้นต่ำ" v-model.number="ingredientStore.editedIngredient.ingredientMinimun"
                  :rules="[
                    (v) => !!v || 'กรุณากรอกขั้นต่ำ',
                    (v) => v >= 0 || 'ขั้นต่ำต้องมากกว่า 0',
                  ]"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field label="หน่วย/ย่อย"
                  v-model.number="ingredientStore.editedIngredient.ingredientQuantityPerSubUnit"></v-text-field>
              </v-col>
            </v-row>
          </v-container>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="elevated" style="font-weight: bold" @click="cancel">
              ยกเลิก
            </v-btn>
            <v-btn color="orange" variant="elevated" style="font-weight: bold" @click="save">
              บันทึก
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
