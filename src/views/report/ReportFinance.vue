<script lang="ts" setup>
import { ref } from 'vue';
import ReportFinanceComponant from '@/components/reports/ReportFinanceComponant.vue';
import ReportIngredientComponant from '@/components/reports/ReportIngredientComponant.vue';
import ReportProductComponant from '@/components/reports/ReportProductComponant.vue';

const activeComponent = ref<string | null>(null);

function showComponent(component: string) {
  activeComponent.value = component;
}
activeComponent.value = 'finance'; 
function reloadData() {
}
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row class="d-flex align-center justify-space-between">
          <v-col cols="auto">
            <h3>Dashboard</h3>
          </v-col>
          
          <v-col cols="auto">
            <v-btn
              color="success"
              class="button-full-width"
              @click="showComponent('finance')"
            >
              <v-icon left>mdi-filter</v-icon>
              ยอดขาย
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="success"
              class="button-full-width"
              @click="showComponent('ingredient')"
            >
              <v-icon left>mdi-filter</v-icon>
              วัสถุดิบ
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="success"
              class="button-full-width"
              @click="showComponent('product')"
            >
              <v-icon left>mdi-filter</v-icon>
              สินค้า
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col>
            <component :is="activeComponent === 'finance' ? ReportFinanceComponant : null" @reloadData="reloadData" />
            <component
              :is="activeComponent === 'ingredient' ? ReportIngredientComponant : null"
            />
            <component
              :is="activeComponent === 'product' ? ReportProductComponant : null"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>
