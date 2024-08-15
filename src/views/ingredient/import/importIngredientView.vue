<template>
  <v-container fluid style="padding-left: 80px;">
    <v-card-title>
      <v-row>
        <v-col cols="9" style="padding: 10px;">นำเข้าวัตถุดิบ</v-col>
      </v-row>
      <v-row>
        <v-col cols="3">
          <v-text-field label="ค้นหาวัตถุดิบ" append-inner-icon="mdi-magnify" dense hide-details variant="solo"
            v-model="searchQuery" @input="onSearch"></v-text-field>
        </v-col>
        <v-col cols="auto">
          <v-btn color="success" :to="{ name: 'ingredients' }">รายการวัตถุดิบ</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn color="warning" :to="{ name: 'importingredientsHistory' }">ประวัตินำเข้าวัตถุดิบ</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-row align="center">
            <v-col cols="auto" style="padding: 5px;">
              <v-radio-group v-model="ingredientStore.importStoreType" row :rules="[rules.required]">
                <v-radio label="ร้านกาแฟ" value="ร้านกาแฟ"></v-radio>
                <v-radio label="ร้านข้าว" value="ร้านข้าว"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-spacer></v-spacer>
    </v-card-title>
    <v-row>
      <v-col cols="6" class="d-flex flex-column">
        <v-container>

          <v-row>
            <template v-if="ingredientStore.importStoreType === 'ร้านกาแฟ'">
              <v-col cols="3" style="text-align: center; padding: 8px"
                v-for="(item, index) in ingredientStore.all_ingredients" :key="index">
                <v-card width="100%" @click="ingredientStore.Addingredient(item)" style="height: 200px">
                  <v-img :src="`http://localhost:3000/ingredients/${item.ingredientId}/image`" height="100"></v-img>
                  <v-card-title style="font-size: 14px">{{
                    item.ingredientName
                  }}</v-card-title>
                  <v-card-subtitle style="font-size: 12px">{{
                    item.ingredientSupplier
                  }}</v-card-subtitle>
                </v-card>
              </v-col>
            </template>
            <template v-else-if="ingredientStore.importStoreType === 'ร้านข้าว'">
              <v-col cols="12" style="text-align: center; padding: 8px">
                <v-text-field v-model="newIngredientName" label="ชื่อวัตถุดิบ" required
                  @keyup.enter="ingredientStore.AddRiceIngredient({ ingredientName: newIngredientName })"></v-text-field>
                <v-btn
                  @click="ingredientStore.AddRiceIngredient({ ingredientName: newIngredientName })">เพิ่มวัตถุดิบ</v-btn>
              </v-col>
            </template>
          </v-row>
        </v-container>
      </v-col>
      <v-col cols="6" class="d-flex flex-column" style="padding: 2px;">
        <v-card style="height: 400px; overflow-y: auto; width: 100%">
          <v-table style="max-height: 100%; overflow-y: auto">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อสินค้า</th>
                <th v-if="ingredientStore.importStoreType === 'ร้านกาแฟ'">แบรนด์</th>
                <th v-if="ingredientStore.importStoreType === 'ร้านกาแฟ'">จำนวน</th>
                <th v-if="ingredientStore.importStoreType === 'ร้านกาแฟ'">ราคาต้นทุน</th>
                <th v-if="ingredientStore.importStoreType === 'ร้านกาแฟ'">ราคารวม</th>
                <th>แอคชั่น</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in reversedIngredientList" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ ingredientStore.importStoreType === 'ร้านข้าว' ? item.name : item.ingredient?.ingredientName }}
                </td>
                <td v-if="ingredientStore.importStoreType === 'ร้านกาแฟ'">{{ item.ingredient?.ingredientSupplier }}</td>
                <td v-if="ingredientStore.importStoreType === 'ร้านกาแฟ'">
                  <input type="number" v-model.number="item.count" class="styled-input" min="1" />
                </td>
                <td v-if="ingredientStore.importStoreType === 'ร้านกาแฟ'">
                  <input type="number" v-model.number="item.unitprice" class="styled-input" min="0" />
                </td>
                <td v-if="ingredientStore.importStoreType === 'ร้านกาแฟ'">
                  <input type="number" v-model.number="item.totalunit" class="styled-input" min="0" />
                </td>

                <td>
                  <button @click="ingredientStore.removeIngredient(reversedIndex(index))" class="styled-button">
                    ลบ
                  </button>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <v-row>
          <v-col cols="6">
            <v-row>
              <v-col cols="12">ชื่อร้านค้า</v-col>
              <v-col cols="12">
                <v-text-field ref="storeField" label="กรุณากรอกชื่อร้านค้า" v-model="ingredientStore.store"
                  :rules="[rules.required, rules.name]" dense hide-details variant="solo">
                </v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">ส่วนลด</v-col>
              <v-col cols="12">
                <v-text-field ref="discountField" label="กรุณากรอกส่วนลด" v-model="ingredientStore.discount"
                  :rules="[rules.required, rules.number]" dense hide-details variant="solo"></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="6">
            <v-row>
              <v-col cols="12">ราคารวมใบเสร็จ</v-col>
              <v-col cols="12">
                <v-text-field ref="totalField" label="กรุณากรอกราคารวมใบเสร็จ" v-model="ingredientStore.total"
                  :rules="[rules.required, rules.number]" dense hide-details variant="solo"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">หมายเหตุ</v-col>
              <v-col cols="12">
                <v-text-field ref="discountField" label="กรุณาระบุหมายเหตุ **ถ้ามี"
                  v-model="ingredientStore.importDescription" dense hide-details variant="solo"></v-text-field>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn @click="saveAndClearForm" color="success" class="button-full-width">
              <v-icon left>mdi-plus</v-icon>
              บันทึกข้อมูล
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

  </v-container>
</template>
<script lang="ts" setup>
import { ref, watch, onMounted, computed } from "vue";
import { useIngredientStore } from "@/stores/Ingredient.store";
import Swal from "sweetalert2";
import type { VForm } from "vuetify/components";

const ingredientStore = useIngredientStore();
const searchQuery = ref("");
const formRef = ref<VForm | null>(null);
const storeField = ref(null);
const discountField = ref(null);
const totalField = ref(null);
const newIngredientName = ref("");
onMounted(async () => {
  await ingredientStore.getIngredients();

});

watch(searchQuery, async (newQuery) => {
  if (newQuery.length >= 3) {
    await ingredientStore.searchIngredients(newQuery);
  } else if (newQuery.length === 0) {
    await ingredientStore.getAllIngredients();
  }
});

function onSearch() {
  if (searchQuery.value.length >= 3) {
    ingredientStore.searchIngredients(searchQuery.value);
  } else if (searchQuery.value.length === 0) {
    ingredientStore.getAllIngredients();
  }
}

const rules = {
  required: (value: any) => !!value || "กรุณากรอกข้อมูล",
  name: (value: string) =>
    /^[a-zA-Zก-๙\s]+$/.test(value) || "ชื่อหมวดหมู่ต้องเป็นตัวอักษรเท่านั้น",
  number: (value: any) => /^[0-9]+$/.test(value) || "กรุณากรอกข้อมูลเป็นตัวเลข",
};

const confirmSave = () => {
  return Swal.fire({
    title: "คุณแน่ใจหรือไม่?",
    text: "คุณต้องการที่จะบันทึกข้อมูลนี้หรือไม่?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ใช่, บันทึกข้อมูล",
    cancelButtonText: "ไม่, ยกเลิก",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      saveData();
      return true;
    }
    return false;
  });
};

const saveData = () => {
  ingredientStore.saveImportData();
  Swal.fire({
    title: "บันทึกข้อมูลสำเร็จ!",
    icon: "success",
    confirmButtonText: "ตกลง",
  });
};

const saveAndClearForm = async () => {
  const confirmed = await confirmSave();
  if (confirmed) {
    resetForm();
  }
};

const resetForm = () => {
  ingredientStore.ingredientList = [];
  ingredientStore.store = "";
  ingredientStore.discount = 0;
  ingredientStore.total = 0;

  // Clear each field's validation and reset value
  if (storeField.value) {
    storeField.value.$el.querySelector("input").value = "";
    storeField.value.resetValidation();
  }
  if (discountField.value) {
    discountField.value.$el.querySelector("input").value = "";
    discountField.value.resetValidation();
  }
  if (totalField.value) {
    totalField.value.$el.querySelector("input").value = "";
    totalField.value.resetValidation();
  }
};
watch(() => ingredientStore.importStoreType, (newType) => {
  ingredientStore.ingredientList = [];
});
// const computedTotal = computed(() => {
//   if (ingredientStore.importStoreType === 'ร้านกาแฟ') {
//     return ingredientStore.ingredientList.reduce((total, item) => {
//       return total + (item.totalunit || 0);
//     }, 0) - (ingredientStore.discount || 0);
//   }
//   return 0;
// });
// Reverse Index Function
const reversedIndex = (index: number) => {
  return ingredientStore.ingredientList.length - 1 - index;
};

// Computed Reversed List
const reversedIngredientList = computed(() => {
  return [...ingredientStore.ingredientList].reverse();
});
</script>

<style scoped>
.button-full-width {
  width: 100%;
}

.styled-input {
  width: 100%;
  padding: 6px; /* ลดขนาด padding */
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 12px; /* ลดขนาด font */
}

.styled-input:focus {
  border-color: #66afe9;
  outline: none;
  box-shadow: 0 0 8px rgba(102, 175, 233, 0.6);
}

.styled-button {
  padding: 4px 8px; /* ลดขนาด padding */
  border: none;
  border-radius: 4px;
  background-color: #d9534f;
  color: white;
  font-size: 12px; /* ลดขนาด font */
  cursor: pointer;
}

.styled-button:hover {
  background-color: #c9302c;
}

th,
td {
  padding-top: 8px !important; /* ลดขนาด padding */
  padding-bottom: 8px !important;
  text-align: center !important;
  font-size: 12px; /* ลดขนาด font */
}

th {
  background-color: #f9f9f9;
}

tbody tr:nth-child(odd) {
  background-color: #f2f2f2;
}

/* Responsive styles */
@media (max-width: 768px) {
  .styled-input, .styled-button {
    font-size: 10px;
  }

  th, td {
    font-size: 10px;
    padding: 6px !important;
  }

  .button-full-width {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .styled-input, .styled-button {
    font-size: 8px;
  }

  th, td {
    font-size: 8px;
    padding: 4px !important;
  }

  .button-full-width {
    font-size: 8px;
  }

  th, td {
    white-space: nowrap;
  }
  
  v-container {
    padding: 0; /* ลด padding ของ container */
  }
  
  v-card {
    margin: 0; /* ลด margin ของ card */
  }
}
</style>

