<script lang="ts" setup>
import { useIngredientStore } from '@/stores/Ingredient.store';
import IngredientDialog from "@/components/stock/IngredientDialog.vue";
import { computed, onMounted, ref } from "vue";
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const ingredientStore = useIngredientStore();
const router = useRouter();

onMounted(async () => {
  await ingredientStore.getAllIngredients();
});

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
      Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดขณะลบวัตถุดิบ.', 'error');
    }
  }
};

const navigateTo = (routeName: string) => {
  router.push('/' + routeName);
};

</script>

<template>
  <IngredientDialog></IngredientDialog>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9">
            <h3>คลังวัตถุดิบ</h3>
          </v-col>
          <v-col cols="3">
            <v-text-field label="ค้นหารายการวัตถุดิบ" append-inner-icon="mdi-magnify" 
              variant="solo" outlined v-model="ingredientStore.keyword"></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="3">
            <v-btn color="success" class="button-full-width" @click="ingredientStore.dialog = true">
              <v-icon left>mdi-plus</v-icon>
              เพิ่มวัตถุดิบ
            </v-btn>
          </v-col>

          <v-col cols="3">
            <v-btn color="success" class="button-full-width" @click="navigateTo('importingredient')">
              <v-icon left>mdi-arrow-down-thick</v-icon>
              นำเข้าวัตถุดิบ
            </v-btn>
          </v-col>

          <v-col cols="3">
            <v-btn color="red" class="button-full-width" @click="navigateTo('checkingredient')">
              <v-icon left>mdi-arrow-up-thick</v-icon>
              ปรับคลังสต็อกวัตถุดิบ
            </v-btn>
          </v-col>

          <v-col cols="3">
            <v-btn color="warning" class="button-full-width" @click="navigateTo('checkingredient-history')">
              <v-icon left>mdi-history</v-icon>
              ประวัติการทำรายการ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-table class="mx-auto" style="width: 97%">
        <thead>
          <tr>
            <th class="text-center">ลำดับ</th>
            <th class="text-center">รูปภาพ</th>
            <th class="text-center">ชื่อวัตถุดิบ</th>
            <th class="text-center">ผู้จัดจำหน่าย</th>
            <th class="text-center">จำนวนที่มีในคลัง</th>
            <th class="text-center">การกระทำ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in ingredientStore.ingredients" :key="index">
            <td>{{ index + 1 }}</td>
            <td>
              <v-img :src="`http://localhost:3000/ingredients/${item.ingredientId}/image`" height="50"></v-img>
            </td>
            <td>{{ item.ingredientName }}</td>
            <td>{{ item.ingredientSupplier }}</td>
            <td :style="{ color: item.ingredientQuantityInStock <= item.ingredientMinimun ? 'red' : 'black' }">
              {{ item.ingredientQuantityInStock }} {{ item.ingredientUnit }}
            </td>
            <td>
              <v-btn color="warning" icon="mdi-pencil" class="mr-2"
                @click="ingredientStore.setEditedIngredient(item)"></v-btn>
              <v-btn color="error" icon="mdi-delete" 
                @click="deleteIngredient(item.ingredientId)"></v-btn>
            </td>
          </tr>
          <tr v-if="!ingredientStore.ingredients.length">
            <td colspan="6" class="text-center">ไม่พบข้อมูล</td>
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

th, td {
  text-align: center !important;
  padding: 12px !important;
  font-size: 14px;
}

@media (max-width: 960px) {
  .v-row {
    flex-direction: column;
  }
  
  .v-col {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>
