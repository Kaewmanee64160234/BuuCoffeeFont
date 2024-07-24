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
        <v-row>
          <v-col cols="9" style="padding: 20px;">
          <h3>Dashboard</h3>
          </v-col>
        </v-row>
        <v-row>
  <v-col cols="4">
    <v-btn
      color="success"
      class="button-full-width"
      block
      @click="showComponent('finance')"
    >
    <v-icon left size="30">mdi-store</v-icon>
      รายงานยอดขาย
    </v-btn>
  </v-col>
  <v-col cols="4">
    <v-btn
      color="success"
      class="button-full-width"
      block
      @click="showComponent('ingredient')"
    >
      <v-icon left size="25">mdi-cart-arrow-down</v-icon>
      รายงานวัตถุดิบ
    </v-btn>
  </v-col>
  <v-col cols="4">
    <v-btn
      color="success"
      class="button-full-width"
      block
      @click="showComponent('product')"
    >
      <v-icon left size="25">mdi-cart-percent</v-icon>
      รายงานสินค้า และ โปรโมชั่น
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
