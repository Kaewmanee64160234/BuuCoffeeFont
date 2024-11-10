<template>
  <v-container fluid style="padding-left: 80px">
    <v-card-title>
      <v-row>
        <v-col cols="9" style="padding: 10px">นำเข้าวัตถุดิบ</v-col>
      </v-row>
      <v-row>
        <v-col cols="3">
          <v-text-field label="ค้นหาวัตถุดิบ" append-inner-icon="mdi-magnify" dense hide-details variant="solo"
            v-model="searchQuery" @input="onSearch"></v-text-field>
        </v-col>
        <v-col cols="auto">
          <v-btn color="success" :to="{ name: 'ingredients' }">
            <v-icon left>mdi-arrow-u-left-top-bold </v-icon> ย้อนกลับ
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn color="warning" :to="{ name: 'importingredientsHistory' }">ประวัตินำเข้าวัตถุดิบ</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-row align="center">
            <v-col cols="auto" style="padding: 5px">
              <v-radio-group v-model="ingredientStore.TypeIngredient" row :rules="[rules.required]">
                <v-radio label="รายการวัตถุดิบ" value="รายการวัตถุดิบ"></v-radio>
                <v-radio label="สำหรับวัตถุดิบของสด" value="รายการวัตถุดิบสด"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="auto">
          <v-card-title ref="storeField" dense hide-details variant="solo">
            ราคารวม : {{ computedTotal }}
          </v-card-title>
        </v-col>
      </v-row>

      <v-spacer></v-spacer>
    </v-card-title>
    <v-row>
      <v-col cols="6" class="d-flex flex-column">
        <v-container>
          <v-row>
            <template v-if="ingredientStore.TypeIngredient === 'รายการวัตถุดิบ'">
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
            <template v-else-if="ingredientStore.TypeIngredient === 'รายการวัตถุดิบสด'">
              <v-col cols="12" style="text-align: center; padding: 8px">
                <v-text-field v-model="newIngredientName" label="ชื่อวัตถุดิบ" required variant="solo" @keyup.enter="
                  ingredientStore.AddRiceIngredient({
                    ingredientName: newIngredientName,
                  })
                  "></v-text-field>
                <v-btn @click="
                  ingredientStore.AddRiceIngredient({
                    ingredientName: newIngredientName,
                  })
                  ">เพิ่มวัตถุดิบ</v-btn>
              </v-col>
            </template>
          </v-row>
        </v-container>
      </v-col>
      <v-col cols="6" class="d-flex flex-column" style="padding: 2px">
        <v-card style="height: 400px; overflow-y: auto; width: 100%;">
          <v-table style="max-height: 100%; overflow-y: auto;">
            <thead>
              <tr>
                <th style="white-space: nowrap; font-size: 16px">ลำดับ</th>
                <th style="white-space: nowrap;font-size: 16px">รายการสินค้า</th>
                <th style="white-space: nowrap;font-size: 16px" v-if="ingredientStore.TypeIngredient === 'รายการวัตถุดิบ'">
                  จำนวน
                </th>
                <th style="white-space: nowrap;font-size: 16px" v-if="ingredientStore.TypeIngredient === 'รายการวัตถุดิบ'">
                  ราคา
                </th>
                <th style="white-space: nowrap;font-size: 16px">ส่วนลด</th>
                <th style="white-space: nowrap;font-size: 16px" v-if="ingredientStore.TypeIngredient === 'รายการวัตถุดิบ'">
                  จำนวนเงิน
                </th>
                <th style="white-space: nowrap;font-size: 16px" v-if="ingredientStore.TypeIngredient === 'รายการวัตถุดิบ'">
                  หน่วย
                </th>
                <th style="white-space: nowrap;font-size: 16px">แอคชั่น</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in reversedIngredientList" :key="index">
                <td style="white-space: nowrap; font-size: 16px">{{ index + 1 }}</td>
                <td style="white-space: nowrap; font-size: 16px">
                  {{
                    ingredientStore.TypeIngredient === "รายการวัตถุดิบสด"
                      ? item.name
                      : item.ingredient?.ingredientName
                  }}
                </td>
                <td style="white-space: nowrap; font-size: 16px" v-if="ingredientStore.TypeIngredient === 'รายการวัตถุดิบ'">
                  <input type="number" v-model.number="item.count" class="styled-input" min="1" />
                </td>
                <td style="white-space: nowrap; font-size: 16px" v-if="ingredientStore.TypeIngredient === 'รายการวัตถุดิบ'">
                  <input type="number" v-model.number="item.unitprice" class="styled-input" min="0" />
                </td>
                <td style="white-space: nowrap; font-size: 16px" v-if="ingredientStore.TypeIngredient === 'รายการวัตถุดิบ'">
                  <input type="number" v-model.number="item.discount" class="styled-input" min="0" />
                </td>
                <td style="white-space: nowrap; font-size: 16px" v-if="ingredientStore.TypeIngredient === 'รายการวัตถุดิบ'">
                  {{ calculateTotal(item) }}
                </td>
                <td style="white-space: nowrap; font-size: 16px" v-if="ingredientStore.TypeIngredient === 'รายการวัตถุดิบ'">
                  <!-- Wrap the radio buttons in a container to align them on the same line -->
                  <div class="d-flex align-center">
                    <label>
                      <input type="radio" v-model="item.importType" value="piece" />
                      ชิ้น
                    </label>
                    <label class="ml-2">
                      <input type="radio" v-model="item.importType" value="box" />
                      แพ็ค
                    </label>
                  </div>
                </td>
                <td >
                  <button
                    style="white-space: nowrap; font-size: 16px"
                    @click="ingredientStore.removeIngredient(reversedIndex(index))"
                    class="styled-button"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      
       <!-- add butiin to save -->
        <v-row>
          <v-col cols="12" class="d-flex justify-center">
            <v-btn color="success" @click="saveAndClearForm" class="button-full-width">บันทึก</v-btn>
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
const ingredientStore = useIngredientStore();
const searchQuery = ref("");
const storeField = ref(null);
const discountField = ref(null);
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

// const resetForm = () => {
//   ingredientStore.ingredientList = [];
//   ingredientStore.store = "";
//   ingredientStore.discount = 0;
//   ingredientStore.total = 0;

//   // Clear each field's validation and reset value
//   if (storeField.value) {
//     storeField.value.$el.querySelector("input").value = "";
//     storeField.value.resetValidation();
//   }
//   if (discountField.value) {
//     discountField.value.$el.querySelector("input").value = "";
//     discountField.value.resetValidation();
//   }
//   if (totalField.value) {
//     totalField.value.$el.querySelector("input").value = "";
//     totalField.value.resetValidation();
//   }
// };
watch(
  () => ingredientStore.TypeIngredient,
  (newType) => {
    ingredientStore.ingredientList = [];
  }
);
const computedTotal = computed(() => {
  let total = 0;

  if (ingredientStore.TypeIngredient === "รายการวัตถุดิบ") {
    total = ingredientStore.ingredientList.reduce((sum, item) => {
      return sum + calculateTotal(item); // ใช้ calculateTotal เพื่อคำนวณแต่ละรายการ
    }, 0);
  } else if (ingredientStore.TypeIngredient === "รายการวัตถุดิบสด") {
    total = ingredientStore.total || 0;
  }

  const discountAmount = ingredientStore.discount || 0;
  const taxAmount = Number(ingredientStore.tax) || 0;
  
  return  total - discountAmount - taxAmount;
});



const reversedIndex = (index: number): number => {
  return ingredientStore.ingredientList.length - 1 - index;
};

const reversedIngredientList = computed(() => {
  return [...ingredientStore.ingredientList].reverse();
});
function calculateTotal(item: any) {
  const count = item.count || 0;
  const unitprice = item.unitprice || 0;
  const discount = item.discount || 0;
  const total = (count * unitprice) - discount;
  return total > 0 ? total : 0;
}
function resetForm() {
  throw new Error("Function not implemented.");
}
</script>

<style scoped>
.button-full-width {
  width: 100%;
}

.styled-input {
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 12px;
}

.styled-input:focus {
  border-color: #66afe9;
  outline: none;
  box-shadow: 0 0 8px rgba(102, 175, 233, 0.6);
}

.styled-button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background-color: #d9534f;
  color: white;
  font-size: 12px;
  cursor: pointer;
}

.styled-button:hover {
  background-color: #c9302c;
}

th,
td {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  text-align: center !important;
  font-size: 12px;
}

th {
  background-color: #f9f9f9;
}

tbody tr:nth-child(odd) {
  background-color: #f2f2f2;
}

@media (max-width: 768px) {

  .styled-input,
  .styled-button {
    font-size: 10px;
  }

  th,
  td {
    font-size: 10px;
    padding: 6px !important;
  }

  .button-full-width {
    font-size: 10px;
  }
}

@media (max-width: 480px) {

  .styled-input,
  .styled-button {
    font-size: 8px;
  }

  th,
  td {
    font-size: 8px;
    padding: 4px !important;
  }

  .button-full-width {
    font-size: 8px;
  }

  th,
  td {
    white-space: nowrap;
  }

  v-container {
    padding: 0;
  }

  v-card {
    margin: 0;
  }
}
</style>
