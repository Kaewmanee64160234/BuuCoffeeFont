<script lang="ts" setup>
import { useIngredientStore } from '@/stores/Ingredient.store';
import { onMounted } from 'vue';
import ingredientService from "@/service/ingredient.service";
import Swal from 'sweetalert2';
const ingredientStore = useIngredientStore();

onMounted(async () => {
  await ingredientStore.getAllIngredients();
  ingredientStore.ingredients.forEach(item => {
    ingredientStore.Addingredienttotable(item);
  });
});

const saveCheckData = async () => {
  const ingredientList = ingredientStore.ingredientCheckList.map((item, index) => ({
    ingredientId: item.ingredientcheck.ingredientId!,
    UsedQuantity: item.count, 
  }));

  const checkIngredientsPayload = {
    date: new Date().toISOString(),
    userId: 1,
    checkingredientitems: ingredientList,
  };

  console.log("Sending data to API:", checkIngredientsPayload);

  try {
    // ยืนยันก่อนส่งข้อมูล
    const confirmation = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการบันทึกข้อมูลนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, บันทึก!',
      cancelButtonText: 'ไม่, ยกเลิก!',
    });

    if (confirmation.isConfirmed) {
      // แสดงการส่งข้อมูล
      Swal.fire({
        title: 'กำลังบันทึกข้อมูล...',
        text: 'กรุณารอสักครู่ขณะที่เราบันทึกข้อมูลของคุณ.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await ingredientService.createCheckIngredients(checkIngredientsPayload);
      console.log("API response:", response);

      // แสดงผลลัพธ์เมื่อสำเร็จ
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว.',
        icon: 'success',
      });
    } else {
      Swal.fire('ยกเลิก', 'ข้อมูลของคุณไม่ได้ถูกบันทึก.', 'error');
    }
  } catch (error) {
    console.error("Error saving check data:", error);

    // แสดงผลลัพธ์เมื่อเกิดข้อผิดพลาด
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลของคุณ.',
      icon: 'error',
    });
  }
};

const logQuantity = (item) => {
  // Update item.count ให้เป็นค่าที่ป้อนเข้ามาใน input ของแต่ละ item
  item.count = item.ingredientcheck.ingredientQuantityInStock;
  console.log("Quantity changed:", item.count);
};
</script>

<template>
    <v-container fluid>
        <v-card style="height: 100vh; width: 100vw; overflow-y: auto;">
            <v-card-title>
                <v-row>
                    <v-col cols="9">
                        เช็ควัตถุดิบ
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="3">
                        <v-text-field label="ค้นหาวัตถุดิบ" append-inner-icon="mdi-magnify" hide-details dense
                            v-model="ingredientStore.search"></v-text-field>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn color="success" :to="{ name: 'ingredients' }">
                            รายการวัตถุดิบ
                        </v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn color="warning" :to="{ name: 'checkingredientHistory' }">
                            ประวัติเช็ควัตถุดิบ
                        </v-btn>
                    </v-col>
                    <v-col>
                            <v-btn  @click="saveCheckData ">
                                <v-icon left>mdi-plus</v-icon>
                                บันทึกข้อมูล
                            </v-btn>
                        </v-col>
                </v-row>
                <v-spacer></v-spacer>
            </v-card-title>
            <v-row>
                <v-col>

     

                    <v-card style=" overflow-y: auto; width: 100%;">
                        <v-table style="max-height: 100%; overflow-y: auto;">
                            <thead>
                                <tr>
                                    <th>ลำดับ</th>
                                    <th>รูปภาพ</th>
                                    <th>ชื่อวัตถุดิบ</th>
                                    <th>ซัพพาย</th>
                                    <th>ขั้นต่ำ</th>
                                    <th>จำนวน</th>
                                    <th>แอคชั่น</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in ingredientStore.ingredientCheckList" :key="index">
                                    <td>{{ index + 1 }}</td>
                                    <td>
                                        <v-img :src="`http://localhost:3000/ingredients/${item.ingredientcheck.ingredientId}/image`"
                                            height="100"></v-img>
                                    </td>
                                    <td>{{ item.ingredientcheck.ingredientName }}</td>
                                    <td>{{ item.ingredientcheck.ingredientSupplier }}</td>
                                    <td>{{ item.ingredientcheck.ingredientMinimun }}</td>
                                    <td>
                    <input type="number"
                           v-model.number="item.ingredientcheck.ingredientQuantityInStock"
                           class="styled-input"
                           @change="logQuantity(item)">
                  </td>
                                    <td><button @click="ingredientStore.removeIngredient(index)">ลบ</button></td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card>
                </v-col>
                
      
            </v-row>
        </v-card>
    </v-container>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;400;500;600;700;800;900&display=swap');

* {
    font-family: 'Kanit', sans-serif;
}

thead {
  position: sticky;
  top: 0;
  background-color: #ffffff;
  z-index: 2; /* ปรับค่า Z-index ตามต้องการเพื่อให้หัวตารางแสดงทับส่วนอื่นได้ */
}

th {
  position: sticky;
  top: 0;
  background-color: #f9f9f9; /* เพิ่มสีพื้นหลังหัวตาราง */
  z-index: 3; /* ปรับค่า Z-index ตามต้องการเพื่อให้หัวตารางแสดงทับส่วนอื่นได้ */
}
.v-data-table {
  border-collapse: collapse;
  width: 100%;
}

.v-data-table th,
.v-data-table td {
  border: 1px solid #dddddd;
  padding: 8px;
}

.v-data-table th {
  background-color: #f2f2f2;
  text-align: left;
}

.v-data-table tbody tr:nth-child(odd) {
  background-color: #f9f9f9;
}

.v-data-table tbody tr:hover {
  background-color: #f2f2f2;
}

.v-data-table img {
  max-width: 100px;
  max-height: 100px;
}
th, td {
  padding-top: 12px !important; 
  padding-bottom: 12px !important; 
  text-align: center !important; 
}
</style>
