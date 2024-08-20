<script lang="ts" setup>
import { onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useIngredientStore } from '@/stores/Ingredient.store';
import { useSubIngredientStore } from '@/stores/ingredientSubInventory.store';

const ingredientStore = useIngredientStore();
const subIngredientStore = useSubIngredientStore();


onMounted(async () => {
    await subIngredientStore.getSubIngredients_coffee();
});

const saveCheckData = async () => {
    try {
        const confirmation = await Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: 'คุณต้องการบันทึกข้อมูลนี้หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ใช่, บันทึก!',
            cancelButtonText: 'ไม่, ยกเลิก!',
        });

        if (confirmation.isConfirmed) {
            Swal.fire({
                title: 'กำลังบันทึกข้อมูล...',
                text: 'กรุณารอสักครู่ขณะที่เราบันทึกข้อมูลของคุณ.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            ingredientStore.shopType = 'coffee';
            ingredientStore.actionType = 'return';

            // ส่งช้อมูล
            await ingredientStore.createReturnWithdrawalIngredients();
            ingredientStore.ingredientCheckList = [];
            await subIngredientStore.getSubIngredients_coffee();

            Swal.fire({
                title: 'สำเร็จ!',
                text: 'ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว.',
                icon: 'success',
                confirmButtonText: 'ตกลง'
            });
        }
    } catch (error) {
        console.error('Error saving check data:', error);

        Swal.fire({
            title: 'เกิดข้อผิดพลาด!',
            text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลของคุณ.',
            icon: 'error',
        });
    }
};
const findQuantity = (ingredientId: number | undefined): number => {
    if (!ingredientId) return 0;
    const ingredient = subIngredientStore.subingredients_coffee.find(
        (item) => item.ingredient.ingredientId === ingredientId
    );
    return ingredient ? ingredient.quantity : 0;
};
</script>
<template>
    <v-container fluid style="padding-left: 80px;">
        <v-card-title>
            <v-row>
                <v-col cols="9" style="padding: 20px;">
                    <h3>คืนวัตถุดิบเหลือร้านกาแฟ</h3>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="3">
                    <v-text-field label="ค้นหาวัตถุดิบ" append-inner-icon="mdi-magnify" dense hide-details
                        variant="solo" outlined v-model="ingredientStore.search"></v-text-field>
                </v-col>
                <v-col cols="auto">
                    <v-btn color="success" :to="{ name: 'ingredients_coffee' }">
                        <v-icon left>mdi-arrow-u-left-top-bold </v-icon> ย้อนกลับ
                    </v-btn>
                </v-col>
            </v-row>
            <v-spacer></v-spacer>

        </v-card-title>
        <v-row>
            <v-col cols="6" class="d-flex flex-column">
                <v-container>
                    <v-row>
                        <v-col cols="3" style="text-align: center; padding: 8px"
                            v-for="(item, index) in subIngredientStore.subingredients_coffee" :key="index">
                            <v-card v-if="item.quantity > 0" width="100%"
                                @click="ingredientStore.Addingredienttotable(item.ingredient)">
                                <v-img :src="`http://localhost:3000/ingredients/${item.ingredient.ingredientId}/image`"
                                    height="100"></v-img>
                                <v-card-title style="font-size: 14px">{{ item.ingredient.ingredientName
                                    }}</v-card-title>
                                <v-card-subtitle style="font-size: 12px">{{ item.ingredient.ingredientSupplier
                                    }}</v-card-subtitle>
                                <v-card-subtitle style="font-size: 12px">จำนวนที่เบิก : {{ item.quantity
                                    }}</v-card-subtitle>
                            </v-card>
                        </v-col>
                    </v-row>


                </v-container>
            </v-col>
            <v-col cols="6" class="d-flex flex-column">
                <v-card style="height: 400px; overflow-y: auto; width: 100%">
                    <v-table style="max-height: 100%; overflow-y: auto">
                        <thead>
                            <tr>
                                <th>ลำดับ</th>
                                <th>ชื่อสินค้า</th>
                                <th>แบรนด์</th>
                                <th>จำนวนที่เบิก</th>
                                <th>จำนวนที่เหลือ</th>
                                <th>แอคชั่น</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in ingredientStore.ingredientCheckList" :key="index">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.ingredientcheck.ingredientName }}</td>
                                <td>{{ item.ingredientcheck.ingredientSupplier }}</td>
                                <td>{{ findQuantity(item.ingredientcheck.ingredientId) }}</td>
                                <td>
                                    <input type="number" v-model.number="item.count" class="styled-input" />
                                </td>

                                <td>
                                    <button @click="ingredientStore.removeCheckIngredient(index)" class="styled-button">
                                        ลบ
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card>

                <v-row>
                    <v-col cols="12">
                        <v-row>
                            <v-col cols="12">หมายเหตุ</v-col>
                            <v-col cols="12">
                                <v-text-field v-model="ingredientStore.checkDescription"
                                    label="กรุณาระบุหมายเหตุ **ถ้ามี" dense hide-details variant="solo"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row> <v-col>
                        <v-btn color="success" class="button-full-width" @click="saveCheckData">
                            <v-icon left>mdi-plus</v-icon>
                            บันทึกข้อมูล
                        </v-btn>
                    </v-col></v-row>
            </v-col>

        </v-row>



    </v-container>
</template>
<style scoped>
.disabled-card {
    opacity: 0.5;
}

.button-full-width {
    width: 100%;
}

thead {
    position: sticky;
    top: 0;
    background-color: #ffffff;
    z-index: 2;
}

th {
    position: sticky;
    top: 0;
    background-color: #f9f9f9;
    z-index: 3;
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

th,
td {
    padding-top: 12px !important;
    padding-bottom: 12px !important;
    text-align: center !important;
}

.styled-input {
    border: 2px solid #ccc;
    border-radius: 4px;
    padding: 8px;
    font-size: 16px;
    width: 100%;
    box-sizing: border-box;
}

.styled-input:focus {
    border-color: #000000;
    outline: none;
}

.red-button {
    background-color: #EE4E4E;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 16px;
    border-radius: 4px;
}

.red-button:hover {
    background-color: #d43b3b;
}

@media (max-width: 1024px) {
    .styled-input {
        font-size: 14px;
        padding: 6px;
    }

    .red-button {
        font-size: 14px;
        padding: 8px 16px;
    }

    th,
    td {
        font-size: 14px;
        padding: 6px;
    }
}

@media (max-width: 768px) {
    .styled-input {
        font-size: 12px;
        padding: 4px;
    }

    .red-button {
        font-size: 12px;
        padding: 6px 12px;
    }

    th,
    td {
        font-size: 12px;
        padding: 4px;
    }

    .button-full-width {
        font-size: 12px;
    }

    thead,
    th {
        font-size: 10px;
    }

    td {
        font-size: 10px;
    }
}

@media (max-width: 480px) {
    .styled-input {
        font-size: 10px;
        padding: 2px;
    }

    .red-button {
        font-size: 10px;
        padding: 4px 8px;
    }

    th,
    td {
        font-size: 10px;
        padding: 2px;
    }

    .button-full-width {
        font-size: 10px;
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

    v-row,
    v-col {
        margin: 0;
        padding: 0;
    }
}
</style>
