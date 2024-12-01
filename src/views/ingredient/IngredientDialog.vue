<script lang="ts" setup>
import { useIngredientStore } from "@/stores/Ingredient.store";
import { ref, watch, onMounted } from "vue";
import { useCategoryStore } from '@/stores/category.store';
import type { VForm } from "vuetify/components";

const form = ref<VForm | null>(null);
const ingredientStore = useIngredientStore();
const categoryStore = useCategoryStore();
const imagePreview = ref<string | null>(null);
const barcode = ref('');
const currentStep = ref(1);

onMounted(async () => {
  await categoryStore.getAllCategories();
  currentStep.value = 1;
});
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
  console.log("Ingredient data to save:", {
    ingredientName: ingredientStore.editedIngredient.ingredientName,
    ingredientSupplier :ingredientStore.editedIngredient.ingredientSupplier,
    ingredientMinimun:ingredientStore.editedIngredient.ingredientMinimun,
    ingredientUnit:ingredientStore.editedIngredient.ingredientUnit,
    ingredientVolumeUnit:ingredientStore.editedIngredient.ingredientVolumeUnit,
    ingredientQuantityPerUnit:ingredientStore.editedIngredient.ingredientQuantityPerUnit,
    ingredientQuantityPerSubUnit:ingredientStore.editedIngredient.ingredientQuantityPerSubUnit,
    ingredientBarcode:ingredientStore.editedIngredient.ingredientBarcode,
    categoryId: ingredientStore.editedIngredient.categoryId,
    file: ingredientStore.editedIngredient.file
  })
  const response = await ingredientStore.saveIngredient();
  console.log("Response from saveIngredient:", response);
}

function cancel() {
  ingredientStore.dialog = false;
  imagePreview.value = null;
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

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

const rules = {
  required: (v: any) => !!v || 'กรุณากรอกข้อมูล',
  minLength: (v: string) => v.length >= 3 || 'ความยาวต้องมากกว่า 3 ตัวอักษร',
  greaterThanZero: (v: number) => v > 0 || 'ค่าต้องมากกว่า 0',
  notNegative: (v: number) => v >= 0 || 'ค่าต้องไม่ติดลบ'
};
</script>

<template>
  <v-dialog v-model="ingredientStore.dialog" persistent max-width="1024">
    <v-card class="rounded-lg pa-4">
      <v-card-title class="text-h5 text-center primary--text mb-4">
        <v-icon large color="primary" class="mr-2">mdi-plus-circle</v-icon>
        เพิ่มวัตถุดิบ
      </v-card-title>
      
      <div class="stepper-container">
        <div class="stepper">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-title">ข้อมูลทั่วไป</div>
          </div>
          <div class="step-line" :class="{ active: currentStep > 1 }"></div>
          <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-title">ข้อมูลปริมาณ</div>
          </div>
          <div class="step-line" :class="{ active: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep >= 3 }">
            <div class="step-number">3</div>
            <div class="step-title">รูปภาพ</div>
          </div>
        </div>

        <v-divider class="my-4"></v-divider>

        <div class="step-content">
          <!-- Step 1 -->
          <v-slide-x-transition>
            <div v-if="currentStep === 1">
              <v-card flat>
                <v-card-text>
                  <v-alert type="info" text dense class="mb-4">
                    <div class="text-subtitle-1">ตัวอย่าง :</div>
                    <div><strong>เนสกาแฟ เบลนด์ แอนด์ บรู กาแฟปรุงสำเร็จ ริช อโรมา </strong></div>
                    <div><strong>1 ถุง มี 27 ซอง</strong> ขั้นต่ำในคลัง <strong>100 ซอง</strong></div>
                  </v-alert>
                  
                  <v-form ref="form">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          label="ชื่อวัตถุดิบ"
                          v-model="ingredientStore.editedIngredient.ingredientName"
                          :rules="[rules.required, rules.minLength]"
                          placeholder="เนสกาแฟ เบลนด์ แอนด์ บรู กาแฟปรุงสำเร็จ ริช อโรมา"
                          outlined
                          dense
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          label="ชื่อแบรนด์"
                          v-model="ingredientStore.editedIngredient.ingredientSupplier"
                          :rules="[rules.required]"
                          placeholder="เนสกาแฟ"
                          outlined
                          dense
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          label="หมวดหมู่"
                          v-model="ingredientStore.editedIngredient.categoryId"
                          :items="categoryStore.categoriesForCreate"
                          item-title="categoryName"
                          item-value="categoryId"
                          :rules="[rules.required]"
                          outlined
                          dense
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    @click="nextStep"
                    rounded
                    elevation="2"
                  >
                    ถัดไป
                    <v-icon right>mdi-arrow-right</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </v-slide-x-transition>

          <!-- Step 2 -->
          <v-slide-x-transition>
            <div v-if="currentStep === 2">
              <v-card flat>
                <v-card-text>
                  <v-form ref="form">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          label="จุดสั่งซื้อขั้นต่ำ"
                          v-model.number="ingredientStore.editedIngredient.ingredientMinimun"
                          :rules="[rules.required, rules.notNegative]"
                          placeholder="100"
                          outlined
                          dense
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          label="หน่วยใหญ่"
                          v-model="ingredientStore.editedIngredient.ingredientUnit"
                          :items="units"
                          outlined
                          dense
                        ></v-select>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          label="ปริมาณหน่วยย่อย"
                          v-model.number="ingredientStore.editedIngredient.ingredientQuantityPerUnit"
                          :rules="[rules.required, rules.greaterThanZero]"
                          placeholder="27"
                          outlined
                          dense
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          label="หน่วยย่อย"
                          v-model="ingredientStore.editedIngredient.ingredientQuantityPerSubUnit"
                          :items="subunits"
                          outlined
                          dense
                        ></v-select>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          label="ปริมาณ"
                          v-model.number="ingredientStore.editedIngredient.ingredientVolumeUnit"
                          outlined
                          dense
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          label="บาร์โค้ด"
                          v-model="ingredientStore.editedIngredient.ingredientBarcode"
                          outlined
                          dense
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    color="grey"
                    @click="prevStep"
                    rounded
                    text
                  >
                    <v-icon left>mdi-arrow-left</v-icon>
                    ย้อนกลับ
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    @click="nextStep"
                    rounded
                    elevation="2"
                  >
                    ถัดไป
                    <v-icon right>mdi-arrow-right</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </v-slide-x-transition>

          <!-- Step 3 -->
          <v-slide-x-transition>
            <div v-if="currentStep === 3">
              <v-card flat>
                <v-card-text>
                  <v-row justify="center" align="center">
                    <v-col cols="12" sm="6" class="text-center">
                      <v-avatar size="150" class="mb-4">
                        <v-img
                          v-if="imagePreview"
                          :src="imagePreview"
                          cover
                        ></v-img>
                        <v-img
                          v-else-if="ingredientStore.editedIngredient.ingredientId"
                          :src="`http://localhost:3000/ingredients/${ingredientStore.editedIngredient.ingredientId}/image`"
                          cover
                        ></v-img>
                        <v-img
                          v-else
                          src="https://via.placeholder.com/200"
                          cover
                        ></v-img>
                      </v-avatar>
                      <v-file-input
                        v-model="ingredientStore.editedIngredient.file"
                        label="รูปภาพวัตถุดิบ"
                        accept="image/*"
                        prepend-icon="mdi-camera"
                        outlined
                        dense
                      ></v-file-input>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    color="grey"
                    @click="prevStep"
                    rounded
                    text
                  >
                    <v-icon left>mdi-arrow-left</v-icon>
                    ย้อนกลับ
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="success"
                    @click="save"
                    rounded
                    elevation="2"
                  >
                    <v-icon left>mdi-content-save</v-icon>
                    ยืนยันการบันทึก
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </v-slide-x-transition>
        </div>
      </div>

      <v-divider class="my-4"></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          @click="cancel"
          rounded
          text
        >
          <v-icon left>mdi-close</v-icon>
          ยกเลิก
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;400;500;600;700;800;900&display=swap');

* {
  font-family: 'Kanit', sans-serif;
}

.stepper-container {
  padding: 20px;
}

.stepper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background-color: #1976d2;
  transform: scale(1.1);
}

.step.completed .step-number {
  background-color: #4caf50;
}

.step-title {
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.step.active .step-title {
  color: #1976d2;
  font-weight: bold;
  transform: scale(1.05);
}

.step-line {
  flex: 1;
  height: 2px;
  background-color: #e0e0e0;
  margin: 0 15px;
  position: relative;
  top: -24px;
  z-index: 0;
  transition: all 0.3s ease;
}

.step-line.active {
  background-color: #4caf50;
}

.v-dialog {
  max-width: 100%;
  margin: 0 auto;
}

.v-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.v-card-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.v-text-field,
.v-select {
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
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
  
  .step-title {
    font-size: 12px;
  }
  
  .step-number {
    width: 30px;
    height: 30px;
  }

  .stepper-container {
    padding: 10px;
  }
}
</style>
