<script lang="ts" setup>
import { onMounted, ref,watch } from 'vue';
import { useCateringEventStore } from '@/stores/historycatering.store';
import type { HistoryCateringEvent } from '@/types/catering/history_catering.type';
import dialogHistoryCatering from "@/views/ingredient/catering/dialogHistoryCatering.vue";

const cateringEventStore = useCateringEventStore();
const historyCheckDialog = ref(false);
const selectedCheck = ref<HistoryCateringEvent | null>(null);
const currentPage = ref(1); // Track the current page
const itemsPerPage = ref(cateringEventStore.itemsPerPage); // Sync items per page with store

// Function to load events for the selected page
const loadCateringEvents = async (page: number ) => {
  try {
    await cateringEventStore.cateringEventPaginate(page, itemsPerPage.value);
  } catch (error) {
    console.error('Failed to load catering events:', error);
  }
};

// Load events on component mount
onMounted(() => {
  loadCateringEvents(currentPage.value);
});

// Function to translate status codes to human-readable text
const translateStatus = (status: any) => {
  switch (status) {
    case 'pending':
      return 'รอดำเนินการ';
    case 'paid':
      return 'รายการสำเร็จ';
    case 'canceled':
      return 'ยกเลิก';
    default:
      return status;
  }
};

// Open a dialog to check details for a specific catering event
const openHistoryCheckDialog = async (checkcatering: HistoryCateringEvent) => {
  await cateringEventStore.getHistoryCateringById(checkcatering.eventId);
  cateringEventStore.historyCateringitem = checkcatering;
  cateringEventStore.dialogCateringItem = true;
};

// Handle page changes
const onPageChange = async (page: number) => {
  currentPage.value = page;
  await loadCateringEvents(page); // Fetch data for the selected page
};
// watch when chnage page 
watch(currentPage, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await loadCateringEvents(newValue);
  }
});
</script>


<template>
  <dialogHistoryCatering v-model:dialog="historyCheckDialog" :checkcatering="selectedCheck" />
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9">ประวัติจัดเลี้ยงรับรอง</v-col>
          <v-col cols="3">
            <v-text-field variant="solo" label="ค้นหาประวัติ" append-inner-icon="mdi-magnify" hide-details dense></v-text-field>
          </v-col>
        </v-row>
      </v-card-title>
      
      <v-row class="mt-5 mx-4">
        <v-text-field label="เริ่มวันที่" type="date" dense hide-details variant="solo" class="mr-4" />
        <v-text-field label="ถึงวันที่" type="date" dense hide-details variant="solo" class="mr-4" />
      </v-row>
      
      <v-table class="mt-5 mx-auto" style="width: 97%">
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>ชื่อการจัดเลี้ยง</th>
            <th>วันที่จัดเลี้ยง</th>
            <th>สถานที่จัดเลี้ยง</th>
            <th>งบประมาณ</th>
            <th>สถานะ</th>
            <th>แก้ไขสถานะ</th>
            <th>แอคชั่น</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="cateringEventStore.historyCateringEvent.length === 0">
            <td colspan="8" style="text-align: center;">ไม่มีข้อมูล</td>
          </tr>
          <tr v-for="(catering, index) in cateringEventStore.historyCateringEvent" :key="catering.eventId">
            <td style="text-align: center">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td>{{ catering.eventName }}</td>
            <td>{{ catering.eventDate }}</td>
            <td>{{ catering.eventLocation }}</td>
            <td style="text-align: right">{{ catering.totalBudget }} บาท</td>
            <td style="text-align: center">{{ translateStatus(catering.status) }}</td>
            <td style="text-align: center">
              <v-btn v-if="catering.status === 'pending'" color="#ed8731" class="mr-2"
                @click="cateringEventStore.updateStatus(catering.eventId, 'paid')">
                สำเร็จ
              </v-btn>
              <v-btn v-if="catering.status === 'pending'" color="red"
                @click="cateringEventStore.cancelEvent(catering.eventId)">
                ยกเลิก
              </v-btn>
            </td>
            <td>
              <v-btn v-if="catering.status !== 'canceled'" color="#ed8731" class="mr-2" icon="mdi-pencil"
                @click="openHistoryCheckDialog(catering)">
                <v-icon color="white" style="font-size: 20px">mdi-eye-circle</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
      
      <!-- Pagination Control -->
      <v-pagination
        v-model:page="currentPage"
        :length="Math.ceil(cateringEventStore.totalItems / itemsPerPage)"
        :total-visible="7"
        rounded="circle"
      />
    </v-card>
  </v-container>
</template>




<style scoped>
.red-text {
  color: red;
}

.yellow-text {
  color: #0d78f3;
}

.button-full-width {
  width: 100%;
}

th,
td {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  text-align: center !important;
}

@media (max-width: 1024px) {

  th,
  td {
    font-size: 14px;
    padding: 8px;
  }

  .button-full-width {
    font-size: 14px;
  }
}

@media (max-width: 768px) {

  th,
  td {
    font-size: 12px;
    padding: 6px;
  }

  .button-full-width {
    font-size: 12px;
  }
}

@media (max-width: 480px) {

  th,
  td {
    font-size: 10px;
    padding: 4px;
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
}
</style>
