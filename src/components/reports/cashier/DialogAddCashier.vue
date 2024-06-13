<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useReportFinnceStore } from '@/stores/report/finance.store';
const props = defineProps({
  dialogVisible: Boolean
});
const ReportFinnceStore = useReportFinnceStore();
const clearData = () => {
    ReportFinnceStore.createCashierDialog = false;
};
watch(() => props.dialogVisible, (newValue) => {
  ReportFinnceStore.createCashierDialog = newValue;
});
</script>

<template>
  <v-dialog v-model="ReportFinnceStore.createCashierDialog" max-width="500px">
    <v-card>
      <v-card-title>
        Test
      </v-card-title>
      <v-card-actions>
        <v-btn @click="clearData">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
