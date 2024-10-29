<script lang="ts" setup>
import { useIngredientStore } from '@/stores/Ingredient.store';
import IngredientDialog from "@/views/ingredient/IngredientDialog.vue";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRouter } from 'vue-router';
import { jsPDF } from 'jspdf';
import Swal from 'sweetalert2';
import JsBarcode from 'jsbarcode';
import SarabunFont from '@/assets/Sarabun/Sarabun-Medium.base64';
const ingredientStore = useIngredientStore();
const router = useRouter();

const menu1 = ref(false);
const menu2 = ref(false);
const menu3 = ref(false);
const paginate = ref(true);
const page = computed(() => ingredientStore.page);
const take = computed(() => ingredientStore.take);


onMounted(async () => {
  await ingredientStore.getAllIngredients();
});



const exportIngredients = async () => {
  try {
    await ingredientStore.getAllIngredients();

    const doc = new jsPDF();
    doc.addFileToVFS('Sarabun.ttf', SarabunFont);
    doc.addFont('Sarabun.ttf', 'Sarabun', 'normal');
    doc.setFont('Helvetica');




    const lineHeight = 30;
    // await nextTick();

    const barcodeContainer = document.createElement('div');
    barcodeContainer.style.display = 'none';
    document.body.appendChild(barcodeContainer);
    doc.text('สวัสดีครับ', 10, 10);

    for (const ingredient of ingredientStore.ingredients) {
      const { ingredientName, ingredientBarcode } = ingredient;

      console.log(`Name: ${ingredientName}, Barcode: ${ingredientBarcode}`);

      if (ingredientName && ingredientBarcode) {
        const canvas = document.createElement('canvas');
        barcodeContainer.appendChild(canvas);

        JsBarcode(canvas, ingredientBarcode, { format: "CODE128" });

        doc.text(ingredientName, 10, lineHeight * (ingredientStore.ingredients.indexOf(ingredient) + 1));

        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, 'PNG', 100, lineHeight * (ingredientStore.ingredients.indexOf(ingredient) + 1) - 5, 50, 20);
      } else {
        console.error(`Missing ingredientName or ingredientBarcode for ingredient: ${ingredient}`);
      }
    }

    document.body.removeChild(barcodeContainer);
    doc.save('ingredients.pdf');
  } catch (error) {
    console.error(error);
    Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถส่งออกวัตถุดิบได้.', 'error');
  }
};


const deleteIngredient = async (id?: number) => {
  if (id !== undefined) {
    try {
      const confirmation = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: 'คุณต้องการลบวัตถุดิบนี้หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ลบ!',
        cancelButtonText: 'ไม่, ยกเลิก!',
      });

      if (confirmation.isConfirmed) {
        await ingredientStore.deleteIngredient(id);
        Swal.fire({
          title: 'ลบสำเร็จ',
          text: 'วัตถุดิบถูกลบเรียบร้อยแล้ว!',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        });
      }
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดขณะลบวัตถุดิบ.', 'error');
    }
  } else {
    console.error("Ingredient ID is undefined");
  }
};

const navigateTo = (routeName: string) => {
  router.push('/' + routeName);
};

watch(paginate, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await ingredientStore.getAllIngredients();
  }
})
</script>

<template>
  <IngredientDialog></IngredientDialog>
  <v-container v-if="paginate">
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9" style="padding: 10px;">
            <h3>คลังวัตถุดิบ</h3>
          </v-col>
          <v-col cols="3">
            <v-btn @click="exportIngredients">  <v-icon left>mdi-barcode</v-icon>Barcode</v-btn>
          </v-col>
          <v-col cols="3">
            <v-text-field style="height: fit-content;" label="ค้นหารายการวัตถุดิบ" append-inner-icon="mdi-magnify" dense
              hide-details variant="solo" outlined v-model="ingredientStore.keyword"></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-btn color="success" class="button-full-width" @click="ingredientStore.dialog = true">

              <v-icon left>mdi-plus</v-icon>
              เพิ่มวัตถุดิบ
            </v-btn>
          </v-col>


          <v-col>
            <v-menu v-model="menu1">
              <template v-slot:activator="{ props }">
                <v-btn color="success" class="button-full-width" v-bind="props">
                  <v-icon left>mdi-arrow-down-thick</v-icon>
                  นำเข้าวัตถุดิบ
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="navigateTo('importingredient')">
                  <v-list-item-title>นำเข้าวัตถุดิบ</v-list-item-title>
                </v-list-item>
                <v-list-item @click="navigateTo('importingredient-history')">
                  <v-list-item-title>ประวัติการนำเข้าวัตถุดิบ</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>

          <v-col>
            <v-menu v-model="menu2">
              <template v-slot:activator="{ props }">
                <v-btn color="red" class="button-full-width" v-bind="props">
                  <v-icon left>mdi-arrow-up-thick</v-icon>
                  วัตถุดิบหมดอายุ / เสียหาย
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="navigateTo('checkingredient')">
                  <v-list-item-title> นำออกวัตถุดิบ </v-list-item-title>
                </v-list-item>
                <v-list-item @click="navigateTo('checkingredient-history')">
                  <v-list-item-title>ประวัตินำออกวัตถุดิบ </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col>
            <v-menu v-model="menu3">
              <template v-slot:activator="{ props }">
                <v-btn color="red" class="button-full-width" v-bind="props">
                  <v-icon left>mdi-swap-vertical-bold</v-icon>
                  ประวัติเบิกเข้า - เบิกออก
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="navigateTo('history-coffee-store')">
                  <v-list-item-title> ร้านกาแฟ </v-list-item-title>
                </v-list-item>
                <v-list-item @click="navigateTo('history-rice-store')">
                  <v-list-item-title>ร้านข้าว </v-list-item-title>
                </v-list-item>
                <v-list-item @click="navigateTo('history-catering-store')">
                  <v-list-item-title>ร้านเลี้ยงรับรอง </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-card-title>

      <v-table class="mx-auto" style="width: 97%">
        <thead>
          <tr>
            <th style="text-align: center;font-weight: bold;">รหัสวัตถุดิบ</th>
            <th style="text-align: center;font-weight: bold;">รูปภาพ</th>
            <th style="text-align: center;font-weight: bold;">ชื่อวัตถุดิบ</th>
            <th style="text-align: center;font-weight: bold;">ผู้จัดจำหน่าย</th>
            <th style="text-align: center;font-weight: bold;">หน่วยใหญ่</th>
            <th style="text-align: center;font-weight: bold;">จำนวนที่มีในคลัง</th>
            <th style="text-align: center;font-weight: bold;">การกระทำ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in ingredientStore.ingredients" :key="index">
            <td>{{ (page - 1) * take + index + 1 }}</td>
            <td>
              <v-img :src="`http://localhost:3000/ingredients/${item.ingredientId}/image`" height="73"></v-img>
            </td>
            <td>{{ item.ingredientName }}</td>
            <td>{{ item.ingredientSupplier }}</td>
            <td>{{ item.ingredientQuantityPerUnit }} {{ item.ingredientQuantityPerSubUnit }} x {{
              item.ingredientVolumeUnit }}
            </td>
            <td :style="{ color: item.ingredientQuantityInStock <= item.ingredientMinimun ? 'red' : 'black' }">{{
              item.ingredientQuantityInStock }} {{ item.ingredientUnit }}</td>
            <td>
              <v-btn color="#FFDD83" class="mr-5" icon="mdi-pencil"
                @click="ingredientStore.setEditedIngredient(item)"></v-btn>
              <v-btn color="#FFDD83" class="mr-5" icon="mdi-delete"
                @click="deleteIngredient(item.ingredientId)"></v-btn>
            </td>
          </tr>
        </tbody>
        <tbody v-if="!ingredientStore.ingredients.length">
          <tr>
            <td colspan="9" class="text-center">No data</td>
          </tr>
        </tbody>
      </v-table>

      <v-pagination justify="center" v-model="ingredientStore.page" :length="ingredientStore.lastPage"
        rounded="circle"></v-pagination>
    </v-card>
  </v-container>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;400;500;600;700;800;900&display=swap');

* {
  font-family: 'Kanit', sans-serif;
}

.button-full-width {
  width: 100%;
}

th,
td {
  padding-top: 9px !important;
  padding-bottom: 9px !important;
  text-align: center !important;
}

.flex-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .v-card-title {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .v-col {
    padding: 10px 0;
  }

  .button-full-width {
    margin-bottom: 10px;
  }

  .v-text-field {
    width: 100%;
    margin-bottom: 10px;
  }

  .v-table {
    overflow-x: auto;
  }
}
</style>
