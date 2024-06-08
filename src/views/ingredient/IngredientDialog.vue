<script lang="ts" setup>
import { useIngredientStore } from '@/stores/Ingredient.store';
import { onMounted, ref } from "vue";
import type { VForm } from "vuetify/components";

const form = ref<VForm | null>(null);
const url = import.meta.env.VITE_BACKEND_URL;

const IngredientStore = useIngredientStore();
async function save() {
  const { valid } = await form.value!.validate();
  if (valid) {
    await IngredientStore.saveIngredient();
  }
}
</script>

<template>
  <v-dialog v-model="IngredientStore.dialog" persistent width="1024">
 
    <transition name="fade">
      <v-card class="rounded-card white-background">
        <v-card-title class="text-center">
          <span class="text-h5">เพิ่มวัตถุดิบ</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form">
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="4" class="d-flex justify-center">
                  <v-img
                    src="path-to-placeholder-image"
                    class="mb-4"
                    max-width="150"
                  >
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-icon large>mdi-image</v-icon>
                      </v-row>
                    </template>
                  </v-img>
                </v-col>
                <v-col cols="12" sm="6" md="8" class="d-flex align-center">
                  <v-btn
                    color="orange"
                    class="ma-0"
                    large
                    @click="() => {}"
                  >
                    เพิ่ม
                  </v-btn>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
            
                    label="กรุณากรอกชื่อวัตถุดิบ"
                    required
                    v-model="IngredientStore.editedIngredient.nameIngredient"
                    :rules="[
                      (v) => !!v || 'กรุณากรอกชื่อวัตถุดิบ',
                      (v) => v.length >= 3 || 'ความยาวต้องมากกว่า 3 ตัวอักษร',
                    ]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
          
                    label="กรุณากรอกชื่อแบรนด์"
                    required
                    v-model="IngredientStore.editedIngredient.supplier"
                    :rules="[(v) => !!v || 'กรุณากรอกชื่อแบรนด์']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
         
                    label="กรุณากรอกปริมาณต่อหน่วย"
                    v-model.number="IngredientStore.editedIngredient.quantityPerUnit"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
     
                    label="กรุณากรอกหน่วย"
                    v-model="IngredientStore.editedIngredient.unit"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
          
                    label="กรุณากรอกขั้นต่ำ"
                    v-model.number="IngredientStore.editedIngredient.minimun"
                    :rules="[
                      (v) => !!v || 'กรุณากรอกขั้นต่ำ',
                      (v) => v >= 0 || 'ขั้นต่ำต้องมากกว่า 0',
                    ]"
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
                @click="IngredientStore.dialog = false"
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
    </transition>
  </v-dialog>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;400;500;600;700;800;900&display=swap');

* {
  font-family: 'Kanit', sans-serif;
}

</style>