<script lang="ts" setup>
import { useIngredientStore } from "@/stores/Ingredient.store";
import { ref, watch } from "vue";
import Swal from "sweetalert2";
import type { VForm } from "vuetify/components";

const form = ref<VForm | null>(null);
const ingredientStore = useIngredientStore();
const imagePreview = ref<string | null>(null);
const barcode = ref('');

watch(
  () => ingredientStore.editedIngredient.file,
  (newFile) => {
    if (newFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(newFile);
    } else {
      imagePreview.value = null;
    }
  }
);

async function save() {
  console.log("Starting save process...");

  if (form.value) {
    const { valid } = await form.value.validate();
    console.log("Form validation status:", valid);

    if (valid) {
      try {
        console.log("Ingredient data to save:", ingredientStore.editedIngredient);
        console.log("Image file:", ingredientStore.editedIngredient.file);

        await ingredientStore.saveIngredient();

        console.log("Ingredient saved successfully.");
        ingredientStore.dialog = false;

        Swal.fire({
          title: "สำเร็จ",
          text: "วัตถุดิบถูกบันทึกเรียบร้อยแล้ว!",
          icon: "success",
          confirmButtonText: "ตกลง",
        }).then(() => {
          console.log("Reloading page...");
          window.location.reload();
        });
        imagePreview.value = null;
      } catch (error) {
        console.error("Error saving ingredient:", error);
        Swal.fire("เกิดข้อผิดพลาด", "เกิดข้อผิดพลาดขณะบันทึกวัตถุดิบ.", "error");
      }
    } else {
      console.warn("Form validation failed.");
      Swal.fire("เกิดข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน.", "error");
    }
  } else {
    console.error("Form reference is null");
    Swal.fire("เกิดข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน.", "error");
  }
}



function cancel() {
  ingredientStore.dialog = false;
  imagePreview.value = null;
}
const units = [
  "กล่อง",
  "แพ็ค",
  "ถุง",

];
const subunits = [
  "กระปุก",
  "กระป๋อง",
  "แก้ว",
  "ขวด",
  "ชิ้น",
  "โหล",
  "ถาด",
  "ถ้วย",
  "จาน",
  "ชาม",
  "ซอง",
  "ถุง",
];
</script>

<template>
  <v-dialog v-model="ingredientStore.dialog" persistent width="1024">
    <v-card class="rounded-card white-background">
      <!-- <v-card-title > -->
      <h3 class="text-center mt-1">เพิ่มวัตถุดิบ</h3>
      <!-- </v-card-title> -->

      <v-card-text>
        <v-form ref="form">
          <v-container>
            <v-row> ตัวอย่าง : <strong>เนสกาแฟ เบลนด์ แอนด์ บรู กาแฟปรุงสำเร็จ ริช อโรมา </strong><strong>1 ถุง มี 27
                ซอง</strong> ขั้นต่ำในคลัง <strong>100 ซอง</strong> </v-row>
            <v-row>
              <v-col cols="12" sm="12" class="d-flex justify-center align-center">
                <v-img v-if="imagePreview" :src="imagePreview" width="110" height="110" class="rounded-card"></v-img>
                <v-img v-else-if="ingredientStore.editedIngredient.ingredientId"
                  :src="`http://localhost:3000/ingredients/${ingredientStore.editedIngredient.ingredientId}/image`"
                  width="110" height="110" class="rounded-card"></v-img>
                <v-img v-else src="https://via.placeholder.com/200" width="110" height="110"
                  class="rounded-card"></v-img>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-file-input v-model="ingredientStore.editedIngredient.file" label="รูปภาพวัตถุดิบ" accept="image/*"
                  dense hide-details variant="solo"></v-file-input>
              </v-col>

            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field label="ชื่อวัตถุดิบ (ตัวอย่าง : เนสกาแฟ เบลนด์ แอนด์ บรู กาแฟปรุงสำเร็จ ริช อโรมา)"
                  required v-model="ingredientStore.editedIngredient.ingredientName" :rules="[
                    (v) => !!v || 'กรุณากรอกชื่อวัตถุดิบ',
                    (v) => v.length >= 3 || 'ความยาวต้องมากกว่า 3 ตัวอักษร',
                  ]" dense hide-details variant="solo"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="ชื่อแบรนด์ (ตัวอย่าง : เนสกาแฟ)" required
                  v-model="ingredientStore.editedIngredient.ingredientSupplier"
                  :rules="[(v) => !!v || 'กรุณากรอกชื่อแบรนด์']" dense hide-details variant="solo"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field label="จุดสั่งซื้อขั้นต่ำ (ตัวอย่าง : 100) สำหรับแจ้งเตือน" v-model.number="ingredientStore.editedIngredient.ingredientMinimun
                  " :rules="[
                    (v) => !!v || 'กรุณากรอกขั้นต่ำ',
                    (v) => v >= 0 || 'ขั้นต่ำต้องมากกว่า 0',
                  ]" dense hide-details variant="solo"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-autocomplete label="หน่วยใหญ่ (ตัวอย่าง : ถุง)"
                  v-model="ingredientStore.editedIngredient.ingredientUnit" :items="units" dense hide-details
                  variant="solo"></v-autocomplete>
              </v-col>


            </v-row>
            <v-row>


              <v-col cols="12" sm="6">
                <v-text-field label="ปริมาณหน่วยย่อย (ตัวอย่าง : 27)" v-model.number="ingredientStore.editedIngredient.ingredientQuantityPerUnit
                  " :rules="[
                    (v) => !!v || 'กรุณากรอกปริมาณต่อหน่วย',
                    (v) => v > 0 || 'ปริมาณต้องมากกว่า 0',
                  ]" dense hide-details variant="solo"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-autocomplete label="หน่วย/ย่อย (ตัวอย่าง : ซอง ) " v-model.number="ingredientStore.editedIngredient
                  .ingredientQuantityPerSubUnit
                  " :items="subunits" dense hide-details variant="solo"></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="ปริมาณ" v-model.number="ingredientStore.editedIngredient
                  .ingredientVolumeUnit
                  " dense hide-details variant="solo"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="บาร์โค้ด" v-model.number="ingredientStore.editedIngredient
                  .ingredientBarcode
                  " dense hide-details variant="solo"></v-text-field>
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;400;500;600;700;800;900&display=swap');

* {
  font-family: 'Kanit', sans-serif;
}

.v-dialog {
  max-width: 100%;
  margin: 0 auto;
}

.v-card {
  width: 100%;
  max-width: 1024px;
}

.v-card-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.v-text-field,
.v-autocomplete {
  width: 100%;
}

@media (max-width: 600px) {
  .v-card-title {
    font-size: 1.2rem;
  }

  .v-btn {
    width: 100%;
    margin-top: 5px;
  }

  .v-col {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
}
</style>
