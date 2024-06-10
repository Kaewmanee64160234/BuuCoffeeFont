<template>
  <CreatePromotionDialog />
  <UpdatePromotionDialog />
  <v-container>
    <v-card>
      <v-card-title>
        <v-row style="padding: 20px;"><h3>โปรโมชั่น</h3></v-row>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field 
              v-model="promotionStore.searchQuery" 
              label="ค้นหาโปรโมชั่น" 
              append-inner-icon="mdi-magnify"
              hide-details 
              dense 
              variant="solo"
              @input="getPromotionsPaginate"
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="3" class="d-flex justify-center align-center">
            <v-btn @click="openCreateDialog" style="background-color: #8ad879; color: white" block>
              <v-icon left>mdi-plus</v-icon>
              เพิ่มโปรโมชั่น
            </v-btn>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <v-table class="text-center mt-5">
          <thead>
            <tr>
              <th style="text-align: center;font-weight: bold;">รหัสโปรโมชั่น</th>
              <th style="text-align: center;font-weight: bold;">ชื่อโปรโมชั่น</th>
              <th style="text-align: center;font-weight: bold;">ประเภทโปรโมชั่น</th>
              <th style="text-align: center;font-weight: bold;">มูลค่าส่วนลด</th>
              <th style="text-align: center;font-weight: bold;">การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="promotion in promotionStore.promotions" :key="promotion.promotionId" style="text-align: center;">
              <td>{{ promotion.promotionId }}</td>
              <td>{{ promotion.promotionName }}</td>
              <td>{{ promotion.promotionType }}</td>
              <td>{{ promotion.discountValue === null ? '-' : promotion.discountValue }}</td>
              <td>
                <v-btn color="#FFDD83" icon="mdi-pencil" class="mr-2" @click="openUpdateDialog(promotion)">
                </v-btn>
                <v-btn color="#F55050" icon="mdi-delete" @click="deletePromotion(promotion.promotionId)">
                </v-btn>
              </td>
            </tr>
          </tbody>
          <tbody v-if="!promotionStore.promotions || promotionStore.promotions.length === 0">
            <tr>
              <td colspan="5" class="text-center">ไม่มีข้อมูล</td>
            </tr>
          </tbody>
        </v-table>
      
        <v-pagination
          v-model="promotionStore.currentPage"
          :length="Math.ceil(promotionStore.totalItems / promotionStore.itemsPerPage)"
          @input="promotionStore.getPromotionsPaginate"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </v-container>
</template>

    
  <script lang="ts" setup>
  import { usePromotionStore } from '@/stores/promotion.store';
  import { onMounted, ref } from 'vue';
  import Swal from 'sweetalert2';
  import CreatePromotionDialog from '@/components/promotions/CreatePromotionDialog.vue';
  import UpdatePromotionDialog from '@/components/promotions/UpdatePromotionDialog.vue';
import type { Promotion } from '@/types/promotion.type';
  
  const promotionStore = usePromotionStore();
  
  const headers = ref([
    { text: 'Promotion ID', value: 'promId' },
    { text: 'Promotion Name', value: 'promotionName' },
    { text: 'Promotion Type', value: 'promotionType' },
    { text: 'Discount Value', value: 'discountValue' },
    { text: 'Actions', value: 'actions', sortable: false },
  ]);
  
  onMounted(async () => {
    await promotionStore.getPromotionsPaginate();
  });
  
  const openCreateDialog = () => {
    promotionStore.promotion = null;
    promotionStore.createPromotionDialog = true;
  };
  
  const openUpdateDialog = (promotion: Promotion) => {
    promotionStore.promotion = { ...promotion };
    promotionStore.updatePromotionDialog = true;
  };
  
  const deletePromotion = async (promId: number) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });
  
      if (result.isConfirmed) {
        await promotionStore.deletePromotion(promId);
        Swal.fire('Deleted!', 'Promotion has been deleted.', 'success');
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
      Swal.fire('Error', 'An error occurred while deleting the promotion.', 'error');
    }
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  